use pinocchio::program_error::ProgramError;

#[derive(Clone, PartialEq)]
pub enum TetherError {
    //account not a signer
    NotSigner,
    // overflow error
    WriteOverflow,
    // invalid instruction data
    InvalidInstructionData,
    // invalid Account data
    InvalidAccountData,
    // pda mismatch
    PdaMismatch,
    // Invalid Owner
    InvalidOwner,
    // Invalid Address
    InvalidAddress,
    // Claim Not Active Yet
    NotActive,
    // Insufficient Funds
    InsufficientFunds,
}

impl From<TetherError> for ProgramError {
    fn from(e: TetherError) -> Self {
        Self::Custom(e as u32)
    }
}
