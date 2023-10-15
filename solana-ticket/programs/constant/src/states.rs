use anchor_lang::prelude::*;

pub const LEADERBOARD_SIZE: usize = 3;

#[account]
pub struct Master{
    pub last_id:u32, //4
}


#[account]
pub struct Lottery{
    pub id: u32, //4
    pub authority: Pubkey, // 32
    pub ticket_price: u64, //8
    pub last_ticket_id: u32, // 4
    pub winner_id: Option<u32>, // 4

    pub scores: [Option<u32>; LEADERBOARD_SIZE], // (score, ticket_id)
    pub ids: [Option<u32>; LEADERBOARD_SIZE],

    pub claimed: bool, //1
}

#[account]
pub struct Ticket{
    pub id: u32, //4 
    pub score: u32, // 4 
    pub authority: Pubkey, //32 
    pub lottery_id: u32, //4 
}