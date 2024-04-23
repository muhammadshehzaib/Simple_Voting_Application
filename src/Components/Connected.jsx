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
      <h1>You are Connected to Metamask</h1>
      <p>Metamask Account: {account}</p>
      <p>Remaining Time: {remainingTime}</p>

      {showButton ? (
        <div className="voted-message">
          <span className="icon" role="img" aria-label="check">
            ✅
          </span>
          You have already voted
        </div>
      ) : (
        <div className="input-area">
          <input
            type="number"
            placeholder="Enter Candidate Index"
            value={number}
            onChange={handleNumberChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button onClick={voteFunction}>Vote</button>
        </div>
      )}

      <motion.div className="overflow-x-auto w-[40%]">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Index</th>
              <th>Votes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <motion.tr
                key={candidate.index}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: candidate.voteCount === maxVotes ? 1 : 0.5,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  scale: candidate.voteCount === maxVotes ? 1.1 : 1,
                  backgroundColor:
                    candidate.voteCount === maxVotes
                      ? "#343a40"
                      : "transparent",
                  color: candidate.voteCount === maxVotes ? "#fff" : "#000",
                  borderRadius: "10px",
                }}
              >
                <td>
                  <input type="checkbox" className="checkbox" />
                </td>
                <td>{candidate.name}</td>
                <td>{candidate.index}</td>
                <td>{candidate.voteCount}</td>
                <td>
                  <button>Details</button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Connected;
