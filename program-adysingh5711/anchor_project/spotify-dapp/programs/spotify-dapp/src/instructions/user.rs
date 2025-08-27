use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

pub fn create_user_profile(
    ctx: Context<CreateUserProfile>,
    username: String,
    display_name: String,
    bio: String,
    profile_image: String,
) -> Result<()> {
    let user_profile = &mut ctx.accounts.user_profile;
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;

    // Validate username length
    require!(username.len() <= 32, SpotifyError::UsernameTooLong);
    require!(username.len() > 0, SpotifyError::UsernameEmpty);
    require!(display_name.len() <= 64, SpotifyError::DisplayNameTooLong);
    require!(bio.len() <= 256, SpotifyError::BioTooLong);
    require!(profile_image.len() <= 256, SpotifyError::ProfileImageUrlTooLong);

    user_profile.authority = ctx.accounts.authority.key();
    user_profile.username = username;
    user_profile.display_name = display_name;
    user_profile.bio = bio;
    user_profile.profile_image = profile_image;
    user_profile.followers_count = 0;
    user_profile.following_count = 0;
    user_profile.created_at = clock.unix_timestamp;

    // Initialize user stats
    user_stats.user = user_profile.key();
    user_stats.tracks_created = 0;
    user_stats.playlists_created = 0;
    user_stats.total_likes_received = 0;
    user_stats.total_plays = 0;
    user_stats.last_active = clock.unix_timestamp;

    msg!("User profile created for: {}", user_profile.username);
    Ok(())
}

pub fn update_user_profile(
    ctx: Context<UpdateUserProfile>,
    display_name: Option<String>,
    bio: Option<String>,
    profile_image: Option<String>,
) -> Result<()> {
    let user_profile = &mut ctx.accounts.user_profile;
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;

    if let Some(name) = display_name {
        require!(name.len() <= 64, SpotifyError::DisplayNameTooLong);
        user_profile.display_name = name;
    }

    if let Some(bio_text) = bio {
        require!(bio_text.len() <= 256, SpotifyError::BioTooLong);
        user_profile.bio = bio_text;
    }

    if let Some(image_url) = profile_image {
        require!(image_url.len() <= 256, SpotifyError::ProfileImageUrlTooLong);
        user_profile.profile_image = image_url;
    }

    // Update last active
    user_stats.last_active = clock.unix_timestamp;

    msg!("User profile updated for: {}", user_profile.username);
    Ok(())
}

#[derive(Accounts)]
#[instruction(username: String)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = UserProfile::MAX_SIZE,
        seeds = [b"user_profile", authority.key().as_ref()],
        bump
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init,
        payer = authority,
        space = UserStats::MAX_SIZE,
        seeds = [b"user_stats", authority.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserProfile<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        mut,
        seeds = [b"user_stats", authority.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    pub authority: Signer<'info>,
}
