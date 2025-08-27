use anchor_lang::prelude::*;

#[account]
pub struct UserProfile {
    pub authority: Pubkey,        // User's wallet (32 bytes)
    pub username: String,         // Unique username (4 + 32 = 36 bytes)
    pub display_name: String,     // Display name (4 + 64 = 68 bytes)
    pub bio: String,              // User bio (4 + 256 = 260 bytes)
    pub profile_image: String,    // Profile image URL (4 + 256 = 260 bytes)
    pub followers_count: u64,     // Number of followers (8 bytes)
    pub following_count: u64,     // Number of following (8 bytes)
    pub created_at: i64,          // Timestamp (8 bytes)
}

impl UserProfile {
    pub const MAX_SIZE: usize = 8 + 32 + 36 + 68 + 260 + 260 + 8 + 8 + 8; // 688 bytes
}

#[account]
pub struct UserStats {
    pub user: Pubkey,             // User profile (32 bytes)
    pub tracks_created: u64,      // Number of tracks created (8 bytes)
    pub playlists_created: u64,   // Number of playlists created (8 bytes)
    pub total_likes_received: u64, // Total likes on user's content (8 bytes)
    pub total_plays: u64,         // Total plays across all tracks (8 bytes)
    pub last_active: i64,         // Last activity timestamp (8 bytes)
}

impl UserStats {
    pub const MAX_SIZE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8; // 80 bytes
}
