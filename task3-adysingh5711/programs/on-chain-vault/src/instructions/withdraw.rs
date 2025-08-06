//-------------------------------------------------------------------------------
///
/// TASK: Implement the withdraw functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the vault is not locked
/// - Verify that the vault has enough balance to withdraw
/// - Transfer lamports from vault to vault authority
/// - Emit a withdraw event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::WithdrawEvent;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // TODO: Add required accounts and constraints
    
    #[account(mut)]
    pub vault_authority: Signer<'info>,
    
    #[account(
        mut,
        has_one = vault_authority,
        constraint = !vault.locked @ VaultError::VaultLocked
    )]
    pub vault: Account<'info, Vault>,
    
    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // TODO: Implement withdraw functionality
    // Ensure the amount is greater than zero
    require!(amount > 0, VaultError::InvalidAmount);

    let vault = &mut ctx.accounts.vault;
    let vault_authority = &ctx.accounts.vault_authority;

    // Check if the vault is locked
    require!(!vault.locked, VaultError::VaultLocked);

    // Check if the vault has enough balance to withdraw
    require!(vault.balance >= amount, VaultError::InsufficientBalance);

    // Transfer lamports from vault to authority using native lamport transfer
    **vault.to_account_info().try_borrow_mut_lamports()? = vault
        .to_account_info()
        .lamports()
        .checked_sub(amount)
        .ok_or(VaultError::Overflow)?;

    **vault_authority.to_account_info().try_borrow_mut_lamports()? = vault_authority
        .to_account_info()
        .lamports()
        .checked_add(amount)
        .ok_or(VaultError::Overflow)?;

    // Update vault balance with overflow check
    vault.balance = vault.balance.checked_sub(amount).ok_or(VaultError::Overflow)?;

    // Emit withdraw event
    emit!(WithdrawEvent {
        vault: vault.key(),
        amount,
        vault_authority: vault_authority.key(),
    });
    
    Ok(())
}