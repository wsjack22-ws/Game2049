use anchor_lang::{
    prelude::*,
    solana_program::{clock::Clock, hash::hash, program::invoke, system_instruction::transfer}
};

// This is your program's public key and it will update
// automatically when you build the project.


pub mod constant;
pub mod states;
pub mod error;

use crate::{constant::*, states::*, error::*};

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("9k1V22CNcbiypDF1SjSjCX56mKgFHhL51kpSteg5PkTU");


#[program]
pub mod lottery{
    use super::*;

    pub fn init_master(ctx: Context<InitMaster>) -> Result<()>{
        Ok(())
    }

    pub fn create_lottery(ctx: Context<CreateLottery>, ticket_price: u64) -> Result<()>{
        // lottery account -> id, winning address, total prize, if the prize was claimed, who has authority
        let lottery = &mut  ctx.accounts.lottery;
        let master = &mut   ctx.accounts.master;
        
        //increment the last ticket id
        master.last_id +=1;

        //set lottery values
        lottery.id = master.last_id;
        lottery.authority = ctx.accounts.authority.key();
        lottery.ticket_price = ticket_price;
        lottery.scores = [None, None, None];
        lottery.ids = [None, None, None];

        msg!("Created lottery: {}", lottery.id);
        msg!("Authority: {}", lottery.authority);
        msg!("Ticket price: {}", ticket_price);


        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>, lottery_id:u32, score: u32) -> Result<()> {
        
        //create ticket account, pay the lottery with the ticket price
        let lottery = &mut ctx.accounts.lottery;
        let ticket = &mut ctx.accounts.ticket;
        let buyer = &ctx.accounts.buyer;
        
        if lottery.winner_id.is_some(){
            return err!(LotteryError::WinnerAlreadyExists);
        }

        // Transfer SOL to Lottery PDA
        invoke(
            &transfer(
                &buyer.key(),
                &lottery.key(), 
                lottery.ticket_price
                ),
                &[
                    buyer.to_account_info(),
                    lottery.to_account_info(),
                    ctx.accounts.system_program.to_account_info()
                ],
        )?;

        lottery.last_ticket_id += 1;


        ticket.id = lottery.last_ticket_id;
        ticket.lottery_id = lottery_id;
        ticket.score = score;
        ticket.authority = buyer.key();


        // Update this pair to leaderboard(scores)

        let mut insert_index = None;

        //find the correct insert index
        for (i, entry) in lottery.scores.iter().enumerate() {
            if entry.is_none() {
                insert_index = Some(i);
                break;
            } else if let Some(entry_score) = entry {
                if score > *entry_score {
                    insert_index = Some(i);
                    break;
                }
            }
        }

        // insert into lottery.scores

        if let Some(index) = insert_index {

            let mut scores = lottery.scores;
            let mut ids = lottery.ids;

            scores[LEADERBOARD_SIZE-1] = None; // remove the last element
            let mut last_score = None;
            let mut new_scores:[Option<u32>; LEADERBOARD_SIZE] = scores;
            
            for (i, entry) in scores.iter().enumerate(){
                if i >= index{
                    let temp = scores[i];
                    new_scores[i] = last_score;
                    last_score = temp;
                }
                else{
                    new_scores[i] = scores[i];
                }
            }
            new_scores[index] = Some(ticket.score);
            ctx.accounts.lottery.scores = new_scores;

            ids[LEADERBOARD_SIZE-1] = None; // remove the last element            
            let mut last_id = None;
            let mut new_ids:[Option<u32>; LEADERBOARD_SIZE] = ids;
            
            for (i, entry) in ids.iter().enumerate(){
                if i >= index{
                    let temp = ids[i];
                    new_ids[i] = last_id;
                    last_id = temp;
                }
                else{
                    new_ids[i] = ids[i];
                }
            }
            new_ids[index] = Some(ticket.id);
            ctx.accounts.lottery.ids = new_ids;
        }

        msg!("Ticket id: {}", ticket.id);
        msg!("Ticket authority: {}", ticket.authority);

        Ok(())



    }



