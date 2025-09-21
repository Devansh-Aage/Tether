#![no_std]
use pinocchio::{
    account_info::AccountInfo, entrypoint, program_error::ProgramError, pubkey::Pubkey,
    ProgramResult,
};
entrypoint!(process_instruction);

pub mod state;
pub use state::*;

pub mod error;
pub use error::*;

pub mod processor;
pub use processor::*;

pub mod instructions;

// 22222222222222222222222222222222222222222222
pub const ID: Pubkey = [
    54, 169, 151, 168, 104, 33, 24, 251, 17, 118, 194, 168, 7, 243, 211, 255, 155, 250, 243, 218,
    10, 182, 127, 54, 204, 161, 44, 78, 220, 25, 103, 248,
];

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    match instruction_data.split_first() {
        Some((Participate::DISCRIMINATOR, data)) => {
            Participate::try_from((data, accounts))?.process()
        }
        Some((Claim::DISCRIMINATOR, data)) => Claim::try_from((data, accounts))?.process(),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}
