use anchor_lang::prelude::*;

#[account]
pub struct Playlist {
    pub authority: Pubkey,        // Creator's wallet (32 bytes)
    pub name: String,             // Playlist name (4 + 64 = 68 bytes)
    pub description: String,      // Playlist description (4 + 256 = 260 bytes)
    pub is_public: bool,          // Public/private playlist (1 byte)
    pub tracks_count: u64,        // Number of tracks (8 bytes)
    pub likes_count: u64,         // Number of likes (8 bytes)
    pub plays_count: u64,         // Number of plays (8 bytes)
    pub is_collaborative: bool,   // Can others add tracks (1 byte)
    pub created_at: i64,          // Timestamp (8 bytes)
    pub updated_at: i64,          // Last update timestamp (8 bytes)
}

impl Playlist {
    pub const MAX_SIZE: usize = 8 + 32 + 68 + 260 + 1 + 8 + 8 + 8 + 1 + 8 + 8; // 408 bytes
}

#[account]
pub struct PlaylistTrack {
    pub playlist: Pubkey,         // Playlist PDA (32 bytes)
    pub track: Pubkey,            // Track PDA (32 bytes)
    pub added_by: Pubkey,         // User who added the track (32 bytes)
    pub added_at: i64,            // When added to playlist (8 bytes)
    pub position: u64,            // Position in playlist (8 bytes)
}

impl PlaylistTrack {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 32 + 8 + 8; // 120 bytes
}

#[account]
pub struct PlaylistCollaborator {
    pub playlist: Pubkey,         // Playlist PDA (32 bytes)
    pub user: Pubkey,             // Collaborator user (32 bytes)
    pub permissions: u8,          // Permission level (1 byte)
    pub added_at: i64,            // When added as collaborator (8 bytes)
}

impl PlaylistCollaborator {
    pub const MAX_SIZE: usize = 8 + 32 + 32 + 1 + 8; // 81 bytes
    
    // Permission levels
    pub const PERMISSION_ADD_TRACKS: u8 = 1;
    pub const PERMISSION_REMOVE_TRACKS: u8 = 2;
    pub const PERMISSION_EDIT_INFO: u8 = 4;
    pub const PERMISSION_ALL: u8 = 7;
}
