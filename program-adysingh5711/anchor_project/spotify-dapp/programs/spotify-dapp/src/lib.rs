#![allow(deprecated)]
use anchor_lang::prelude::*;

// Import modules
pub mod state;
pub mod errors;

// Re-export types
pub use state::*;
pub use errors::*;

declare_id!("4f2BpoBwUu2tqvxDQmMnEB6q7VT3zV6rAnpTuruU2dSp");

#[program]
pub mod spotify_program {
    use super::*;

    // User Management Instructions
    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        username: String,
        display_name: String,
        bio: String,
        profile_image: String,
    ) -> Result<()> {
        // Validate inputs first to avoid unnecessary work
        require!(username.len() <= 32 && !username.is_empty(), SpotifyError::UsernameTooLong);
        require!(display_name.len() <= 64, SpotifyError::DisplayNameTooLong);
        require!(bio.len() <= 256, SpotifyError::BioTooLong);
        require!(profile_image.len() <= 256, SpotifyError::ProfileImageUrlTooLong);

        let user_profile = &mut ctx.accounts.user_profile;
        let user_stats = &mut ctx.accounts.user_stats;
        let clock = Clock::get()?;
        let authority_key = ctx.accounts.authority.key();

        user_profile.authority = authority_key;
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

    pub fn create_track(
        ctx: Context<CreateTrack>,
        title: String,
        artist: String,
        album: String,
        genre: String,
        duration: u64,
        audio_url: String,
        cover_image: String,
    ) -> Result<()> {
        // Validate inputs first
        require!(title.len() <= 128 && !title.is_empty(), SpotifyError::TrackTitleTooLong);
        require!(artist.len() <= 64, SpotifyError::ArtistNameTooLong);
        require!(album.len() <= 64, SpotifyError::AlbumNameTooLong);
        require!(genre.len() <= 32, SpotifyError::GenreTooLong);
        require!(audio_url.len() <= 256, SpotifyError::AudioUrlTooLong);
        require!(cover_image.len() <= 256, SpotifyError::CoverImageUrlTooLong);
        require!(duration > 0, SpotifyError::InvalidDuration);

        let track = &mut ctx.accounts.track;
        let user_stats = &mut ctx.accounts.user_stats;
        let clock = Clock::get()?;
        let authority_key = ctx.accounts.authority.key();

        track.title = title;
        track.artist = artist;
        track.album = album;
        track.genre = genre;
        track.duration = duration;
        track.audio_url = audio_url;
        track.cover_image = cover_image;
        track.likes_count = 0;
        track.plays_count = 0;
        track.created_by = authority_key;
        track.created_at = clock.unix_timestamp;

        // Update user stats
        user_stats.tracks_created = user_stats.tracks_created.checked_add(1)
            .ok_or(SpotifyError::ArithmeticOverflow)?;
        user_stats.last_active = clock.unix_timestamp;

        msg!("Track created: {} by {}", track.title, track.artist);
        Ok(())
    }
}

// Account Structures
#[derive(Accounts)]
#[instruction(username: String)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + UserProfile::MAX_SIZE,
        seeds = [b"user_profile", authority.key().as_ref()],
        bump
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init,
        payer = authority,
        space = 8 + UserStats::MAX_SIZE,
        seeds = [b"user_stats", authority.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, artist: String)]
pub struct CreateTrack<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Track::MAX_SIZE,
        seeds = [b"track", authority.key().as_ref(), title.as_bytes(), artist.as_bytes()],
        bump
    )]
    pub track: Account<'info, Track>,

    #[account(
        mut,
        seeds = [b"user_stats", authority.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}