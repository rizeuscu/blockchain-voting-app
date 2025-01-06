#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;
use multiversx_sc::derive_imports::*;

#[type_abi]
#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, Debug)]
pub struct ElectionMetadata<M: ManagedTypeApi> {
    pub name: ManagedBuffer<M>,
    pub candidates: ManagedVec<M, ManagedBuffer<M>>,
    pub start: u64,
    pub end: u64
}

#[type_abi]
#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, ManagedVecItem, Debug)]
pub struct VoteMetadata<M: ManagedTypeApi> {
    pub candidate: ManagedBuffer<M>,
    pub vote_count: BigUint<M>
}

#[multiversx_sc::contract]
pub trait BlockchainVotingApp {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint(addAllowedVoter)]
    #[only_owner]
    fn add_allowed_voter(&self, election_code: BigUint, allowed_voter: ManagedAddress) {
        // check if election exists
        let elections_metadata = self.elections_metadata();
        require!(elections_metadata.contains_key(&election_code.clone()), "Election code does not exist!");

        // add allowed voters to currently allowed voters for selected election
        let mut voters =  self.allowed_voters().get(&election_code.clone()).unwrap_or_default();
        voters.push(allowed_voter.clone());
        self.allowed_voters().insert(election_code.clone(), voters);
    }

    #[endpoint(removeAllowedVoter)]
    #[only_owner]
    fn remove_allowed_voter(&self, election_code: BigUint, allowed_voter: ManagedAddress) {
        // check if election exists
        let elections_metadata = self.elections_metadata();
        require!(elections_metadata.contains_key(&election_code.clone()), "Election code does not exist!");

        // check if the allowed voter is in the list of currently allowed voters for the selected election
        let mut voters = self.allowed_voters().get(&election_code.clone()).unwrap_or_default();
        require!(voters.contains(&allowed_voter), "Voter is not allowed for this election!");

        // remove allowed voter from currently allowed voters for selected election
        if let Some(voter_index) = voters.iter().position(|voter| *voter == allowed_voter) {
            voters.remove(voter_index);
            self.allowed_voters().insert(election_code.clone(), voters);
        }
    }

    #[endpoint(createElection)]
    #[only_owner]
    fn create_election(&self, name: ManagedBuffer, candidates: ManagedVec<ManagedBuffer>, start: u64, end: u64) {
        let election = ElectionMetadata {
            name: name,
            candidates: candidates.clone(),
            start: start,
            end: end
        };
        let election_code = self.code().get();
        self.elections_metadata().insert(election_code.clone(), election);
        self.code().set(election_code.clone() + 1u64);

        // adding vote metadata for every candidate with 0 as vote_count
        let mut votes_metadata = ManagedVec::new();
        for candidate in candidates.clone().iter() {
            votes_metadata.push(VoteMetadata {
                candidate: (*candidate).clone(),
                vote_count: BigUint::from(0u64)
            });
        }
        self.votes().insert(election_code.clone(), votes_metadata);
    }

    #[endpoint(vote)]
    fn vote(&self, election_code: BigUint, voted_candidate: ManagedBuffer) {
        // check if election exists
        let elections_metadata = self.elections_metadata();
        require!(elections_metadata.contains_key(&election_code.clone()), "Election code does not exist!");  

        // check if candidate exists
        let candidates = elections_metadata.get(&election_code.clone()).unwrap().candidates;
        require!(candidates.contains(&voted_candidate), "Candidate does not exist in this election!");

        // check if election has started and hasn't finished yet
        let current_time: u64 = self.blockchain().get_block_timestamp();
        let start = elections_metadata.get(&election_code.clone()).unwrap().start;
        let end = elections_metadata.get(&election_code.clone()).unwrap().end;
        require!(current_time >= start && current_time <= end, "Election has either not started or already finished!");

        let caller = self.blockchain().get_caller();
        // check right to vote
        let election_allowed_voters = self.allowed_voters();
        require!(election_allowed_voters.contains_key(&election_code.clone()), "Allowed voters have not been set up before this election!");
        require!(election_allowed_voters.get(&election_code.clone()).unwrap().contains(&caller.clone()), "You are not allowed to vote in this election!");
        
        // check if already voted
        if self.voters_voted().contains_key(&election_code.clone()) {
            let mut voters_voted_election = self.voters_voted().get(&election_code.clone()).unwrap();
            require!(!voters_voted_election.contains(&caller.clone()), "You are not allowed to vote twice in the same election!");
            
            voters_voted_election.push(caller.clone());

            // mark caller as having voted
            self.voters_voted().insert(election_code.clone(), voters_voted_election);
        } else {
            let mut voters_vec = ManagedVec::new();
            voters_vec.push(caller.clone());

            // mark caller as having voted
            self.voters_voted().insert(election_code.clone(), voters_vec);
        }

        // increment number of votes for voted candidate
        let mut votes_metadata = self.votes().get(&election_code.clone()).unwrap();
        for index in 0..votes_metadata.len() {
            let vote_metadata = votes_metadata.get(index);
        
            if vote_metadata.candidate == voted_candidate {
                let new_vote_count = vote_metadata.vote_count.clone() + 1u64;
        
                let _ = votes_metadata.set(
                    index,
                    &VoteMetadata {
                        candidate: vote_metadata.candidate.clone(),
                        vote_count: new_vote_count,
                    },
                );
                self.votes().insert(election_code.clone(), votes_metadata);
        
                break;
            }
        }
        
    }

    #[view(getElectionResults)]
    fn get_election_results(&self, election_code: BigUint) -> ManagedVec<VoteMetadata<Self::Api>> {
        require!(self.elections_metadata().contains_key(&election_code.clone()), "This election does not exist!");

        self.votes().get(&election_code.clone()).unwrap()
    }

    #[view(getElectionsMetadata)]
    #[storage_mapper("elections_metadata")]
    fn elections_metadata(&self) -> MapMapper<BigUint, ElectionMetadata<Self::Api>>;

    #[view(getVotes)]
    #[storage_mapper("votes")]
    fn votes(&self) -> MapMapper<BigUint, ManagedVec<VoteMetadata<Self::Api>>>;

    #[view(allowedVoters)]
    #[storage_mapper("allowed_voters")]
    fn allowed_voters(&self) -> MapMapper<BigUint, ManagedVec<ManagedAddress>>;

    #[view(votersVoted)]
    #[storage_mapper("voters_voted")]
    fn voters_voted(&self) -> MapMapper<BigUint, ManagedVec<ManagedAddress>>;

    #[view(code)]
    #[storage_mapper("code")]
    fn code(&self) -> SingleValueMapper<BigUint>;
}
