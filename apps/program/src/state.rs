use core::mem::size_of;
use pinocchio::{program_error::ProgramError, pubkey::Pubkey};

#[repr(C)]
pub struct Admin {
    pub admin: Pubkey,
    pub bump: [u8; 1],
}

impl Admin {
    pub const LEN: usize = size_of::<Pubkey>() + size_of::<[u8; 1]>();

    #[inline(always)]
    pub fn load(bytes: &[u8]) -> Result<&Self, ProgramError> {
        if bytes.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }

        Ok(unsafe { &*core::mem::transmute::<*const u8, *const Self>(bytes.as_ptr()) })
    }

    #[inline(always)]
    pub fn load_mut(bytes: &mut [u8]) -> Result<&mut Self, ProgramError> {
        if bytes.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(unsafe { &mut *core::mem::transmute::<*mut u8, *mut Self>(bytes.as_mut_ptr()) })
    }

    #[inline(always)]
    pub fn set_inner(&mut self, admin: Pubkey, bump: [u8; 1]) {
        self.admin = admin;
        self.bump = bump;
    }
}

#[repr(C)]
pub struct Participant {
    pub stake: u64,
    pub active_time: u64,
    pub participant: Pubkey,
    pub bump: [u8; 1],
}
impl Participant {
    pub const LEN: usize =
        size_of::<u64>() + size_of::<u64>() + size_of::<Pubkey>() + size_of::<[u8; 1]>();

    #[inline(always)]
    pub fn load(bytes: &[u8]) -> Result<&Self, ProgramError> {
        if bytes.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }

        Ok(unsafe { &*core::mem::transmute::<*const u8, *const Self>(bytes.as_ptr()) })
    }

    #[inline(always)]
    pub fn load_mut(bytes: &mut [u8]) -> Result<&mut Self, ProgramError> {
        if bytes.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }

        Ok(unsafe { &mut *core::mem::transmute::<*mut u8, *mut Self>(bytes.as_mut_ptr()) })
    }

    #[inline(always)]
    pub fn set_inner(&mut self, stake: u64, active_time: u64, participant: Pubkey, bump: [u8; 1]) {
        self.stake = stake;
        self.active_time = active_time;
        self.participant = participant;
        self.bump = bump;
    }
}
