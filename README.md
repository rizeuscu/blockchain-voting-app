# Blockchain Voting App

## Project description

The Voting App project is a decentralized web app for secure and transparent voting in elections, referendums, or decision-making processes where the blockchain technology should ensure the integrity of votes and provide accessible and verifiable election results. The project satisfies the needs of a transparent election process where everyone (not only the allowed voters) can accessibly count the votes on their own (or using programmatic solutions) based on the blockchain transactions that may occur for the votes.

As all of the votes will be publicly visible and countable, it’s very easy to discover any misconduct (ex: people that voted but they shouldn’t have been allowed, people that somehow voted multiple times, valid votes that were not counted at the total etc.). The project uses the MultiversX as the underlying blockchain solution to build upon, but it may very well be applied to other blockchains as well.

It allows people to vote by logging in with their MultiversX wallet on the web application. There they will see all past, current and future elections and they will have an option to vote their desired option (whether that’s a candidate for an election or an answer for a referendum etc.). Currently, only single choices are allowed, but that could be easily extended to allow multiple choices. However, most elections allow single choice options in the real elections. They can also see their previous transactions related to the smart contract that deals with the voting logistics (ex: their previous voting transactions) that would redirect them to the Blockchain web application where they could see more details.

The owner of the smart contract dealing with elections logic would technically be an authority of the state which based on census data should provide each citizen with a wallet on the blockchain and mark only one wallet per citizen as valid for voting for a certain election. For some elections some citizens may not be allowed voting (ex: local elections which should only be decided by people living in that area) or their right to vote may be removed (ex: they were wrongly allowed to vote for an election by the authorities).

Finally, the smart contract does not keep track of what each person voted, but rather of the number of votes for a candidate/option in a certain election. Also, it keeps track of whether a certain person voted or not so that we don’t allow people to vote multiple times in the same election process. However, for a higher transparency all transactions can be verified on the smart contract MultiversX page if any authority or person is in doubt of the integrity of any election process (voting data is public and accessible by anyone).


## Smart Contract

The backend of the project consists of a smart contract deployed on the MultiversX blockchain which handles the entire election process. It consists of a few endpoints which handle this logic. Most of them are available for the owner of the contract only. I used the Smart Contracts practical session documentation in order to build, compile and deploy the contract (https://cs-pub-ro.github.io/blockchain-protocols-and-distributed-applications/Practical%20Sessions/Smart%20Contracts/). The contract was developed using Rust.

Additionally, in the output directory there are a few json files which allow for easier creation of election process, adding an allowed voter to a certain election process and voting for a certain candidate.

Moreover, the contract was deployed using a test wallet (alice). More test wallets for further testing the project can be found here: https://github.com/multiversx/mx-sdk-rs/tree/master/sdk/core/src/test_wallets.

### Endpoints description

#### createElection (only_owner)
- creates a new election process containing a name, start and end times and the candidates/options to choose from
- increments a code which represents the number of the election process since deployment of smart contract (starts from 0)
- it is availalbe for the owner of the smart contract only

#### addAllowedVoter (only_owner)
- allows adding a wallet address as a valid voter for a certain election number (based on the code that gets incremented when calling createElection)
- checks first if election code exists

#### removeAllowedVoter (only_owner)
- allows removing a wallet address from the allowed voters for a certain election number (based on the code that gets incremented when calling createElection)
- checks first if election code exists
- checks if voter is part of allowed voters so that it can be removed

#### vote
- allows people to vote in a certain election for a single candidate/option
- checks if election code exists
- checks if choosen candidate/option exists
- checks if election has started and not yet ended
- checks right to vote of caller
- checks if caller already voted in this election
- increments number of votes for chosen candidate/option

#### getElectionsMetadata (view endpoint)
- returns important details (except vote count) for all created elections (name of the election, start and end time and candidates/options to choose from)

#### getElectionResults (view endpoint)
- based on the election code requested it returns the vote count (and their name) for every candidate in that specified election code

### Election Creation (only_owner)
`bogdan@mbp src % mxpy contract call erd1qqqqqqqqqqqqqpgqftnvcjlfvwpl5x0mwv58dn3k0t6dff8qd8ssugu57s --function="createElection" --arguments-file request_create_election.json --proxy=https://devnet-api.multiversx.com --chain=D --gas-limit=8000000 --recall-nonce --pem ../../../Documents/Master\ 2024/BPDA/alice.pem --send --abi ../output/blockchain-voting-app.abi.json`

### Add Allowed Voter (only_owner)
`bogdan@mbp src % mxpy contract call erd1qqqqqqqqqqqqqpgqftnvcjlfvwpl5x0mwv58dn3k0t6dff8qd8ssugu57s --function="addAllowedVoter" --arguments-file request_add_allowed_voter.json --proxy=https://devnet-api.multiversx.com --chain=D --gas-limit=8000000 --recall-nonce --pem ../../../Documents/Master\ 2024/BPDA/alice.pem --send --abi ../output/blockchain-voting-app.abi.json`

### Remove Allowed Voter (only_owner)
`bogdan@mbp src % mxpy contract call erd1qqqqqqqqqqqqqpgqftnvcjlfvwpl5x0mwv58dn3k0t6dff8qd8ssugu57s --function="removeAllowedVoter" --arguments-file request_add_allowed_voter.json --proxy=https://devnet-api.multiversx.com --chain=D --gas-limit=8000000 --recall-nonce --pem ../../../Documents/Master\ 2024/BPDA/alice.pem --send --abi ../output/blockchain-voting-app.abi.json`

## Decentralized Web App

The frontend part of the project is a web app based on the MultiversX sdk-dapp documentation (https://docs.multiversx.com/sdk-and-tools/sdk-dapp/). The app is not completely developed from scratch, but built on top of a demo app featured in the sdk-dapp documentation (https://github.com/multiversx/mx-template-dapp). The web app was developed using the React framework.

### Components
Once logged in with their MultiversX wallet users will be redirected to the Dashboard of the web app where they will see 3 main components. We will explain each of them in brief detail.

#### Account
- displays address of the account and current balance on the wallet of the logged in user

#### Voting transactions
- this component displays all voting related transactions (transactions that are related to the smart contract erd1qqqqqqqqqqqqqpgqftnvcjlfvwpl5x0mwv58dn3k0t6dff8qd8ssugu57s which deals with all the voting logic)
- logged in user can see all their previous vote related transactions and click on them which will redirect them to the MultiversX transaction page where they can see more details like in which election they voted and what was their chosen option (they can check that in the Input Data section)

#### Elections Data and Results
- this component displays all past, current and future election processes, the start and end time of each of them and the candidates/options for each one in particular
- there is a 'Vote' button displayed which allows choosing one of the options in the 'Candidates' column and submitting the transaction to the blockchain
- if allowed to vote, the transaction will go through, otherwise it will fail (it can also fail if the election process has ended or has not started yet)