    pub fn pick_winner(ctx:Context<PickWinner>) -> Result<()>{
        //select a random ticket as a winner and set the winner_id
        let lottery = &mut ctx.accounts.lottery;

        if lottery.winner_id.is_some(){
            return  err!(LotteryError::WinnerAlreadyExists);
        }

        if lottery.last_ticket_id == 0{
            return  err!(LotteryError::NoTickets);
        }


        //Pick a psuedo-random winner
        let clock = Clock::get()?;
        let pseudo_random_number = ((u64::from_le_bytes(
            <[u8;8]>::try_from(&hash(&clock.unix_timestamp.to_be_bytes()).to_bytes()[..8]).unwrap(),
        ) * clock.slot)
            % u32::MAX as u64) as u32;

        let winner_id = (pseudo_random_number % lottery.last_ticket_id) + 1;
        lottery.winner_id = Some(winner_id);

        msg!("Winner id: {}", winner_id);

        Ok(())
    }

    pub fn claim_prize(ctx:Context<ClaimPrize>, lottery_id:u32, ticket_id:u32) -> Result<()>{
        let lottery = &mut ctx.accounts.lottery;
        let ticket = &mut ctx.accounts.ticket;
        let winner = &ctx.accounts.authority;

        if lottery.claimed{
            return err!(LotteryError::AlreadyClaimed);
        }
        //validate winner_id

        match lottery.winner_id {
            Some(winner_id) => {
                if winner_id != ticket_id {
                    return  err!(LotteryError::InvalidWinner);
                }

                if ticket



            }
            None => return err!(LotteryError::WinnerNoChosen)
        }
        
        //Transfer the prize from lottery PDA to the winner
        let prize = lottery
            .ticket_price
            .checked_mul(lottery.last_ticket_id.into())
            .unwrap();

        ** lottery.to_account_info().try_borrow_mut_lamports()? -= prize; // take the total prize from the lottery
        **winner.to_account_info().try_borrow_mut_lamports()? += prize; // add the same amount to the winner

        lottery.claimed = true;

        msg!("{} CLAIMED {} lamports from lottery id {} with ticket id {}", 
            winner.key(),
             prize,
             lottery.id,
             ticket.id
        );

        Ok(())
    }

}


#[derive(Accounts)]
pub struct InitMaster<'info>{
    #[account(
        init,
        payer = payer,
        space = 4 + 8,
        seeds = [MASTER_SEED.as_bytes()],
        bump,
    )]
    pub master: Account<'info, Master>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}



#[derive(Accounts)]
pub struct CreateLottery<'info> {
    #[account(
        init,
        payer = authority,
        space = 54 + LEADERBOARD_SIZE*(5 + 5) +8,
        seeds = [LOTTERY_SEED.as_bytes(), &(master.last_id + 1).to_le_bytes()],
        bump,

    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        mut,
        seeds = [MASTER_SEED.as_bytes()],
        bump,
    )]
    pub master: Account<'info, Master>,
    

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>
}


#[derive(Accounts)]
#[instruction(lottery_id:u32, score:u32)]
pub struct BuyTicket<'info> {
    #[account(
        mut,
        seeds = [LOTTERY_SEED.as_bytes(), &lottery_id.to_le_bytes()],
        bump,
    )]
    pub lottery: Account<'info, Lottery>,


    #[account(
        init,
        payer = buyer,
        space = 4 + 4 + 4 + 32 + 8,
        seeds = [
            TICKET_SEED.as_bytes(), 
            lottery.key().as_ref(), 
            &(lottery.last_ticket_id + 1).to_le_bytes()
        ],
        bump,
    )]
    pub ticket: Account<'info, Ticket>,

    
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,

}


#[derive(Accounts)]
#[instruction(lottery_id: u32)]
pub struct PickWinner<'info>{
    #[account(
        mut,
        seeds = [LOTTERY_SEED.as_bytes(), &lottery_id.to_le_bytes()],
        bump,
        has_one = authority
    )]
    pub lottery: Account<'info, Lottery>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(lottery_id: u32, ticket_id: u32)]
pub struct ClaimPrize<'info> {
    #[account(
        mut,
        seeds = [LOTTERY_SEED.as_bytes(), &lottery_id.to_be_bytes()],
        bump,
    )]
    pub lottery: Account<'info, Lottery>,

    #[account(
        seeds = [
            TICKET_SEED.as_bytes(),
            lottery.key().as_ref(),
            &ticket_id.to_be_bytes(),
        ],
        bump,
        has_one = authority,
    )]
    pub ticket : Account<'info, Ticket>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>

}