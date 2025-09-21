use shank::ShankInstruction;

#[derive(ShankInstruction)]
pub enum TetherInstructions {
    #[account(0, writable, signer, name = "signer", desc = "Signer account")]
    #[account(
        1,
        writable,
        name = "participant",
        desc = "Participant account to create"
    )]
    #[account(2, writable, name = "participant_ata", desc = "Participant's ATA")]
    #[account(3, writable, name = "mint", desc = "Mint Account")]
    #[account(4, name = "token_program", desc = "Token program")]
    #[account(5, name = "system_program", desc = "System program")]
    Participate { active_time: i64, seed: u64 },
    
    #[account(0, writable, signer, name = "signer", desc = "Signer account")]
    #[account(
        1,
        writable,
        name = "participant",
        desc = "Participant account to create"
    )]
    #[account(2, writable, name = "participant_ata", desc = "Participant's ATA")]
    #[account(3, writable, name = "mint", desc = "Mint Account")]
    #[account(4, name = "mint_auth", desc = "Mint Authority Account")]
    #[account(5, name = "token_program", desc = "Token program")]
    #[account(6, name = "system_program", desc = "System program")]
    Claim { is_winner: bool, mint_bump: u8 },
}
