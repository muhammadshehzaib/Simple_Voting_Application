import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAbi, contractAddress } from "./Constant/constant";
import Login from "./Components/Login";
import Finished from "./Components/Finished";
import Connected from "./Components/Connected";
import "./App.css";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import detectEthereumProvider from "@metamask/detect-provider";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: true,
    });
  }, []);

  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState("");
  const [canVotes, setCanVote] = useState(true);
  const [error, setError] = useState("");
  const [winnerName, setWinnerName] = useState("");
  const [winnerVotes, setWinnerVotes] = useState("");
  const [network, setNetwork] = useState(null);
  const [userHasVoted, setUserHasVoted] = useState(false);

  useEffect(() => {
    const initMetamask = async () => {
      const detectedProvider = await detectEthereumProvider();
      if (detectedProvider) {
        setProvider(new ethers.providers.Web3Provider(window.ethereum));
      } else {
        console.log("Please install MetaMask!");
      }
    };
    initMetamask();

    const cleanup = () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
    return cleanup;
  }, []);

  useEffect(() => {
    if (provider) {
      getCandidates();
      getRemainingTime();
      getCurrentStatus();
      winner();

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      const intervalId = setInterval(() => {
        updateVotingStatus();
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [provider]);

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
      checkNetwork(newProvider);
    }
  }, []);

  const checkNetwork = async (provider) => {
    const network = await provider.getNetwork();
    setNetwork(network);
    if (network.chainId !== 11155111) {
      // Sepolia Chain ID
      alert("Please switch to the Sepolia network");
      switchToSepolia();
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // Hexadecimal value of Sepolia's chain ID (11155111)
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH", // 2-6 characters long
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
        }
      } else {
        console.error("Failed to switch to Sepolia network:", switchError);
      }
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  };

  const startApp = (provider) => {
    if (provider !== window.ethereum) {
      console.error("Do you have multiple wallets installed?");
    }
    // Access the decentralized web!
  };

  const updateVotingStatus = async () => {
    const timeRemaining = await getRemainingTime();
    setVotingStatus(timeRemaining > 0);
  };

  const vote = async () => {
    if (!provider) {
      console.error("Provider is not available.");
      return;
    }
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const tx = await contractInstance.vote(number);
      console.log(contractInstance.vote(number));
      await tx.wait();
      canVote();
    }
  };

  const canVote = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const voteStatus = await contractInstance.voters(
        await signer.getAddress()
      );
      setCanVote(voteStatus);
    }
  };

  const winner = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      try {
        const winnersList = await contractInstance.getWinner();
        setWinnerName(winnersList.winnerName);
        setWinnerVotes(winnersList.winnerVoteCount.toString());
      } catch (error) {
        console.error("Error fetching the winner:", error);
      }
    }
  };

  const getCandidates = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const candidatesList = await contractInstance.getAllVotesOfCandidates();
      const formattedCandidates = candidatesList.map((candidate, index) => {
        return {
          index: index,
          name: candidate.name,
          voteCount: candidate.voteCount.toNumber(),
        };
      });
      setCandidates(formattedCandidates);
    }
  };

  const getCurrentStatus = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const status = await contractInstance.getWinner();
      setVotingStatus(status);
    }
  };

  const getRemainingTime = async () => {
    if (provider) {
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      const time = await contractInstance.getRemainingTime();
      const remainingInSeconds = parseInt(time.toString(), 10);
      setRemainingTime(remainingInSeconds);
      return remainingInSeconds;
    }
  };

  const connectToMetamask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        console.log("Metamask Connected : " + address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Metamask is not detected in the browser");
      console.error("Metamask is not detected in the browser");
    }
  };

  const handleNumberChange = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      setError("Input cannot be empty");
    } else {
      setError("");
    }
    setNumber(value);
  };

  const rejection = async (...parameters) => {
    if (provider) {
      const signer = provider.getSigner();

      let signedContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      signedContract
        .method(...parameters)
        .then((tx) => {
          provider.waitForTransaction(tx.hash).then(() => {
            console.log("Transaction is mined successfully");
          });
        })
        .catch(() => {
          console.log("Transaction is rejected");
        });
    }
  };

  return (
    <div className="App">
      <div data-aos="fade-right" data-aos-delay="300" data-aos-duration="1000">
        <Header />
        <p>Current Network: {network?.name || "Not connected"}</p>
        <button onClick={() => checkNetwork(provider)}>Check Network</button>
        {votingStatus ? (
          isConnected ? (
            <Connected
              account={account}
              candidates={candidates}
              remainingTime={remainingTime}
              number={number}
              handleNumberChange={handleNumberChange}
              voteFunction={vote}
              showButton={canVote}
            />
          ) : (
            <Login connectWallet={connectToMetamask} />
          )
        ) : (
          <Finished winnerName={winnerName} winnerVotes={winnerVotes} />
        )}
        <Footer />
      </div>
    </div>
  );
}

export default App;
