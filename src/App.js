import { useState, useEffect } from "react";
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
import HeroSection from "./Components/HeroSection";

function App() {
  useEffect(() => {
    AOS.init({
      duration: 2000, // values from 0 to 3000, with step 50ms
      once: true, // whether animation should happen only once - while scrolling down
    });
  }, []);
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [remainingTime, setremainingTime] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState("");
  const [CanVote, setCanVote] = useState(true);
  const [error, setError] = useState(""); // State to hold the error message
  const [winnerName, setWinnerName] = useState("");
  const [winnerVotes, setWinnerVotes] = useState("");
  const [network, setNetwork] = useState(null);

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
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  });
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

  const addSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
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
  };

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
        addSepoliaNetwork();
      } else {
        console.error("Failed to switch to Sepolia network:", switchError);
      }
    }
  };

  async function updateVotingStatus() {
    const timeRemaining = await getRemainingTime();
    setVotingStatus(timeRemaining > 0);
  }
  async function vote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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

  async function canVote() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const voteStatus = await contractInstance.voters(await signer.getAddress());
    setCanVote(voteStatus);
  }

  async function winner() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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

  async function getCandidates() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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

  async function getCurrentStatus() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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

  async function getRemainingTime() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      contractAddress,
      contractAbi,
      signer
    );
    const time = await contractInstance.getRemainingTime();
    const remainingInSeconds = parseInt(time.toString(), 10);
    setremainingTime(remainingInSeconds);
    return remainingInSeconds;
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
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
      console.error("Metamask is not detected in the browser");
    }
  }

  async function handleNumberChange(e) {
    const value = e.target.value;
    if (value.trim() === "") {
      setError("Input cannot be empty"); // Set the error message
    } else {
      setError(""); // Clear the error message
    }
    setNumber(value);
  }
  const rejection = async (...parameters) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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
          console.log("Transaction is minned successfully");
        });
      })
      .catch(() => {
        console.log("Transaction is rejected");
      });
  };

  return (
    <div className="App">
      <div data-aos="fade-right" data-aos-delay="300" data-aos-duration="1000">
        <Header />
        {votingStatus ? (
          isConnected ? (
            <Connected
              account={account}
              candidates={candidates}
              remainingTime={remainingTime}
              number={number}
              handleNumberChange={handleNumberChange}
              voteFunction={vote}
              showButton={CanVote}
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
