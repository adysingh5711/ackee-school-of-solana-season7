//-------------------------------------------------------------------------------
///
/// TASK: Implement the deposit functionality for the on-chain vault
/// 
/// Requirements:
/// - Verify that the user has enough balance to deposit
/// - Verify that the vault is not locked
/// - Transfer lamports from user to vault using CPI (Cross-Program Invocation)
/// - Emit a deposit event after successful transfer
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;
use crate::state::Vault;
use crate::errors::VaultError;
use crate::events::DepositEvent;

#[derive(Accounts)]
pub struct Deposit<'info> {
    // TODO: Add required accounts and constraints
    #[account(mut)]
    pub user: Signer<'info>,
    /// The account that will receive the deposited funds
    #[account(
        mut,
        constraint = !vault.locked @ VaultError::VaultLocked
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    // TODO: Implement deposit functionality
    // Ensure the amount is greater than zero
    require!(amount > 0, VaultError::InvalidAmount);
    
    // Extract accounts from context
    let vault = &mut ctx.accounts.vault;
    let user = &ctx.accounts.user;
    let system_program = &ctx.accounts.system_program;

    // Check if the user has enough balance to deposit
    let user_balance = user.lamports();
    require!(user_balance >= amount, VaultError::InsufficientBalance);

    // Check if the vault is locked
    require!(!vault.is_locked(), VaultError::VaultLocked);

    // Transfer lamports from user to vault using CPI
    let cpi_context = CpiContext::new(
        system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: user.to_account_info(),
            to: vault.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, amount)?;

    // Update vault balance
    vault.balance = vault.balance.checked_add(amount).ok_or(VaultError::Overflow)?;

    // Emit deposit event
    emit!(DepositEvent {
        amount,
        user: user.key(),
        vault: vault.key(),
    });

    Ok(())
}