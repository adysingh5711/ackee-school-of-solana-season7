use anchor_lang::prelude::*;

#[error_code]
pub enum SpotifyError {
    // User validation errors
    #[msg("Username cannot be longer than 32 characters")]
    UsernameTooLong,
    #[msg("Username cannot be empty")]
    UsernameEmpty,
    #[msg("Display name cannot be longer than 64 characters")]
    DisplayNameTooLong,
    #[msg("Bio cannot be longer than 256 characters")]
    BioTooLong,
    #[msg("Profile image URL cannot be longer than 256 characters")]
    ProfileImageUrlTooLong,

    // Playlist validation errors
    #[msg("Playlist name cannot be longer than 64 characters")]
    PlaylistNameTooLong,
    #[msg("Playlist name cannot be empty")]
    PlaylistNameEmpty,
    #[msg("Playlist description cannot be longer than 256 characters")]
    PlaylistDescriptionTooLong,

    // Track validation errors
    #[msg("Track title cannot be longer than 128 characters")]
    TrackTitleTooLong,
    #[msg("Track title cannot be empty")]
    TrackTitleEmpty,
    #[msg("Artist name cannot be longer than 64 characters")]
    ArtistNameTooLong,
    #[msg("Album name cannot be longer than 64 characters")]
    AlbumNameTooLong,
    #[msg("Genre cannot be longer than 32 characters")]
    GenreTooLong,
    #[msg("Audio URL cannot be longer than 256 characters")]
    AudioUrlTooLong,
    #[msg("Cover image URL cannot be longer than 256 characters")]
    CoverImageUrlTooLong,
    #[msg("Duration must be greater than 0")]
    InvalidDuration,

    // Arithmetic errors
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,

    // Social interaction errors
    #[msg("Cannot follow yourself")]
    CannotFollowSelf,
    #[msg("Already following this user")]
    AlreadyFollowing,
    #[msg("Not following this user")]
    NotFollowing,
    #[msg("Already liked this track")]
    AlreadyLikedTrack,
    #[msg("Track not liked")]
    TrackNotLiked,
    #[msg("Already liked this playlist")]
    AlreadyLikedPlaylist,
    #[msg("Playlist not liked")]
    PlaylistNotLiked,

    // Permission errors
    #[msg("No permission to add track to this playlist")]
    NoPermissionToAddTrack,
    #[msg("No permission to remove track from this playlist")]
    NoPermissionToRemoveTrack,
    #[msg("No permission to edit this playlist")]
    NoPermissionToEditPlaylist,
    #[msg("Invalid permission level")]
    InvalidPermissions,

    // Search errors
    #[msg("Search term cannot be longer than 64 characters")]
    SearchTermTooLong,
    #[msg("Search term cannot be empty")]
    SearchTermEmpty,

    // Analytics errors
    #[msg("Reason cannot be longer than 128 characters")]
    ReasonTooLong,
    #[msg("Score must be between 0.0 and 1.0")]
    InvalidScore,

    // General errors
    #[msg("Feature not implemented")]
    NotImplemented,
    #[msg("Invalid account provided")]
    InvalidAccount,
    #[msg("Unauthorized action")]
    Unauthorized,
}
