use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

pub fn like_track(
    ctx: Context<LikeTrack>,
) -> Result<()> {
    let track = &mut ctx.accounts.track;
    let track_like = &mut ctx.accounts.track_like;
    let user_stats = &mut ctx.accounts.user_stats;
    let creator_stats = &mut ctx.accounts.creator_stats;
    let activity_feed = &mut ctx.accounts.activity_feed;
    let clock = Clock::get()?;

    track_like.user = ctx.accounts.user.key();
    track_like.track = track.key();
    track_like.created_at = clock.unix_timestamp;

    // Increment likes count on track
    track.likes_count = track.likes_count.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    // Update creator stats
    creator_stats.total_likes_received = creator_stats.total_likes_received.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    // Update user activity
    user_stats.last_active = clock.unix_timestamp;

    // Create activity feed entry
    activity_feed.user = ctx.accounts.user.key();
    activity_feed.activity_type = ActivityFeed::ACTIVITY_TRACK_LIKED;
    activity_feed.target = track.key();
    activity_feed.metadata = format!("Liked track: {}", track.title);
    activity_feed.created_at = clock.unix_timestamp;

    msg!("Track liked: {}", track.title);
    Ok(())
}

pub fn follow_user(
    ctx: Context<FollowUser>,
) -> Result<()> {
    let follower_profile = &mut ctx.accounts.follower_profile;
    let following_profile = &mut ctx.accounts.following_profile;
    let user_follow = &mut ctx.accounts.user_follow;
    let activity_feed = &mut ctx.accounts.activity_feed;
    let clock = Clock::get()?;

    // Prevent self-following
    require!(
        follower_profile.key() != following_profile.key(),
        SpotifyError::CannotFollowSelf
    );

    user_follow.follower = follower_profile.key();
    user_follow.following = following_profile.key();
    user_follow.created_at = clock.unix_timestamp;

    // Update follower count for following user
    following_profile.followers_count = following_profile.followers_count.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    // Update following count for follower user
    follower_profile.following_count = follower_profile.following_count.checked_add(1)
        .ok_or(SpotifyError::ArithmeticOverflow)?;

    // Create activity feed entry
    activity_feed.user = ctx.accounts.follower.key();
    activity_feed.activity_type = ActivityFeed::ACTIVITY_USER_FOLLOWED;
    activity_feed.target = following_profile.key();
    activity_feed.metadata = format!("Followed {}", following_profile.username);
    activity_feed.created_at = clock.unix_timestamp;

    msg!("User {} followed {}", follower_profile.username, following_profile.username);
    Ok(())
}

#[derive(Accounts)]
pub struct LikeTrack<'info> {
    #[account(mut)]
    pub track: Account<'info, Track>,

    #[account(
        init,
        payer = user,
        space = TrackLike::MAX_SIZE,
        seeds = [b"track_like", user.key().as_ref(), track.key().as_ref()],
        bump
    )]
    pub track_like: Account<'info, TrackLike>,

    #[account(
        mut,
        seeds = [b"user_stats", user.key().as_ref()],
        bump
    )]
    pub user_stats: Account<'info, UserStats>,

    #[account(
        mut,
        seeds = [b"user_stats", track.created_by.as_ref()],
        bump
    )]
    pub creator_stats: Account<'info, UserStats>,

    #[account(
        init,
        payer = user,
        space = ActivityFeed::MAX_SIZE,
        seeds = [b"activity_feed", user.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub activity_feed: Account<'info, ActivityFeed>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FollowUser<'info> {
    #[account(
        mut,
        seeds = [b"user_profile", follower.key().as_ref()],
        bump
    )]
    pub follower_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [b"user_profile", following_profile.authority.as_ref()],
        bump
    )]
    pub following_profile: Account<'info, UserProfile>,

    #[account(
        init,
        payer = follower,
        space = UserFollow::MAX_SIZE,
        seeds = [b"user_follow", follower.key().as_ref(), following_profile.key().as_ref()],
        bump
    )]
    pub user_follow: Account<'info, UserFollow>,

    #[account(
        init,
        payer = follower,
        space = ActivityFeed::MAX_SIZE,
        seeds = [b"activity_feed", follower.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub activity_feed: Account<'info, ActivityFeed>,

    #[account(mut)]
    pub follower: Signer<'info>,

    pub system_program: Program<'info, System>,
}
