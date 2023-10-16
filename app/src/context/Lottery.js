import { useEffect } from "react";
import { Program } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet
} from "@solana/wallet-adapter-react";

import { createContext, useContext, useMemo, useState } from "react";
import idl from "../idl.json";
import { bs58, utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import { getLotteryAddress, getMasterAddress, getTicketAddress, getTotalPrize, getTicketData} from "../functions/utils"
import { SystemProgram } from "@solana/web3.js";
import { BN } from "bn.js";
import { Buffer } from "buffer";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";




const PROGRAM_KEY = new PublicKey(idl.metadata.address);
const LotteryContext = createContext();



export const useLottery = () => {
    const context = useContext(LotteryContext);
    if (!context) {
        throw new Error("Missing Lottery context");
    }
    return context;
}

export const LotteryProvider = ({ children }) => {
    //const [topUsers, setTopUsers] = useState([]);
    const [provider, setProvider] = useState();
    const wallet = useWallet();
    const anchorWallet = useAnchorWallet();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [ score, setScore ] = useState(3);
    const [ masterAddress, setMasterAddress ] = useState();
    const [ ticketAddress, setTicketId ] = useState([]);
    const [ lotteryAddress, setLotteryAddress] = useState();
    const [ lotteryId, setLotteryId ] = useState();
    const [ lotteryData, setLotteryData ] = useState();
    const [ ticketData, setTicketData ] = useState([]);
    const [ transactionPending, setTransactionPending ] = useState();

    const program = useMemo(() => {
        if (anchorWallet) {
            const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
            return new Program(idl, PROGRAM_KEY, provider)
        }
    }, [anchorWallet, connection]);
    
    useEffect(() => {

        const start = async () => {
            
            console.log("Starting")
            console.log("Program:", program)
            console.log("Public key:", publicKey)
          if (program && publicKey) {
            try {
                console.log("Program and public key exist")
                const mAddress = await getMasterAddress()
                console.log("masterAddress:", mAddress.toString())
                setMasterAddress(mAddress)
                const mData = await program.account.master.fetch(mAddress ?? (await getMasterAddress()))
                
                    const lAddress = await getLotteryAddress(mData.lastId)
                    console.log('LotteryAddress:', lAddress.toString())
                    const lotteryData = await program.account.lottery.fetch(lAddress ?? (await getLotteryAddress(mData.lastId)))
                    if (lotteryData) {
                        console.log(lotteryData)
                        setLotteryData(lotteryData)
                    } else {
                        console("lotteryData not found")
                    }
                    const ticketData = await getTicketData(program, lotteryId, publicKey)
                    console.log("Ticket data:", ticketData)
                    if (ticketData.length > 0) {
                        console.log(ticketData)
                        setTicketData(ticketData)
                    }
                    setLotteryAddress(lAddress ?? (await getLotteryAddress(mData.lastId)))
                    setLotteryId(mData.lastId)
                
              
            } catch (error) {
              console.log(error)
            }
          }
        }
    
        start()
    
  }, [program, publicKey, transactionPending]);
      

    const buyTicket = async () => {
        if (program && publicKey) {
            setTransactionPending(true)
            try {
                console.log("buying ticket")
                const ticketAddress = await getTicketAddress(lotteryAddress, lotteryData.lastTicketId + 1)

            await program.methods
                .buyTicket(lotteryId, score)
                .accounts({
                lottery: lotteryAddress ?? (await getLotteryAddress(lotteryId)),
                ticket: ticketAddress ?? (await getTicketAddress(lotteryAddress, lotteryData.lastTicketId + 1)),
                buyer: publicKey,
                systemProgram: SystemProgram.programId,
                })
                .rpc()
                console.log("Ticket bought")
            setTransactionPending(false)
            } catch (error) {
            console.log(error)
            }
        }
    }

    const claimPrize = async () => {
        if (program && publicKey && lotteryData) {
            setTransactionPending(true)
            try {
                console.log("Claiming prize")
                const ticketAddress = await getTicketAddress(lotteryAddress, lotteryData.winnerId)
                console.log("ticket address: ",ticketAddress.toString())
            await program.methods
                .claimPrize(lotteryId, lotteryData.winnerId)
                .accounts({
                lottery: lotteryAddress ?? (await getLotteryAddress(lotteryId)),
                ticket: ticketAddress ?? (await getTicketAddress(lotteryAddress, lotteryData.winnerId)),
                authority: publicKey,
                systemProgram: SystemProgram.programId,
                })
                .rpc()
                console.log("Prize claimed")
            setTransactionPending(false)
            } catch (error) {
            console.log(error)
            }
        }
    }

    return (
      <LotteryContext.Provider value={{
        lotteryData, 
        masterAddress,
        ticketData,
        buyTicket,
        claimPrize,
        }}>
            {children}
        </LotteryContext.Provider>
    )
}