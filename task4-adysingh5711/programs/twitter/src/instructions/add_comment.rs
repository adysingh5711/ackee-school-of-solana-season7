//-------------------------------------------------------------------------------
///
/// TASK: Implement the add comment functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that comment content doesn't exceed maximum length
/// - Initialize a new comment account with proper PDA seeds
/// - Set comment fields: content, author, parent tweet, and bump
/// - Use content hash in PDA seeds for unique comment identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()>{
    // Validate comment content length
    if comment_content.len() > COMMENT_LENGTH {
        return Err(TwitterError::CommentTooLong.into());
    }

    // Verify the PDA was derived correctly with the comment content
    let content_hash = hash(comment_content.as_bytes());
    let expected_seeds = &[
        COMMENT_SEED.as_bytes(),
        ctx.accounts.comment_author.key().as_ref(),
        content_hash.to_bytes().as_ref(),
        ctx.accounts.tweet.key().as_ref()
    ];
    let (expected_pda, expected_bump) = Pubkey::find_program_address(expected_seeds, ctx.program_id);
    
    if expected_pda != ctx.accounts.comment.key() {
        return Err(ProgramError::InvalidSeeds.into());
    }

    let comment = &mut ctx.accounts.comment;
    let tweet = &ctx.accounts.tweet;

    comment.comment_author = ctx.accounts.comment_author.key();
    comment.parent_tweet = tweet.key();
    comment.content = comment_content;
    comment.bump = expected_bump;
    
    Ok(())
}


#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    #[account(mut)]
    pub comment_author: Signer<'info>,

    #[account(
        init,
        payer = comment_author,
        space = 8 + Comment::INIT_SPACE
    )]
    pub comment: Account<'info, Comment>,
    
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}