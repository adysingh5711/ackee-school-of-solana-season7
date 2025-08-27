use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

// Analytics and insights functionality

pub fn generate_user_insights(
    ctx: Context<GenerateUserInsights>,
) -> Result<()> {
    let user_insights = &mut ctx.accounts.user_insights;
    let user_stats = &ctx.accounts.user_stats;
    let clock = Clock::get()?;

    // Calculate insights based on user activity
    user_insights.user = ctx.accounts.user.key();
    user_insights.total_listening_time = calculate_total_listening_time(&user_stats)?;
    user_insights.favorite_genre = determine_favorite_genre(&ctx.accounts.user.key())?;
    user_insights.most_played_track = find_most_played_track(&ctx.accounts.user.key())?;
    user_insights.discovery_score = calculate_discovery_score(&user_stats)?;
    user_insights.social_engagement = calculate_social_engagement(&user_stats)?;
    user_insights.generated_at = clock.unix_timestamp;

    msg!("User insights generated");
    Ok(())
}

pub fn create_recommendation(
    ctx: Context<CreateRecommendation>,
    recommendation_type: u8,
    target: Pubkey,
    score: f32,
    reason: String,
) -> Result<()> {
    let recommendation = &mut ctx.accounts.recommendation;
    let clock = Clock::get()?;

    require!(reason.len() <= 128, SpotifyError::ReasonTooLong);
    require!(score >= 0.0 && score <= 1.0, SpotifyError::InvalidScore);

    recommendation.user = ctx.accounts.user.key();
    recommendation.recommendation_type = recommendation_type;
    recommendation.target = target;
    recommendation.score = score;
    recommendation.reason = reason;
    recommendation.created_at = clock.unix_timestamp;
    recommendation.is_viewed = false;

    msg!("Recommendation created for user");
    Ok(())
}

// Helper functions (simplified for demonstration)
fn calculate_total_listening_time(_user_stats: &UserStats) -> Result<u64> {
    // In a real implementation, this would aggregate all track plays
    Ok(0)
}

fn determine_favorite_genre(_user: &Pubkey) -> Result<String> {
    // In a real implementation, this would analyze user's listening history
    Ok("Unknown".to_string())
}

fn find_most_played_track(_user: &Pubkey) -> Result<Option<Pubkey>> {
    // In a real implementation, this would find the track with most plays
    Ok(None)
}

fn calculate_discovery_score(_user_stats: &UserStats) -> Result<f32> {
    // Discovery score based on variety of artists/genres listened to
    Ok(0.5)
}

fn calculate_social_engagement(_user_stats: &UserStats) -> Result<f32> {
    // Social engagement based on likes, follows, shares
    Ok(0.5)
}

#[account]
pub struct UserInsights {
    pub user: Pubkey,                    // User this insight belongs to (32 bytes)
    pub total_listening_time: u64,       // Total time spent listening (8 bytes)
    pub favorite_genre: String,          // Most listened genre (4 + 32 = 36 bytes)
    pub most_played_track: Option<Pubkey>, // Most played track (1 + 32 = 33 bytes)
    pub discovery_score: f32,            // How much they discover new music (4 bytes)
    pub social_engagement: f32,          // Social activity score (4 bytes)
    pub generated_at: i64,               // When insights were generated (8 bytes)
}

impl UserInsights {
    pub const MAX_SIZE: usize = 8 + 32 + 8 + 36 + 33 + 4 + 4 + 8; // 133 bytes
}

#[account]
pub struct Recommendation {
    pub user: Pubkey,                    // User for this recommendation (32 bytes)
    pub recommendation_type: u8,         // Type of recommendation (1 byte)
    pub target: Pubkey,                  // Recommended item (track/playlist/user) (32 bytes)
    pub score: f32,                      // Recommendation confidence score (4 bytes)
    pub reason: String,                  // Why this was recommended (4 + 128 = 132 bytes)
    pub created_at: i64,                 // When created (8 bytes)
    pub is_viewed: bool,                 // Has user seen this (1 byte)
}

impl Recommendation {
    pub const MAX_SIZE: usize = 8 + 32 + 1 + 32 + 4 + 132 + 8 + 1; // 218 bytes
    
    // Recommendation types
    pub const TYPE_TRACK: u8 = 1;
    pub const TYPE_PLAYLIST: u8 = 2;
    pub const TYPE_USER: u8 = 3;
}

#[derive(Accounts)]
pub struct GenerateUserInsights<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = UserInsights::MAX_SIZE,
        seeds = [b"user_insights", user.key().as_ref()],
        bump
    )]
    pub user_insights: Account<'info, UserInsights>,

    #[account(
        seeds = [b"user_stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(recommendation_type: u8, target: Pubkey)]
pub struct CreateRecommendation<'info> {
    #[account(
        init,
        payer = user,
        space = Recommendation::MAX_SIZE,
        seeds = [b"recommendation", user.key().as_ref(), target.as_ref(), &recommendation_type.to_le_bytes()],
        bump
    )]
    pub recommendation: Account<'info, Recommendation>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
