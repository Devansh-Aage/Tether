use pinocchio::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
    ProgramResult,
};
// entrypoint!(process_instruction);

pub mod state;
pub use state::*;
