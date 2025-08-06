//-------------------------------------------------------------------------------
///
/// TASK: Implement the toggle lock functionality for the on-chain vault
/// 
/// Requirements:
/// - Toggle the locked state of the vault (locked becomes unlocked, unlocked becomes locked)
/// - Only the vault authority should be able to toggle the lock
/// - Emit a toggle lock event after successful state change
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::ToggleLockEvent;

#[derive(Accounts)]
pub struct ToggleLock<'info> {
    // TODO: Add required accounts and constraints
    #[account(
        mut,
        has_one = vault_authority @ VaultError::InvalidAuthority,
    )]
    pub vault: Box<Account<'info, Vault>>,
    
    #[account(mut)]
    pub vault_authority: Signer<'info>,
}

pub fn _toggle_lock(ctx: Context<ToggleLock>) -> Result<()> {
    // TODO: Implement toggle lock functionality
    // Toggle the locked state
    ctx.accounts.vault.locked = !ctx.accounts.vault.locked;
    // Emit toggle lock event
    emit!(ToggleLockEvent {
        vault: ctx.accounts.vault.key(),
        vault_authority: ctx.accounts.vault_authority.key(),
        locked: ctx.accounts.vault.locked
    });

    Ok(())
}