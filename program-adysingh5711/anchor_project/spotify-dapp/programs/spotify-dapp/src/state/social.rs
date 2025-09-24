use anchor_lang::prelude::*;

#[account]
pub struct TrackLike {
    pub user: Pubkey,             // User who liked (32 bytes)
    pub track: Pubkey,            // Track that was liked (32 bytes)
    pub created_at: i64,          // When liked (8 bytes)
}

impl TrackLike {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8; // 80 bytes
}

#[account]
pub struct PlaylistLike {
    pub user: Pubkey,             // User who liked (32 bytes)
    pub playlist: Pubkey,         // Playlist that was liked (32 bytes)
    pub created_at: i64,          // When liked (8 bytes)
}

impl PlaylistLike {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8; // 80 bytes
}

#[account]
pub struct UserFollow {
    pub follower: Pubkey,         // User who follows (32 bytes)
    pub following: Pubkey,        // User being followed (32 bytes)
    pub created_at: i64,          // When followed (8 bytes)
}

impl UserFollow {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 8; // 80 bytes
}

#[account]
pub struct ActivityFeed {
    pub user: Pubkey,             // User this activity belongs to (32 bytes)
    pub activity_type: u8,        // Type of activity (1 byte)
    pub target: Pubkey,           // Target of activity (track/playlist/user) (32 bytes)
    pub metadata: String,         // Additional data (4 + 64 = 68 bytes)
    pub created_at: i64,          // When activity occurred (8 bytes)
}

impl ActivityFeed {
    pub const MAX_SIZE: usize = 8 + 32 + 1 + 32 + 68 + 8; // 149 bytes
    
    // Activity types
    pub const ACTIVITY_TRACK_LIKED: u8 = 1;
    pub const ACTIVITY_PLAYLIST_LIKED: u8 = 2;
    pub const ACTIVITY_USER_FOLLOWED: u8 = 3;
    pub const ACTIVITY_TRACK_CREATED: u8 = 4;
    pub const ACTIVITY_PLAYLIST_CREATED: u8 = 5;
    pub const ACTIVITY_TRACK_PLAYED: u8 = 6;
}
