use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Vault is locked")]
    VaultLocked,
    #[msg("Overflow")]
    Overflow,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Vault is not active")]
    VaultNotActive,
}