# Game2049
Game2049 is a web3 gaming platform on Solana blockchain. It will contain a series of casual games in this platform. And we designed a sustainable incentive system to let the users gain profit and sense of achievement while playing the games.


We have a Solana contract deployed on Solana devnet.


How to run locally
Install tools
Instructions on how to install Anchor can be found here.

Install dependencies
Extract the zip file in your project's directory and run:

yarn
Build

anchor build
Test

anchor test
Run client

anchor run client
Note You might need to adjust the client and test code to fully work in local Node environment since there are playground exclusive features, e.g. if you are using pg.wallets.myWallet, you'll need to manually load each keypair.
