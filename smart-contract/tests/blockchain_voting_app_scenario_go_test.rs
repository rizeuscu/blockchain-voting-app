use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    ScenarioWorld::vm_go()
}

#[test]
fn empty_go() {
    world().run("scenarios/blockchain_voting_app.scen.json");
}
