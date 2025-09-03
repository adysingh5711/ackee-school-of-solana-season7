# Project Description

<strong>Deployed Frontend URL:</strong> <a href="https://spotify-dapp-sss7.vercel.app" target="_blank">https://spotify-dapp-sss7.vercel.app</a>

## Solana Program Deployment

**Program ID:** cMq3jX2jiQJTCMJPAAj6BT48WqCiJhT2yQE9BzSRr2X

**Owner:** BPFLoaderUpgradeab1e11111111111111111111111

**ProgramData Address:** 3Z2TBxBSdDgETqzb9Dm8SRptQjs4fuuLqemTbHYUBpak

**Authority:** CxSYGtm4ohnfBs2RhPTeJHfRtqcF4h9iatsdvXiH5hz2

**Last Deployed In Slot:** 405469136

**Data Length:** 264728 (0x40a18) bytes

**Balance:** 1.84371096 SOL

## Project Overview

### Description
A comprehensive decentralized music streaming platform built on the Solana blockchain using the Anchor framework. This dApp provides a complete alternative to traditional music platforms like Spotify, enabling users to create profiles, upload and manage tracks, build playlists, engage in social interactions, and discover new music through AI-powered recommendations. The platform demonstrates advanced Solana development concepts including complex state management, social features, analytics, and collaborative functionalities, all while maintaining user ownership and control over their content and data.

### Key Features
- **User Management**: Complete user profiles with customizable usernames, display names, bios, and profile images
- **Track Management**: Upload and manage music tracks with comprehensive metadata (title, artist, album, genre, duration, audio URL, cover image)
- **Playlist Management**: Create public/private playlists with collaborative editing capabilities and granular permission controls
- **Social Interactions**: Follow/unfollow users, like tracks and playlists, with real-time activity feeds
- **Analytics & Insights**: Advanced user analytics including listening patterns, favorite genres, discovery scores, and social engagement metrics
- **Search & Discovery**: Intelligent search functionality with AI-powered recommendations
- **Collaborative Features**: Multi-user playlist collaboration with permission-based access control
- **Activity Tracking**: Comprehensive activity feeds tracking user interactions and engagement
  
### How to Use the dApp
1. **Connect Wallet**: Connect your Solana wallet (Phantom, Solflare, etc.) to the dApp
2. **Create Profile**: Set up your user profile with username, display name, bio, and profile image
3. **Upload Tracks**: Create tracks by providing metadata including title, artist, album, genre, and audio URLs
4. **Build Playlists**: Create public or private playlists and organize your favorite tracks
5. **Social Interaction**: Follow other users, like their tracks and playlists, and view activity feeds
6. **Collaborate**: Add collaborators to your playlists with specific permissions (add tracks, remove tracks, edit info)
7. **Discover Music**: Use search functionality and view personalized recommendations
8. **Track Analytics**: Monitor your listening habits, favorite genres, and social engagement through user insights

## Program Architecture
The Spotify dApp implements a sophisticated modular architecture with six main instruction modules and comprehensive state management. The program leverages Solana's Program Derived Addresses (PDAs) extensively for secure, deterministic account creation and management across all features.

### PDA Usage
The system uses a systematic PDA approach for organizing different account types with consistent naming patterns and namespace organization.

**PDAs Used:**
- **User Accounts**: 
  - User Profile PDA: `["user_profile", authority.key()]` - stores user identity and social metrics
  - User Stats PDA: `["user_stats", authority.key()]` - tracks activity metrics and engagement
  - User Insights PDA: `["user_insights", user.key()]` - stores analytics and personalized insights
- **Track Accounts**:
  - Track PDA: `["track", authority.key(), title.bytes(), artist.bytes()]` - stores track metadata and statistics
  - Track Like PDA: `["track_like", user.key(), track.key()]` - represents user-track like relationships
  - Track Play PDA: `["track_play", track.key(), user.key()]` - tracks individual play sessions
- **Playlist Accounts**:
  - Playlist PDA: `["playlist", authority.key(), name.bytes()]` - stores playlist metadata and settings
  - Playlist Track PDA: `["playlist_track", playlist.key(), track.key()]` - manages track-playlist relationships
  - Playlist Collaborator PDA: `["playlist_collaborator", playlist.key(), collaborator.key()]` - manages collaboration permissions
- **Social Accounts**:
  - User Follow PDA: `["user_follow", follower.key(), following.key()]` - represents follow relationships
  - Activity Feed PDA: `["activity_feed", user.key()]` - stores user activity history
- **Analytics Accounts**:
  - Recommendation PDA: `["recommendation", user.key(), target.key(), type.bytes()]` - stores personalized recommendations

### Program Instructions
The program implements a comprehensive set of instructions organized into six functional modules:

