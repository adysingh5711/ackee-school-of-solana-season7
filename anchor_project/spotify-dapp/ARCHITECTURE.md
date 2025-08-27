# Spotify dApp Architecture

## 📁 Project Structure

The Spotify dApp has been architected with a modular design for maximum maintainability, scalability, and developer experience.

```
programs/spotify-dapp/src/
├── lib.rs                    # Main program entry point
├── state/                    # Account structures and data models
│   ├── mod.rs               # Module exports
│   ├── user.rs              # User-related accounts
│   ├── playlist.rs          # Playlist-related accounts
│   ├── track.rs             # Track-related accounts
│   └── social.rs            # Social interaction accounts
├── instructions/             # Business logic and instruction handlers
│   ├── mod.rs               # Module exports
│   ├── user.rs              # User management instructions
│   ├── playlist.rs          # Playlist management instructions
│   ├── track.rs             # Track management instructions
│   ├── social.rs            # Social interaction instructions
│   ├── search.rs            # Search and discovery instructions
│   └── analytics.rs         # Analytics and insights instructions
└── errors.rs                # Custom error definitions
```

## 🏗️ Modular Design Benefits

### 1. **Separation of Concerns**
- **State**: Pure data structures and account definitions
- **Instructions**: Business logic and validation
- **Errors**: Centralized error handling
- **Main**: Clean API surface and program entry points

### 2. **Developer Experience**
- Easy navigation and file discovery
- Clear module boundaries
- Reduced cognitive load when working on specific features
- Better code organization for team collaboration

### 3. **Maintainability**
- Changes are isolated to specific modules
- Easier debugging and testing
- Clear dependency relationships
- Reduced file size for better IDE performance

### 4. **Scalability**
- Easy to add new features without cluttering existing code
- Modular testing approach
- Independent development of features
- Better code reuse across instructions

## 📊 Account Architecture

### User Management
```rust
// Primary user account
UserProfile {
    authority: Pubkey,
    username: String,
    display_name: String,
    bio: String,
    profile_image: String,
    followers_count: u64,
    following_count: u64,
    created_at: i64,
}

// User analytics and stats
UserStats {
    user: Pubkey,
    tracks_created: u64,
    playlists_created: u64,
    total_likes_received: u64,
    total_plays: u64,
    last_active: i64,
}
```

### Track Management
```rust
// Enhanced track with genre support
Track {
    title: String,
    artist: String,
    album: String,
    genre: String,           // New in Phase 3
    duration: u64,
    audio_url: String,
    cover_image: String,
    likes_count: u64,
    plays_count: u64,        // New in Phase 3
    created_by: Pubkey,      // New in Phase 3
    created_at: i64,
}

// Track play analytics
TrackPlay {
    track: Pubkey,
    user: Pubkey,
    played_at: i64,
    duration_played: u64,
}
```

### Playlist Management
```rust
// Enhanced playlist with collaboration
Playlist {
    authority: Pubkey,
    name: String,
    description: String,
    is_public: bool,
    tracks_count: u64,
    likes_count: u64,
    plays_count: u64,        // New in Phase 3
    is_collaborative: bool,   // New in Phase 3
    created_at: i64,
    updated_at: i64,         // New in Phase 3
}

// Playlist collaboration system
PlaylistCollaborator {
    playlist: Pubkey,
    user: Pubkey,
    permissions: u8,         // Bitfield for permissions
    added_at: i64,
}

// Enhanced playlist-track relationship
PlaylistTrack {
    playlist: Pubkey,
    track: Pubkey,
    added_by: Pubkey,        // New in Phase 3
    added_at: i64,
    position: u64,
}
```

### Social Features
```rust
// Like system
TrackLike { user: Pubkey, track: Pubkey, created_at: i64 }
PlaylistLike { user: Pubkey, playlist: Pubkey, created_at: i64 }

// Follow system  
UserFollow { follower: Pubkey, following: Pubkey, created_at: i64 }

// Activity feed
ActivityFeed {
    user: Pubkey,
    activity_type: u8,       // Enum for different activity types
    target: Pubkey,          // Target of the activity
    metadata: String,        // Additional context
    created_at: i64,
}
```

