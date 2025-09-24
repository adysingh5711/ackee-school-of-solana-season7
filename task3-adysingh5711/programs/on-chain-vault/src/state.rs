use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Vault {
    pub vault_authority: Pubkey,
    pub locked: bool,
    pub balance: u64,
}

impl Vault {
    pub fn is_locked(&self) -> bool {
        self.locked
    }

    pub fn is_active(&self) -> bool {
        !self.locked
    }
}
