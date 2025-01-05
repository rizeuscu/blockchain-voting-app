import React, { useState, useEffect } from "react";
import { querySmartContract } from "./querySmartContract";

interface ContractQueryProps {
  functionName: string;
}

const ContractQuery: React.FC<ContractQueryProps> = ({ functionName }) => {
  const [response, setResponse] = useState<
    { name: string; votes: { candidate: string; vote_count: number }[]; start: number; end: number }[] | null
  >(null);

  const fetchContractData = async (args: any[] = []) => {
    try {
      const result = await querySmartContract(functionName);
      setResponse(result);
    } catch (error) {
      console.error(error);
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
                <th className="px-4 py-2 text-left whitespace-nowrap border border-gray-300">Vote Counts</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default ContractQuery;
