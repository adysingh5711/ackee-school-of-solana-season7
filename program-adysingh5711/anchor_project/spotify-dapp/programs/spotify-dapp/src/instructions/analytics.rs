use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

#[derive(Accounts)]
pub struct GenerateUserInsights<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserInsights::MAX_SIZE,
        seeds = [b"user_insights", user.key().as_ref()],
        bump
    )]
    pub user_insights: Account<'info, UserInsights>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserStats::MAX_SIZE,
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
        space = 8 + Recommendation::MAX_SIZE,
        seeds = [b"recommendation", user.key().as_ref(), target.as_ref(), &recommendation_type.to_le_bytes()],
        bump
    )]
    pub recommendation: Account<'info, Recommendation>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn generate_user_insights(
    ctx: Context<GenerateUserInsights>,
) -> Result<()> {
    let user_insights = &mut ctx.accounts.user_insights;
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;

    // Initialize user_stats if this is the first time
    if user_stats.user == Pubkey::default() {
        user_stats.user = ctx.accounts.user.key();
        user_stats.tracks_created = 0;
        user_stats.playlists_created = 0;
        user_stats.total_likes_received = 0;
        user_stats.total_plays = 0;
        user_stats.last_active = clock.unix_timestamp;
    }

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
    Ok(0)
}

fn determine_favorite_genre(_user: &Pubkey) -> Result<String> {
    Ok("Unknown".to_string())
}

fn find_most_played_track(_user: &Pubkey) -> Result<Option<Pubkey>> {
    Ok(None)
}

fn calculate_discovery_score(_user_stats: &UserStats) -> Result<f32> {
    Ok(0.5)
}

fn calculate_social_engagement(_user_stats: &UserStats) -> Result<f32> {
    Ok(0.5)
}
