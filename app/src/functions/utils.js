import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import idl from "../idl.json"
import { BN } from "bn.js"
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import * as buffer from "buffer";
import { useEffect } from 'react';
window.Buffer = buffer.Buffer;

const PROGRAM_KEY = new PublicKey(idl.metadata.address)

const MASTER_SEED = 'master'
const LOTTERY_SEED = 'lottery'
const TICKET_SEED = 'ticket'

export const getMasterAddress = async () => {
    return (
        await PublicKey.findProgramAddress(
            [Buffer.from(MASTER_SEED)], 
            PROGRAM_KEY
        )
    )[0]
}

export const getLotteryAddress = async (id) => {
    return (
        await PublicKey.findProgramAddress(
            [Buffer.from(LOTTERY_SEED), new BN(id).toArrayLike(Buffer, 'le', 4)],
            PROGRAM_KEY
        )
    )[0]
}

export const getTicketAddress = async (LotteryPk, id) => {
    return (
        await PublicKey.findProgramAddress(
            [
                Buffer.from(TICKET_SEED),
                LotteryPk.toBuffer(),
                new BN(id).toArrayLike(Buffer, 'le', 4),
            ],
            PROGRAM_KEY
        )
    )[0]
}

export const getTicketData = async (program, lotteryId, publicKey) => {
    return (
        await program.account.ticket.all(
            [
                {
                    memcmp: {
                        bytes: bs58.encode(new BN(lotteryId).toArrayLike(Buffer, "le", 4)), 
                        offset: 48,
                    },
                },
                {
                    memcmp: { 
                        bytes: publicKey.toBase58(), 
                        offset: 16,
                    } 
                },
                
            ]
        )
        
    )
}

export const getTicket = async (program, ticketId) => {
    return (
        await program.account.ticket.all(
            [
                {
                    memcmp: {
                        bytes: bs58.encode(new BN(ticketId).toArrayLike(Buffer, "le", 4)), 
                        offset: 8,
                    },
                },
            ]
        )
    )
}

export const getTotalPrize = async (Lottery) => {
    return new BN(Lottery.lastTicketId)
    .mul(Lottery.ticketyPrice)
    .div(new BN(LAMPORTS_PER_SOL))
    .toString();
}

/**
 * useKeyPress
 * @param {string} key - the name of the key to respond to, compared against event.key
 * @param {function} action - the action to perform on key press
 */
export default function useKeypress(key, action) {
  useEffect(() => {
    function onKeyup(e) {
      if (e.key === key) action()
    }
    window.addEventListener('keyup', onKeyup);
    return () => window.removeEventListener('keyup', onKeyup);
  }, []);
}