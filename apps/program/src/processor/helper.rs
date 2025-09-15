use crate::{error::TetherError, Participant};
use pinocchio::{
    account_info::AccountInfo,
    instruction::{Seed, Signer},
    program_error::ProgramError,
    pubkey::find_program_address,
    sysvars::{rent::Rent, Sysvar},
    ProgramResult,
};
use pinocchio_associated_token_account::instructions::Create;
use pinocchio_system::instructions::CreateAccount;

pub trait AccountCheck {
    fn check(account: &AccountInfo) -> Result<(), ProgramError>;
}

pub struct SignerAccount;

impl AccountCheck for SignerAccount {
    fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_signer() {
            return Err(TetherError::NotSigner.into());
        }
        Ok(())
    }
}

pub struct SystemAccount;

impl AccountCheck for SystemAccount {
    fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&pinocchio_system::ID) {
            return Err(TetherError::InvalidOwner.into());
        }
        Ok(())
    }
}

pub struct ProgramAccount;
pub trait ProgramAccountInit {
    fn init<'a, T: Sized>(
        account: &AccountInfo,
        payer: &AccountInfo,
        seeds: &[Seed<'a>],
        space: usize,
    ) -> ProgramResult;
}

impl AccountCheck for ProgramAccount {
    fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&crate::ID) {
            return Err(ProgramError::InvalidAccountOwner);
        }
        Ok(())
    }
}

impl ProgramAccountInit for ProgramAccount {
    fn init<'a, T: Sized>(
        account: &AccountInfo,
        payer: &AccountInfo,
        seeds: &[Seed<'a>],
        space: usize,
    ) -> ProgramResult {
        let lamports = Rent::get()?.minimum_balance(space);

        let signer = [Signer::from(seeds)];

        CreateAccount {
            from: payer,
            to: account,
            lamports,
            space: space as u64,
            owner: &crate::ID,
        }
        .invoke_signed(&signer)?;

        Ok(())
    }
}

// pub struct AdminAccount;

// impl AccountCheck for AdminAccount {
//     fn check(account: &AccountInfo) -> Result<(), ProgramError> {
//         if !account.is_owned_by(&crate::ID) {
//             return Err(TetherError::InvalidOwner.into());
//         }

//         if account.data_len().ne(&Admin::LEN) {
//             return Err(TetherError::InvalidAccountData.into());
//         }
//         Ok(())
//     }
// }

pub struct ParticipantAccount;

impl AccountCheck for ParticipantAccount {
    fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&crate::ID) {
            return Err(TetherError::InvalidOwner.into());
        }

        if account.data_len().ne(&Participant::LEN) {
            return Err(TetherError::InvalidAccountData.into());
        }
        Ok(())
    }
}

pub trait ProgramAccountClose {
    fn close(account: &AccountInfo, destination: &AccountInfo) -> ProgramResult;
}

impl ProgramAccountClose for ParticipantAccount {
    fn close(account: &AccountInfo, destination: &AccountInfo) -> ProgramResult {
        Self::check(account)?;
        {
            let mut data = account.try_borrow_mut_data()?;
            data[0] = 0xff;
        }
        *destination.try_borrow_mut_lamports()? += *account.try_borrow_lamports()?;
        account.resize(1)?;
        account.close()
    }
}

pub struct MintAccount;

impl AccountCheck for MintAccount {
    fn check(account: &AccountInfo) -> Result<(), ProgramError> {
        if !account.is_owned_by(&pinocchio_token_2022::ID) {
            return Err(TetherError::InvalidOwner.into());
        }
        Ok(())
    }
}

pub trait AssociatedTokenAccountCheck {
    fn check(
        account: &AccountInfo,
        authority: &AccountInfo,
        mint: &AccountInfo,
        token_program: &AccountInfo,
    ) -> Result<(), ProgramError>;
}

pub struct AssociatedTokenAccount;

impl AssociatedTokenAccountCheck for AssociatedTokenAccount {
    fn check(
        account: &AccountInfo,
        authority: &AccountInfo,
        mint: &AccountInfo,
        token_program: &AccountInfo,
    ) -> Result<(), ProgramError> {
        if !account.is_owned_by(&pinocchio_token_2022::ID) {
            return Err(TetherError::InvalidOwner.into());
        }

        if account
            .data_len()
            .ne(&pinocchio_token_2022::state::TokenAccount::BASE_LEN)
        {
            return Err(TetherError::InvalidAccountData.into());
        }

        if find_program_address(
            &[authority.key(), token_program.key(), mint.key()],
            &pinocchio_associated_token_account::ID,
        )
        .0
        .ne(account.key())
        {
            return Err(TetherError::InvalidAddress.into());
        }
        Ok(())
    }
}

pub trait AssociatedTokenAccountInit {
    fn init(
        account: &AccountInfo,
        mint: &AccountInfo,
        payer: &AccountInfo,
        owner: &AccountInfo,
        system_program: &AccountInfo,
        token_program: &AccountInfo,
    ) -> ProgramResult;

    fn init_if_needed(
        account: &AccountInfo,
        mint: &AccountInfo,
        payer: &AccountInfo,
        owner: &AccountInfo,
        system_program: &AccountInfo,
        token_program: &AccountInfo,
    ) -> ProgramResult;
}

impl AssociatedTokenAccountInit for AssociatedTokenAccount {
    fn init(
        account: &AccountInfo,
        mint: &AccountInfo,
        payer: &AccountInfo,
        owner: &AccountInfo,
        system_program: &AccountInfo,
        token_program: &AccountInfo,
    ) -> ProgramResult {
        Create {
            account,
            funding_account: payer,
            mint,
            wallet: owner,
            system_program,
            token_program,
        }
        .invoke()
    }

    fn init_if_needed(
        account: &AccountInfo,
        mint: &AccountInfo,
        payer: &AccountInfo,
        owner: &AccountInfo,
        system_program: &AccountInfo,
        token_program: &AccountInfo,
    ) -> ProgramResult {
        match Self::check(account, owner, mint, token_program) {
            Ok(_) => Ok(()),
            Err(_) => Self::init(account, mint, payer, owner, system_program, token_program),
        }
    }
}
