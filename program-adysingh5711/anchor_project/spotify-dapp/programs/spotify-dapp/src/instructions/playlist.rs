use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

pub fn create_playlist(
    ctx: Context<CreatePlaylist>,
    name: String,
    description: String,
    is_public: bool,
    is_collaborative: bool,
) -> Result<()> {
    let playlist = &mut ctx.accounts.playlist;
    let user_stats = &mut ctx.accounts.user_stats;
    let clock = Clock::get()?;

    require!(name.len() <= 64, SpotifyError::PlaylistNameTooLong);
    require!(name.len() > 0, SpotifyError::PlaylistNameEmpty);
    require!(description.len() <= 256, SpotifyError::PlaylistDescriptionTooLong);

    playlist.authority = ctx.accounts.authority.key();
    playlist.name = name;
    playlist.description = description;
    playlist.is_public = is_public;
    playlist.is_collaborative = is_collaborative;
    playlist.tracks_count = 0;
    playlist.likes_count = 0;
    playlist.plays_count = 0;
    playlist.created_at = clock.unix_timestamp;
    playlist.updated_at = clock.unix_timestamp;

    // Update user stats
    user_stats.playlists_created = user_stats.playlists_created.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;
    user_stats.last_active = clock.unix_timestamp;

    msg!("Playlist created: {}", playlist.name);
    Ok(())
}

pub fn add_track_to_playlist(
    ctx: Context<AddTrackToPlaylist>,
) -> Result<()> {
    let playlist = &mut ctx.accounts.playlist;
    let playlist_track = &mut ctx.accounts.playlist_track;
    let clock = Clock::get()?;

    // Check if user has permission to add tracks
    if playlist.authority != ctx.accounts.authority.key() && !playlist.is_collaborative {
        return Err(SpotifyError::NoPermissionToAddTrack.into());
    }

    playlist_track.playlist = playlist.key();
    playlist_track.track = ctx.accounts.track.key();
    playlist_track.added_by = ctx.accounts.authority.key();
    playlist_track.added_at = clock.unix_timestamp;
    playlist_track.position = playlist.tracks_count;

    // Increment tracks count in playlist
    playlist.tracks_count = playlist.tracks_count.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;
    playlist.updated_at = clock.unix_timestamp;

    msg!("Track added to playlist: {}", playlist.name);
    Ok(())
}

pub fn add_collaborator(
    ctx: Context<AddCollaborator>,
    permissions: u8,
) -> Result<()> {
    let playlist_collaborator = &mut ctx.accounts.playlist_collaborator;
    let playlist = &ctx.accounts.playlist;
    let clock = Clock::get()?;

    // Validate permissions
    require!(
        permissions <= PlaylistCollaborator::PERMISSION_ALL,
        SpotifyError::InvalidPermissions
    );

    playlist_collaborator.playlist = playlist.key();
    playlist_collaborator.user = ctx.accounts.collaborator.key();
    playlist_collaborator.permissions = permissions;
    playlist_collaborator.added_at = clock.unix_timestamp;

    msg!("Collaborator added to playlist: {}", playlist.name);
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreatePlaylist<'info> {
    #[account(
        init,
        payer = authority,
        space = Playlist::MAX_SIZE,
        seeds = [b"playlist", authority.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub playlist: Box<Account<'info, Playlist>>,

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
pub struct AddTrackToPlaylist<'info> {
    #[account(
        mut,
        seeds = [b"playlist", playlist.authority.as_ref(), playlist.name.as_bytes()],
        bump
    )]
    pub playlist: Box<Account<'info, Playlist>>,

    #[account(
        init,
        payer = authority,
        space = PlaylistTrack::MAX_SIZE,
        seeds = [b"playlist_track", playlist.key().as_ref(), track.key().as_ref()],
        bump
    )]
    pub playlist_track: Account<'info, PlaylistTrack>,

    /// CHECK: This is the track account we're adding to the playlist
    pub track: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddCollaborator<'info> {
    #[account(
        seeds = [b"playlist", playlist.authority.as_ref(), playlist.name.as_bytes()],
        bump,
        has_one = authority
    )]
    pub playlist: Box<Account<'info, Playlist>>,

    #[account(
        init,
        payer = authority,
        space = PlaylistCollaborator::MAX_SIZE,
        seeds = [b"playlist_collaborator", playlist.key().as_ref(), collaborator.key().as_ref()],
        bump
    )]
    pub playlist_collaborator: Account<'info, PlaylistCollaborator>,

    /// CHECK: This is the user being added as collaborator
    pub collaborator: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
