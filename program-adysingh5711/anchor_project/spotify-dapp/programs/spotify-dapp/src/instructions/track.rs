use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

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
    let track = &mut ctx.accounts.track;
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;

    require!(title.len() <= 128, SpotifyError::TrackTitleTooLong);
    require!(title.len() > 0, SpotifyError::TrackTitleEmpty);
    require!(artist.len() <= 64, SpotifyError::ArtistNameTooLong);
    require!(album.len() <= 64, SpotifyError::AlbumNameTooLong);
    require!(genre.len() <= 32, SpotifyError::GenreTooLong);
    require!(audio_url.len() <= 256, SpotifyError::AudioUrlTooLong);
    require!(cover_image.len() <= 256, SpotifyError::CoverImageUrlTooLong);
    require!(duration > 0, SpotifyError::InvalidDuration);

    track.title = title;
    track.artist = artist;
    track.album = album;
    track.genre = genre;
    track.duration = duration;
    track.audio_url = audio_url;
    track.cover_image = cover_image;
    track.likes_count = 0;
    track.plays_count = 0;
    track.created_by = ctx.accounts.authority.key();
    track.created_at = clock.unix_timestamp;

    // Update user stats
    user_stats.tracks_created = user_stats.tracks_created.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;
    user_stats.last_active = clock.unix_timestamp;

    msg!("Track created: {} by {}", track.title, track.artist);
    Ok(())
}

pub fn play_track(
    ctx: Context<PlayTrack>,
    duration_played: u64,
) -> Result<()> {
    let track = &mut ctx.accounts.track;
    let track_play = &mut ctx.accounts.track_play;
    let user_stats = &mut ctx.accounts.user_stats;
    let creator_stats = &mut ctx.accounts.creator_stats;
    let clock = Clock::get()?;

    // Initialize or update the play record
    if track_play.track == Pubkey::default() {
        // First time playing this track
        track_play.track = track.key();
        track_play.user = ctx.accounts.user.key();
        track_play.play_count = 1;
        track_play.total_duration = duration_played;
        track_play.first_played_at = clock.unix_timestamp;
        track_play.last_played_at = clock.unix_timestamp;
    } else {
        // Update existing play record
        track_play.play_count = track_play.play_count.checked_add(1)
            .ok_or(SpotifyError::ArithmeticOverflow)?;
        track_play.total_duration = track_play.total_duration.checked_add(duration_played)
            .ok_or(SpotifyError::ArithmeticOverflow)?;
        track_play.last_played_at = clock.unix_timestamp;
    }

    // Update track play count
    track.plays_count = track.plays_count.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    // Update user stats
    user_stats.last_active = clock.unix_timestamp;

    // Update creator stats
    creator_stats.total_plays = creator_stats.total_plays.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    msg!("Track played: {} by {}", track.title, track.artist);
    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String, artist: String)]
pub struct CreateTrack<'info> {
    #[account(
        init,
        payer = authority,
        space = Track::MAX_SIZE,
        seeds = [b"track", title.as_bytes(), artist.as_bytes()],
        bump
    )]
    pub track: Box<Account<'info, Track>>,

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

#[derive(Accounts)]
pub struct PlayTrack<'info> {
    #[account(mut)]
    pub track: Box<Account<'info, Track>>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + TrackPlay::MAX_SIZE,
        seeds = [b"track_play", track.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub track_play: Account<'info, TrackPlay>,

    #[account(
        mut,
        seeds = [b"user_stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(
        mut,
        seeds = [b"user_stats", track.created_by.as_ref()],
        bump
    )]
    pub creator_stats: Account<'info, UserStats>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}