### Analytics & Discovery
```rust
// User insights and recommendations
UserInsights {
    user: Pubkey,
    total_listening_time: u64,
    favorite_genre: String,
    most_played_track: Option<Pubkey>,
    discovery_score: f32,
    social_engagement: f32,
    generated_at: i64,
}

// Recommendation engine
Recommendation {
    user: Pubkey,
    recommendation_type: u8,  // Track, Playlist, or User
    target: Pubkey,
    score: f32,              // Confidence score 0.0-1.0
    reason: String,
    created_at: i64,
    is_viewed: bool,
}

// Search indexing
SearchIndex {
    search_term: String,     // Lowercase searchable term
    target_type: u8,         // Type of indexed item
    target_pubkey: Pubkey,   // The actual item
    created_at: i64,
}
```

## 🎯 Instruction Overview

### Phase 1: Core Functionality
- ✅ User profile management
- ✅ Basic playlist operations
- ✅ Track creation and management
- ✅ Playlist-track relationships

### Phase 2: Social Features
- ✅ Like/unlike system for tracks and playlists
- ✅ User following system
- ✅ Enhanced playlist operations
- ✅ Account closure and SOL recovery

### Phase 3: Advanced Features
- ✅ **Analytics & Insights**: User statistics, listening habits, personalized insights
- ✅ **Search & Discovery**: Searchable content indexing and recommendation system
- ✅ **Playlist Collaboration**: Multi-user playlist editing with permission system
- ✅ **Activity Tracking**: Comprehensive play tracking and activity feeds
- ✅ **Enhanced Social**: Rich activity feeds and engagement metrics

## 🔧 Permission System

The playlist collaboration system uses a bitfield permission model:

```rust
pub const PERMISSION_ADD_TRACKS: u8 = 1;      // 0001
pub const PERMISSION_REMOVE_TRACKS: u8 = 2;   // 0010  
pub const PERMISSION_EDIT_INFO: u8 = 4;       // 0100
pub const PERMISSION_ALL: u8 = 7;             // 0111
```

This allows fine-grained control over what collaborators can do:
- **Read-only**: 0 (no permissions)
- **Add tracks only**: 1
- **Remove tracks only**: 2
- **Add & remove tracks**: 3
- **Edit playlist info only**: 4
- **All permissions**: 7

## 📈 Analytics Features

### User Insights
- **Listening Time**: Total duration across all plays
- **Favorite Genre**: Most frequently played genre
- **Discovery Score**: How much new content user explores
- **Social Engagement**: Activity in likes, follows, shares

### Recommendation Engine
- **Content-based**: Based on user's listening history
- **Social**: Based on followed users' activity  
- **Collaborative filtering**: Based on similar users
- **Trending**: Popular content discovery

### Activity Tracking
- **Play Analytics**: Detailed play statistics per track
- **Social Activity**: Timeline of user interactions
- **Engagement Metrics**: Likes, follows, playlist additions

## 🔍 Search System

The search system uses indexed terms for efficient discovery:

```rust
// Search types
pub const RESULT_TYPE_TRACK: u8 = 1;
pub const RESULT_TYPE_PLAYLIST: u8 = 2;
pub const RESULT_TYPE_USER: u8 = 3;
```

Search functionality includes:
- **Full-text search** across tracks, playlists, and users
- **Genre filtering** for track discovery
- **Advanced filters** (duration, likes, date ranges)
- **Autocomplete support** via search indexing

## 🎵 Features Summary

| Feature Category | Phase 1 | Phase 2 | Phase 3 |
|-----------------|---------|---------|---------|
| **User Management** | ✅ Profiles | ✅ Enhanced | ✅ Analytics |
| **Track System** | ✅ Basic | ✅ Enhanced | ✅ + Genre + Plays |
| **Playlists** | ✅ Basic | ✅ Enhanced | ✅ + Collaboration |
| **Social** | ❌ | ✅ Likes + Follows | ✅ + Activity Feeds |
| **Search** | ❌ | ❌ | ✅ Full System |
| **Analytics** | ❌ | ❌ | ✅ Full System |
| **Recommendations** | ❌ | ❌ | ✅ Basic Engine |

## 🚀 Getting Started

1. **Development**: Each module can be developed independently
2. **Testing**: Tests are organized by phase and feature area
3. **Deployment**: Modular structure supports incremental deployment
4. **Extension**: New features can be added without affecting existing code

The modular architecture ensures the Spotify dApp is production-ready, maintainable, and easily extensible for future enhancements.
