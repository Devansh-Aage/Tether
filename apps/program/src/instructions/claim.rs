use crate::{helper::*, AccountCheck, Participant, TetherError};
use core::mem::size_of;
use pinocchio::{
    account_info::AccountInfo,
    instruction::{Seed, Signer},
    program_error::ProgramError,
    sysvars::{clock::Clock, Sysvar},
    ProgramResult,
};
use pinocchio_token_2022::instructions::MintToChecked;

pub struct ClaimAccounts<'a> {
    pub signer: &'a AccountInfo,
    pub participant: &'a AccountInfo,
    pub participant_ata: &'a AccountInfo,
    pub mint: &'a AccountInfo,
    pub token_program: &'a AccountInfo,
    pub system_program: &'a AccountInfo,
}

impl<'a> TryFrom<&'a [AccountInfo]> for ClaimAccounts<'a> {
    type Error = ProgramError;
    fn try_from(accounts: &'a [AccountInfo]) -> Result<Self, Self::Error> {
        let [signer, participant, participant_ata, mint, token_program, system_program] = accounts
        else {
            return Err(ProgramError::NotEnoughAccountKeys);
        };

        SignerAccount::check(signer)?;
        ParticipantAccount::check(participant)?;
        AssociatedTokenAccount::check(participant_ata, signer, mint, token_program)?;
        MintAccount::check(mint)?;

        Ok(Self {
            signer,
            participant,
            participant_ata,
            mint,
            token_program,
            system_program,
        })
    }
}

pub struct ClaimData {
    pub is_winner: bool,
    pub mint_bump: u8,
}

impl<'a> TryFrom<&'a [u8]> for ClaimData {
    type Error = ProgramError;

    fn try_from(data: &'a [u8]) -> Result<Self, Self::Error> {
        if data.len() != size_of::<bool>() + size_of::<u8>() {
            return Err(ProgramError::InvalidInstructionData);
        }

        let is_winner = data[0] != 0;
        let mint_bump = data[1];

        Ok(Self {
            is_winner,
            mint_bump,
        })
    }
}

pub struct Claim<'a> {
    pub accounts: ClaimAccounts<'a>,
    pub instruction_data: ClaimData,
}

impl<'a> TryFrom<(&'a [u8], &'a [AccountInfo])> for Claim<'a> {
    type Error = ProgramError;

    fn try_from((data, accounts): (&'a [u8], &'a [AccountInfo])) -> Result<Self, Self::Error> {
        let accounts = ClaimAccounts::try_from(accounts)?;
        let instruction_data = ClaimData::try_from(data)?;

        let data = accounts.participant.try_borrow_data()?;
        let participant = Participant::load(&data)?;

        if accounts.signer.key() != &participant.participant {
            return Err(TetherError::InvalidAddress.into());
        }

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;

        if now < participant.active_time {
            return Err(TetherError::NotActive.into());
        }

        Ok(Self {
            accounts,
            instruction_data,
        })
    }
}

impl<'a> Claim<'a> {
    pub const DISCRIMINATOR: &'a u8 = &1;

    pub fn process(&mut self) -> ProgramResult {
        let data = self.accounts.participant.try_borrow_data()?;

        let participant = Participant::load(&data)?;

        let winner_percent: u64 = 25;
        let participant_percent: u64 = 5;

        let amount = match self.instruction_data.is_winner {
            true => winner_percent
                .checked_mul(participant.stake)
                .and_then(|v| v.checked_div(100))
                .ok_or(TetherError::WriteOverflow),
            false => participant_percent
                .checked_mul(participant.stake)
                .and_then(|v| v.checked_div(100))
                .ok_or(TetherError::WriteOverflow),
        }?;

        let bump_binding = [self.instruction_data.mint_bump];
        let mint_seeds = [
            Seed::from(b"mint"),
            Seed::from(self.accounts.mint.key().as_ref()),
            Seed::from(&bump_binding),
        ];

        let mint_signer = Signer::from(&mint_seeds);

        MintToChecked {
            account: self.accounts.participant_ata,
            mint: self.accounts.mint,
            mint_authority: self.accounts.mint,
            amount,
            decimals: 6,
            token_program: self.accounts.token_program.key(),
        }
        .invoke_signed(&[mint_signer])?;

        drop(data);
        ParticipantAccount::close(self.accounts.participant, self.accounts.signer)?;
        Ok(())
    }
}
