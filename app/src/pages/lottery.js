import { useEffect, useMemo, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Program } from "@project-serum/anchor"
import idl from "../idl.json"
import { AnchorProvider } from "@project-serum/anchor"
import twitterLogo from "../assets/twitter-logo.svg"
import RankContainer from "../components/RankContainer"
import { useLottery } from "../context/Lottery"
import { PublicKey } from "@solana/web3.js"

const PROGRAM_KEY = new PublicKey(idl.metadata.address);

const TWITTER_LINK = `https://twitter.com/Game2049`;

function getProgram(provider) {
  return new Program(idl, PROGRAM_KEY, provider);
}

export const LotteryPage = () => {
    const { score, lotteryData, ticketData, buyTicket, claimPrize } = useLottery();
    const wallet = useWallet();
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [provider, setProvider] = useState();
    const [program, setProgram] = useState();
    const [lotteryPot, setLotteryPot] = useState(0);
    const [history, setHistory] = useState([]);

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
        setLotteryPot(lotteryData.lastTicketId * lotteryData.ticketPrice / 1000000000)
      }
  }, [lotteryData])

  useEffect(() => {
        if (ticketData) {
          console.log("ticket: ", ticketData)
          let temp = []
          for (let i = 0; i < ticketData.length; i++) {
            temp.push({rank: i+1, name:ticketData[i].account.authority.toString(), score: ticketData[i].account.score})
            console.log(ticketData[i].account.authority.toString())
          }
          setHistory(temp)
        }
      }, [ticketData])

    return (


<div className="App">
<div className="container">
    <div className="header-container">
        <p className="header">Game 2049 ✨</p>
        <p className="header"> Current Pot</p>
        <p className="header"> {lotteryPot} sol</p>
        
    <button className="cta-button" onClick={buyTicket}>Buy Ticket</button>
    <button className="cta-button" onClick={claimPrize}>Claim Prize</button>


<RankContainer topUsers={history}></RankContainer>
</div>
  <div className="footer-container">
    <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
    <a
      className="footer-text"
      href={TWITTER_LINK}
      target="_blank"
      rel="noreferrer"
    >{`follow us for more infomation`}</a>
  </div>
</div>
</div>
    )
}