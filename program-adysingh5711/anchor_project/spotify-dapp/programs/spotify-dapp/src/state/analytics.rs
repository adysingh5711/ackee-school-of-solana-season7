use anchor_lang::prelude::*;

#[account]
pub struct UserInsights {
    pub user: Pubkey,                    // User this insight belongs to (32 bytes)
    pub total_listening_time: u64,       // Total time spent listening (8 bytes)
    pub favorite_genre: String,          // Most listened genre (4 + 32 = 36 bytes)
    pub most_played_track: Option<Pubkey>, // Most played track (1 + 32 = 33 bytes)
    pub discovery_score: f32,            // How much they discover new music (4 bytes)
    pub social_engagement: f32,          // Social activity score (4 bytes)
    pub generated_at: i64,               // When insights were generated (8 bytes)
}

impl UserInsights {
    pub const MAX_SIZE: usize = 32 + 8 + 36 + 33 + 4 + 4 + 8; // 125 bytes
}

#[account]
pub struct Recommendation {
    pub user: Pubkey,                    // User for this recommendation (32 bytes)
    pub recommendation_type: u8,         // Type of recommendation (1 byte)
    pub target: Pubkey,                  // Recommended item (track/playlist/user) (32 bytes)
    pub score: f32,                      // Recommendation confidence score (4 bytes)
    pub reason: String,                  // Why this was recommended (4 + 128 = 132 bytes)
    pub created_at: i64,                 // When created (8 bytes)
    pub is_viewed: bool,                 // Has user seen this (1 byte)
}

impl Recommendation {
    pub const MAX_SIZE: usize = 32 + 1 + 32 + 4 + 132 + 8 + 1; // 210 bytes
    
    // Recommendation types
    pub const TYPE_TRACK: u8 = 1;
    pub const TYPE_PLAYLIST: u8 = 2;
    pub const TYPE_USER: u8 = 3;
}

#[account]
pub struct SearchIndex {
    pub search_term: String,      // Searchable term (4 + 64 = 68 bytes)
    pub target_type: u8,          // Type of target (1 byte)
    pub target_pubkey: Pubkey,    // Target account (32 bytes)
    pub created_at: i64,          // When indexed (8 bytes)
}

impl SearchIndex {
    pub const MAX_SIZE: usize = 68 + 1 + 32 + 8; // 109 bytes
}