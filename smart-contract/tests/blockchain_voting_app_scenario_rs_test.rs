use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.register_contract("mxsc:output/blockchain-voting-app.mxsc.json", blockchain_voting_app::ContractBuilder);
    blockchain
}

#[test]
fn empty_rs() {
    world().run("scenarios/blockchain_voting_app.scen.json");
}
