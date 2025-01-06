import React, { useState, useEffect } from "react";
import { querySmartContract } from "./querySmartContract";
import { sendTransactions } from "helpers";
import { contractAddress } from "config";
import { useGetAccountInfo } from "hooks";

interface ContractQueryProps {
  functionName: string;
}

const ContractQuery: React.FC<ContractQueryProps> = ({ functionName }) => {
  const [response, setResponse] = useState<
    { name: string; votes: { candidate: string; vote_count: number }[]; start: number; end: number }[] | null
  >(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedElectionIndex, setSelectedElectionIndex] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const fetchContractData = async (args: any[] = []) => {
    try {
      const result = await querySmartContract(functionName);
      setResponse(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleVote = async () => {
    if (selectedElectionIndex !== null && selectedCandidate) {
      try {
        const electionName = response![selectedElectionIndex].name;
        let hexSelectedElectionIndex = selectedElectionIndex.toString(16);

        if (hexSelectedElectionIndex.length % 2 !== 0) {
          hexSelectedElectionIndex = '0' + hexSelectedElectionIndex;
        }

        await sendTransactions({
          transactions: [
            {
              value: 0,
              data: `vote@${hexSelectedElectionIndex}@${Buffer.from(selectedCandidate).toString("hex")}`,
              receiver: contractAddress,
              gasLimit: 50000000
            }
          ]
        });

        setIsModalOpen(false);
        fetchContractData();
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    fetchContractData();
  }, []);

  return (
    <div>
      {response && response.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">Name</th>
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">Start</th>
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">End</th>
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">Candidates</th>
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">Vote Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {response.map((election, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">{election.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                    {new Date(election.start * 1000).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                    {new Date(election.end * 1000).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                    <ul>
                      {election.votes.map((vote, idx) => (
                        <li key={idx}>{vote.candidate}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                    <ul>
                      {election.votes.map((vote, idx) => (
                        <li key={idx}>{vote.vote_count}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap border border-gray-300">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => {
                        setSelectedElectionIndex(index);
                        setSelectedCandidate(null);
                        setIsModalOpen(true);
                      }}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}

      {isModalOpen && selectedElectionIndex !== null && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-lg font-semibold mb-4">Voting</h2>
            <p className="mb-4">
              Select a candidate for the election:{" "}
              <strong>{response![selectedElectionIndex].name}</strong>
            </p>
            <select
              className="w-full border px-4 py-2 mb-4"
              value={selectedCandidate || ""}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              <option value="" disabled>
                Select a candidate
              </option>
              {response![selectedElectionIndex].votes.map((vote, idx) => (
                <option key={idx} value={vote.candidate}>
                  {vote.candidate}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleVote}
                disabled={!selectedCandidate}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractQuery;
