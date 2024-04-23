import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";

const Connected = ({
  account,
  candidates,
  remainingTime,
  number,
  handleNumberChange,
  voteFunction,
  showButton,
  error,
}) => {
  useEffect(() => {
    AOS.init({
      duration: 2000, // Animation duration
      once: true, // Animation only once
    });
  }, []);

  // Calculate the max votes for highlighting
  const maxVotes = Math.max(...candidates.map((c) => c.voteCount));

  return (
    <div
      className="connected-container"
      data-aos="fade-right"
      data-aos-delay="300"
      data-aos-duration="1000"
    >
      <div className="flex flex-col justify-center items-center text-center">
        <h1>You are Connected to Metamask</h1>
        <p>Metamask Account: {account}</p>
        <p>Remaining Time: {remainingTime}</p>
      </div>

      {showButton ? (
        <div className="voted-message">
          <span className="icon" role="img" aria-label="check">
            ✅
          </span>
          You have already voted
        </div>
      ) : (
        <div className="input-area flex items-center space-x-4 mt-5 mb-5">
          <input
            type="number"
            placeholder="Enter Candidate Index"
            value={number}
            onChange={handleNumberChange}
            required
            className="border-2 border-blue-500 focus:border-blue-700 text-base rounded-lg p-2 outline-none transition-colors duration-300 ease-in-out w-full"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            onClick={voteFunction}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 ease-in-out mb-3"
          >
            Vote
          </button>
        </div>
      )}

      <motion.div>
        <div className="flex items-center justify-center">
          <div className="overflow-x-auto mt-4 max-[350px]:w-[80%]">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="text-left text-gray-700 bg-gray-100">
                  <th className="px-5 py-3 border-b-2 border-gray-200">Name</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Index
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200">
                    Votes
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200"></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0.5 }}
                    animate={{
                      opacity: candidate.voteCount === maxVotes ? 1 : 0.5,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`${
                      candidate.voteCount === maxVotes
                        ? "bg-blue-500 text-white"
                        : "bg-blue-400 text-gray-900"
                    } border-b border-gray-200 hover:bg-blue-400`}
                  >
                    <td className="px-5 py-3">{candidate.name}</td>
                    <td className="px-5 py-3">{candidate.index}</td>
                    <td className="px-5 py-3">{candidate.voteCount}</td>
                    <td className="px-5 py-3 text-right ">
                      <button className="text-blue-500 hover:text-blue-600">
                        Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Connected;
