use anchor_lang::prelude::*;

#[account]
pub struct Track {
    pub title: String,            // Track title (4 + 128 = 132 bytes)
    pub artist: String,           // Artist name (4 + 64 = 68 bytes)
    pub album: String,            // Album name (4 + 64 = 68 bytes)
    pub genre: String,            // Genre (4 + 32 = 36 bytes)
    pub duration: u64,            // Duration in seconds (8 bytes)
    pub audio_url: String,        // Audio file URL (4 + 256 = 260 bytes)
    pub cover_image: String,      // Album cover URL (4 + 256 = 260 bytes)
    pub likes_count: u64,         // Number of likes (8 bytes)
    pub plays_count: u64,         // Number of plays (8 bytes)
    pub created_by: Pubkey,       // Creator of the track (32 bytes)
    pub created_at: i64,          // Timestamp (8 bytes)
}

impl Track {
    pub const MAX_SIZE: usize = 8 + 132 + 68 + 68 + 36 + 8 + 260 + 260 + 8 + 8 + 32 + 8; // 896 bytes
}

#[account]
pub struct TrackPlay {
    pub track: Pubkey,            // Track that was played (32 bytes)
    pub user: Pubkey,             // User who played the track (32 bytes)
    pub play_count: u64,          // Number of times played (8 bytes)
    pub total_duration: u64,      // Total duration played (8 bytes)
    pub first_played_at: i64,     // When first played (8 bytes)
    pub last_played_at: i64,      // When last played (8 bytes)
}

impl TrackPlay {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8; // 104 bytes
}
