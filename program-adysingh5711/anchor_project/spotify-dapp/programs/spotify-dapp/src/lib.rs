use anchor_lang::prelude::*;

// Import all modules
pub mod state;
pub mod instructions;
pub mod errors;

// Re-export for easy access
pub use state::*;
pub use instructions::*;
pub use errors::*;

declare_id!("4f2BpoBwUu2tqvxDQmMnEB6q7VT3zV6rAnpTuruU2dSp");

#[program]
pub mod spotify_dapp {
    use super::*;

    // User Management Instructions
    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        username: String,
        display_name: String,
        bio: String,
        profile_image: String,
    ) -> Result<()> {
        instructions::user::create_user_profile(ctx, username, display_name, bio, profile_image)
    }

    pub fn update_user_profile(
        ctx: Context<UpdateUserProfile>,
        display_name: Option<String>,
        bio: Option<String>,
        profile_image: Option<String>,
    ) -> Result<()> {
        instructions::user::update_user_profile(ctx, display_name, bio, profile_image)
    }

    // Track Management Instructions
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
        instructions::track::create_track(ctx, title, artist, album, genre, duration, audio_url, cover_image)
    }

    pub fn play_track(
        ctx: Context<PlayTrack>,
        duration_played: u64,
    ) -> Result<()> {
        instructions::track::play_track(ctx, duration_played)
    }

    // Playlist Management Instructions
    pub fn create_playlist(
        ctx: Context<CreatePlaylist>,
        name: String,
        description: String,
        is_public: bool,
        is_collaborative: bool,
    ) -> Result<()> {
        instructions::playlist::create_playlist(ctx, name, description, is_public, is_collaborative)
    }

    pub fn add_track_to_playlist(
        ctx: Context<AddTrackToPlaylist>,
    ) -> Result<()> {
        instructions::playlist::add_track_to_playlist(ctx)
    }

    pub fn add_collaborator(
        ctx: Context<AddCollaborator>,
        permissions: u8,
    ) -> Result<()> {
        instructions::playlist::add_collaborator(ctx, permissions)
    }

    // Social Instructions
    pub fn like_track(
        ctx: Context<LikeTrack>,
    ) -> Result<()> {
        instructions::social::like_track(ctx)
    }

    pub fn follow_user(
        ctx: Context<FollowUser>,
    ) -> Result<()> {
        instructions::social::follow_user(ctx)
    }

    // Search and Discovery Instructions
    pub fn create_search_index(
        ctx: Context<CreateSearchIndex>,
        search_term: String,
        target_type: u8,
        target_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::search::create_search_index(ctx, search_term, target_type, target_pubkey)
    }

    // Analytics Instructions
    pub fn generate_user_insights(
        ctx: Context<GenerateUserInsights>,
    ) -> Result<()> {
        instructions::analytics::generate_user_insights(ctx)
    }

    pub fn create_recommendation(
        ctx: Context<CreateRecommendation>,
        recommendation_type: u8,
        target: Pubkey,
        score: f32,
        reason: String,
    ) -> Result<()> {
        instructions::analytics::create_recommendation(ctx, recommendation_type, target, score, reason)
    }
}