**User Management Instructions:**
- `create_user_profile`: Initialize user profile and stats with validation for username uniqueness and field constraints
- `update_user_profile`: Modify profile information (display name, bio, profile image) with authority checks

**Track Management Instructions:**
- `create_track`: Upload new tracks with comprehensive metadata validation and automatic stats updates
- `play_track`: Record track plays, update play counts, and maintain user listening history

**Playlist Management Instructions:**
- `create_playlist`: Create public/private playlists with collaboration settings
- `add_track_to_playlist`: Add tracks to playlists with permission validation for collaborative playlists
- `remove_track_from_playlist`: Remove tracks with proper authorization checks
- `add_collaborator`: Grant playlist collaboration permissions using bitfield-based access control
- `remove_collaborator`: Revoke collaboration permissions with owner-only restrictions

**Social Interaction Instructions:**
- `like_track`: Like tracks with duplicate prevention and automatic engagement metric updates
- `unlike_track`: Remove track likes with proper cleanup of related data
- `follow_user`: Follow other users with self-follow prevention and mutual follower count updates
- `unfollow_user`: Unfollow users with proper relationship cleanup

**Search & Discovery Instructions:**
- `search_tracks`: Query tracks by title, artist, or genre with pagination support
- `search_users`: Find users by username or display name
- `search_playlists`: Discover public playlists by name or description

**Analytics Instructions:**
- `generate_user_insights`: Create comprehensive user analytics including listening time, favorite genres, and discovery scores
- `create_recommendation`: Generate AI-powered music recommendations with scoring and reasoning
- `update_recommendation_feedback`: Track user interaction with recommendations for improved algorithms

### Account Structure
```rust
// User Management
#[account]
pub struct UserProfile {
    pub authority: Pubkey,        // User's wallet (32 bytes)
    pub username: String,         // Unique username (4 + 32 = 36 bytes)
    pub display_name: String,     // Display name (4 + 64 = 68 bytes)
    pub bio: String,              // User bio (4 + 256 = 260 bytes)
    pub profile_image: String,    // Profile image URL (4 + 256 = 260 bytes)
    pub followers_count: u64,     // Number of followers (8 bytes)
    pub following_count: u64,     // Number of following (8 bytes)
    pub created_at: i64,          // Creation timestamp (8 bytes)
}

#[account]
pub struct UserStats {
    pub user: Pubkey,             // User profile reference (32 bytes)
    pub tracks_created: u64,      // Number of tracks created (8 bytes)
    pub playlists_created: u64,   // Number of playlists created (8 bytes)
    pub total_likes_received: u64, // Total likes on user's content (8 bytes)
    pub total_plays: u64,         // Total plays across all tracks (8 bytes)
    pub last_active: i64,         // Last activity timestamp (8 bytes)
}

// Track Management
#[account]
pub struct Track {
    pub title: String,            // Track title (4 + 128 = 132 bytes)
    pub artist: String,           // Artist name (4 + 64 = 68 bytes)
    pub album: String,            // Album name (4 + 64 = 68 bytes)
    pub genre: String,            // Genre (4 + 32 = 36 bytes)
    pub duration: u64,            // Duration in seconds (8 bytes)
    pub audio_url: String,        // Audio file URL (4 + 256 = 260 bytes)
    pub cover_image: String,      // Cover image URL (4 + 256 = 260 bytes)
    pub likes_count: u64,         // Number of likes (8 bytes)
    pub plays_count: u64,         // Number of plays (8 bytes)
    pub created_by: Pubkey,       // Creator's wallet (32 bytes)
    pub created_at: i64,          // Creation timestamp (8 bytes)
}

// Playlist Management
#[account]
pub struct Playlist {
    pub authority: Pubkey,        // Playlist owner (32 bytes)
    pub name: String,             // Playlist name (4 + 64 = 68 bytes)
    pub description: String,      // Description (4 + 256 = 260 bytes)
    pub is_public: bool,          // Visibility flag (1 byte)
    pub is_collaborative: bool,   // Collaboration flag (1 byte)
    pub tracks_count: u64,        // Number of tracks (8 bytes)
    pub likes_count: u64,         // Number of likes (8 bytes)
    pub plays_count: u64,         // Number of plays (8 bytes)
    pub created_at: i64,          // Creation timestamp (8 bytes)
    pub updated_at: i64,          // Last update timestamp (8 bytes)
}

#[account]
pub struct PlaylistCollaborator {
    pub playlist: Pubkey,         // Playlist reference (32 bytes)
    pub user: Pubkey,             // Collaborator user (32 bytes)
    pub permissions: u8,          // Permission bitfield (1 byte)
    pub added_at: i64,            // Added timestamp (8 bytes)
}

// Social Features
#[account]
pub struct UserFollow {
    pub follower: Pubkey,         // Following user (32 bytes)
    pub following: Pubkey,        // Followed user (32 bytes)
    pub created_at: i64,          // Follow timestamp (8 bytes)
}

#[account]
pub struct ActivityFeed {
    pub user: Pubkey,             // User reference (32 bytes)
    pub activity_type: u8,        // Activity type (1 byte)
    pub target: Pubkey,           // Target of activity (32 bytes)
    pub metadata: String,         // Activity description (4 + 128 = 132 bytes)
    pub created_at: i64,          // Activity timestamp (8 bytes)
}

// Analytics
#[account]
pub struct UserInsights {
    pub user: Pubkey,             // User reference (32 bytes)
    pub total_listening_time: u64, // Total listening time in seconds (8 bytes)
    pub favorite_genre: String,   // Most listened genre (4 + 32 = 36 bytes)
    pub most_played_track: Option<Pubkey>, // Most played track (33 bytes)
    pub discovery_score: f32,     // Music discovery score (4 bytes)
    pub social_engagement: f32,   // Social interaction score (4 bytes)
    pub generated_at: i64,        // Generation timestamp (8 bytes)
}
```

