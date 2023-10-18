import React, { useEffect, useState, useMemo } from 'react';
import logo from '../assets/logo.png';
import '../css/App.css';
import RankContainer from '../components/RankContainer';
import idl from "../idl.json"
import { Program } from "@project-serum/anchor"
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from '@solana/web3.js';
import { useLottery } from '../context/Lottery';
import { AnchorProvider } from '@project-serum/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { getTicket } from '../functions/utils';

const PROGRAM_KEY = new PublicKey(idl.metadata.address);

// Constants
const TWITTER_LINK = `https://twitter.com/Game2049`;
const LEADER_BOARD_SIZE = 3;

function getProgram(provider) {
    console.log("provider:", provider)
    return new Program(idl, PROGRAM_KEY, provider);
  }

export const Rank = () => {
    const {score, lotteryData, ticketData, buyTicket, claimPrize} = useLottery();
    const [leaderBoardHistory, setLeaderBoardHistory] = useState([]);
    const [provider, setProvider] = useState();
    const connection = useConnection();
    const [program, setProgram] = useState();
    const [ticket_address, setTicketAddress] = useState([]);
    
    const wallet = useWallet();


    useEffect(() => {
      try {
          if (provider) {
              program = getProgram(provider);
          }
      } catch {

      }
  }, [provider])

  useEffect(() => {
      if (wallet) {
          const provider = new AnchorProvider(connection, wallet, {})
          setProvider(provider)
      }
  }, [connection, wallet])
  

    useEffect(() => {
        if (lotteryData) {
            let temp = []
            for (let i = 0; i < LEADER_BOARD_SIZE; i++) {
                //let ticket = await getTicket(program, lotteryData.lotteryId.ids[i])[0]
                //console.log("ticket: ", ticket)
                console.log("good")
                temp.push({rank: i+1, name: lotteryData.ids[i], score:lotteryData.scores[i]})
            }
            setLeaderBoardHistory(temp)
        }
    }, [lotteryData])


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">
            Leader Board ✨
          </p>
          <RankContainer topUsers={leaderBoardHistory}></RankContainer>
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={logo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`please follow us for more information`}</a>
        </div>
      </div>
    </div>
  );
};
