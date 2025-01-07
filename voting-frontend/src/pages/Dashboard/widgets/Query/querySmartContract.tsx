import { SmartContract, Query, Address, ContractFunction, BigUIntValue } from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { contractAddress } from "config";

const parseElectionMetadata = (data: string, votingData: string) => {
  const buffer = Buffer.from(data, "base64");
  let offset = 0;

  const nameLength = buffer.readUInt32BE(offset);
  offset += 4;
  
  const name = buffer.slice(offset, offset + nameLength).toString("utf8");
  offset += nameLength;

  const candidatesCount = buffer.readUInt32BE(offset);
  offset += 4;

  const candidates: string[] = [];
  for (let i = 0; i < candidatesCount; i++) {
    const candidateLength = buffer.readUInt32BE(offset);
    offset += 4;
    const candidate = buffer.slice(offset, offset + candidateLength).toString("utf8");
    offset += candidateLength;
    candidates.push(candidate);
  }

  const start = buffer.readBigUInt64BE(offset);
  offset += 8;

  const end = buffer.readBigUInt64BE(offset);

  const votesBuffer = Buffer.from(votingData, "base64");
  let voteOffset = 0;

  const votes = [];
  for (let i = 0; i < candidatesCount; i++) {
    const candidateLength = votesBuffer.readUInt32BE(voteOffset);
    voteOffset += 4;

    const candidate = votesBuffer.slice(voteOffset, voteOffset + candidateLength).toString("utf8");
    voteOffset += candidateLength;

    const voteCountLength = votesBuffer.readUInt32BE(voteOffset);
    voteOffset += 4;

    let vote_count = 0;
    if (voteCountLength > 0) {
      const voteCountBuffer = votesBuffer.slice(voteOffset, voteOffset + voteCountLength);
      voteOffset += voteCountLength;

      vote_count = Number(BigInt(`0x${voteCountBuffer.toString("hex")}`));
    }

    votes.push({ candidate, vote_count });
  }

  return {
    name,
    votes,
    start: Number(start),
    end: Number(end),
  };
};

export const querySmartContract = async (functionName: string) => {
  try {
    const provider = new ApiNetworkProvider("https://devnet-api.multiversx.com");

    const contract = new SmartContract({ address: new Address(contractAddress) });
    const query = new Query({
      address: contract.getAddress(),
      func: new ContractFunction(functionName),
    });

    const queryResponse = await provider.queryContract(query);
    const data = queryResponse.returnData;
    let electionsMetadata: any[] = [];

    for (let i = 0; i < data.length; i += 2) {
      let index;
      if (data[i] == "") {
        index = BigInt(0);
      } else {
        index = BigInt('0x' + Buffer.from(data[i], 'base64').toString('hex'));
      }
      console.log(index);
      const electionMetadata = data[i + 1];

      const votingQuery = new Query({
        address: contract.getAddress(),
        func: new ContractFunction("getElectionResults"),
        args: [new BigUIntValue(index)],
      });
      const votingQueryResponse = await provider.queryContract(votingQuery);
      electionsMetadata.push(parseElectionMetadata(electionMetadata, votingQueryResponse.returnData[0]));
    }

    return electionsMetadata;
  } catch (error) {
    console.error("Error querying smart contract:", error);
    throw error;
  }
};
