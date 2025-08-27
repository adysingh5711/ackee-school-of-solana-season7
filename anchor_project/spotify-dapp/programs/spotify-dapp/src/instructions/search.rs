use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::SpotifyError;

// Search functionality will be implemented through view functions
// These are helper functions for the frontend to query data

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SearchFilters {
    pub genre: Option<String>,
    pub min_duration: Option<u64>,
    pub max_duration: Option<u64>,
    pub min_likes: Option<u64>,
    pub created_after: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SearchResult {
    pub result_type: u8, // 1 = track, 2 = playlist, 3 = user
    pub pubkey: Pubkey,
    pub title: String,
    pub subtitle: String,
    pub likes_count: u64,
    pub created_at: i64,
}

impl SearchResult {
    pub const RESULT_TYPE_TRACK: u8 = 1;
    pub const RESULT_TYPE_PLAYLIST: u8 = 2;
    pub const RESULT_TYPE_USER: u8 = 3;
}

// Create search index for better performance
pub fn create_search_index(
    ctx: Context<CreateSearchIndex>,
    search_term: String,
    target_type: u8,
    target_pubkey: Pubkey,
) -> Result<()> {
    let search_index = &mut ctx.accounts.search_index;
    let clock = Clock::get()?;

    require!(search_term.len() <= 64, SpotifyError::SearchTermTooLong);
    require!(search_term.len() > 0, SpotifyError::SearchTermEmpty);

    search_index.search_term = search_term.to_lowercase();
    search_index.target_type = target_type;
    search_index.target_pubkey = target_pubkey;
    search_index.created_at = clock.unix_timestamp;

    msg!("Search index created for: {}", search_index.search_term);
    Ok(())
}

#[account]
pub struct SearchIndex {
    pub search_term: String,      // Searchable term (4 + 64 = 68 bytes)
    pub target_type: u8,          // Type of target (1 byte)
    pub target_pubkey: Pubkey,    // Target account (32 bytes)
    pub created_at: i64,          // When indexed (8 bytes)
}

impl SearchIndex {
    pub const MAX_SIZE: usize = 8 + 68 + 1 + 32 + 8; // 117 bytes
}

#[derive(Accounts)]
#[instruction(search_term: String, target_type: u8)]
pub struct CreateSearchIndex<'info> {
    #[account(
        init,
        payer = authority,
        space = SearchIndex::MAX_SIZE,
        seeds = [b"search_index", search_term.to_lowercase().as_bytes(), &target_type.to_le_bytes()],
        bump
    )]
    pub search_index: Account<'info, SearchIndex>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}
