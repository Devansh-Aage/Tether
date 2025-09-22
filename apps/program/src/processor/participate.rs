use crate::{helper::*, Participant, TetherError};
use core::mem::size_of;
use pinocchio::{
    account_info::AccountInfo, instruction::Seed, program_error::ProgramError,
    pubkey::find_program_address, ProgramResult,
};
use pinocchio_token_2022::state::TokenAccount;

pub struct ParticipateAccounts<'a> {
    pub signer: &'a AccountInfo,
    pub participant: &'a AccountInfo,
    pub participant_ata: &'a AccountInfo,
    pub mint: &'a AccountInfo,
    pub token_program: &'a AccountInfo,
    pub system_program: &'a AccountInfo,
}

impl<'a> TryFrom<&'a [AccountInfo]> for ParticipateAccounts<'a> {
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

pub struct ParticipateData {
    pub active_time: i64,
    pub seed: u64,
}

impl<'a> TryFrom<&'a [u8]> for ParticipateData {
    type Error = ProgramError;

    fn try_from(data: &'a [u8]) -> Result<Self, Self::Error> {
        let expected_len = size_of::<i64>() + size_of::<u64>();

        if data.len() != expected_len {
            return Err(ProgramError::InvalidInstructionData);
        };

        let active_time = i64::from_le_bytes(data[0..8].try_into().unwrap());
        let seed = u64::from_le_bytes(data[8..16].try_into().unwrap());

        Ok(Self { active_time, seed })
    }
}

pub struct Participate<'a> {
    pub accounts: ParticipateAccounts<'a>,
    pub instruction_data: ParticipateData,
    pub bump: u8,
}

impl<'a> TryFrom<(&'a [u8], &'a [AccountInfo])> for Participate<'a> {
    type Error = ProgramError;

    fn try_from((data, accounts): (&'a [u8], &'a [AccountInfo])) -> Result<Self, Self::Error> {
        let accounts = ParticipateAccounts::try_from(accounts)?;
        let instruction_data = ParticipateData::try_from(data)?;

        let (_, bump) = find_program_address(
            &[
                b"participant",
                accounts.signer.key(),
                &instruction_data.seed.to_le_bytes(),
            ],
            &crate::ID,
        );

        let seed_binding = instruction_data.seed.to_le_bytes();
        let bump_binding = [bump];
        let participant_seeds: [Seed<'_>; 4] = [
            Seed::from(b"participant"),
            Seed::from(accounts.signer.key().as_ref()),
            Seed::from(&seed_binding),
            Seed::from(&bump_binding),
        ];

        ProgramAccount::init::<Participant>(
            accounts.participant,
            accounts.signer,
            &participant_seeds,
            Participant::LEN,
        )?;

        AssociatedTokenAccount::init_if_needed(
            accounts.participant_ata,
            accounts.mint,
            accounts.signer,
            accounts.signer,
            accounts.system_program,
            accounts.token_program,
        )?;

        Ok(Self {
            accounts,
            instruction_data,
            bump,
        })
    }
}

impl<'a> Participate<'a> {
    pub const DISCRIMINATOR: &'a u8 = &0;
    pub fn process(&mut self) -> ProgramResult {
        let token_account = TokenAccount::from_account_info(self.accounts.participant_ata)?;
        let token_balance = token_account.amount();

        if token_balance == 0 {
            return Err(TetherError::InsufficientFunds.into());
        }

        let mut data = self.accounts.participant.try_borrow_mut_data()?;
        let participant = Participant::load_mut(data.as_mut())?;

        participant.set_inner(
            token_balance,
            self.instruction_data.active_time,
            self.instruction_data.seed,
            *self.accounts.signer.key(),
            [self.bump],
        );
        Ok(())
    }
}
