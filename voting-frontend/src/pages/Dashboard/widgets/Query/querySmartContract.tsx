import { SmartContract, Query, Address, ContractFunction, BigUIntValue } from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { contractAddress } from "config";

const parseElectionMetadata = (base64Data: string, votingBase64Data: string) => {
  const buffer = Buffer.from(base64Data, "base64");
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

  const votesBuffer = Buffer.from(votingBase64Data, "base64");
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
  console.log(votes);

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
    const base64Data = queryResponse.returnData.slice(1); // Skip the first element
    
    let electionsMetadata: any[] = [];
    const dataPromises = base64Data.map(async (data, index) => {
      const votingQuery = new Query({
        address: contract.getAddress(),
        func: new ContractFunction("getElectionResults"),
        args: [new BigUIntValue(BigInt(index))]
      });
  
      const votingQueryResponse = await provider.queryContract(votingQuery);
  
      return parseElectionMetadata(data, votingQueryResponse.returnData[0]);
    });
    electionsMetadata = await Promise.all(dataPromises);

    return electionsMetadata;
  } catch (error) {
    console.error("Error querying smart contract:", error);
    throw error;
  }
};