## Testing

### Test Coverage
Comprehensive test suite covering all program instructions with both successful operations and comprehensive error scenarios to ensure program security, data integrity, and user experience quality.

**Happy Path Tests:**
- **User Profile Creation**: Successfully creates user profiles with proper initialization of stats and validation of all input fields
- **Profile Updates**: Correctly updates user information with authority validation and maintains data consistency
- **Track Creation**: Properly creates tracks with metadata validation and automatic stats incrementing
- **Playlist Management**: Creates playlists, adds/removes tracks, and manages collaboration permissions correctly
- **Social Interactions**: Processes likes, follows, and activity feeds with proper relationship management
- **Analytics Generation**: Creates user insights and recommendations with accurate data processing
- **Search Functionality**: Returns relevant results with proper filtering and pagination

**Unhappy Path Tests:**
- **Input Validation Failures**: Rejects invalid usernames, empty fields, oversized content, and malformed URLs
- **Authorization Errors**: Prevents unauthorized access to user profiles, tracks, and playlists
- **Duplicate Prevention**: Blocks duplicate user profiles, track likes, and user follows
- **Permission Violations**: Restricts unauthorized playlist modifications and collaboration management
- **Data Integrity**: Prevents arithmetic overflows, invalid timestamps, and corrupted state transitions
- **Account Conflicts**: Handles account initialization conflicts and invalid PDA derivations
- **Social Constraints**: Prevents self-following, duplicate relationships, and invalid social interactions

### Running Tests
```bash
# Navigate to the anchor project directory
cd anchor_project/spotify-dapp

# Install dependencies
npm install

# Run comprehensive test suite
anchor test

# Run specific test categories
anchor test --grep "User Profile Tests"
anchor test --grep "Playlist Tests"
anchor test --grep "Social Interaction Tests"
```

### Additional Notes for Evaluators

This project represents a comprehensive exploration of advanced Solana development concepts and real-world dApp architecture. The implementation demonstrates:

**Technical Achievements:**
- **Complex State Management**: Multi-layered account relationships with proper data normalization and referential integrity
- **Advanced PDA Usage**: Sophisticated seed schemes enabling efficient data organization and retrieval
- **Permission Systems**: Bitfield-based collaboration permissions with granular access control
- **Social Graph Implementation**: Complete follow/follower system with activity tracking and feed generation
- **Analytics Integration**: Real-time metrics calculation and personalized recommendation algorithms
- **Comprehensive Error Handling**: Custom error types with descriptive messages for all failure scenarios

**Challenges Overcome:**
- **Account Size Optimization**: Careful space allocation to minimize rent costs while maintaining functionality
- **Cross-Account Relationships**: Complex data relationships requiring careful constraint validation
- **Permission Management**: Implementing secure, flexible collaboration systems with proper authorization
- **Real-time Updates**: Maintaining consistency across multiple account types during state transitions
- **Search Optimization**: Efficient query mechanisms for content discovery without centralized indexing

**Frontend Integration:**
- **TypeScript Client**: Full type-safe integration using Anchor's IDL generation
- **React Architecture**: Modern component-based UI with custom hooks for blockchain interaction
- **State Management**: Efficient caching and real-time updates for optimal user experience
- **Wallet Integration**: Seamless connection with multiple Solana wallet providers
- **Error Handling**: User-friendly error messages and transaction status tracking

This dApp showcases the potential for decentralized content platforms while maintaining the user experience expectations of modern applications. The architecture supports future scalability and additional features while demonstrating best practices in Solana development.