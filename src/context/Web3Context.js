import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import Web3 from "web3";
import { FUND_ABI, NETWORKS } from "../contracts/Fund";

const Web3Context = createContext(null);

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const connectMetaMask = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask extension.");
    }
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const w3 = new Web3(window.ethereum);
      const cId = await w3.eth.getChainId();
      setWeb3(w3);
      setAccount(accounts[0]);
      setChainId(Number(cId));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectWalletConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Dynamic import to avoid SSR issues
      const WalletConnectProvider = (await import("@walletconnect/web3-provider")).default;
      const provider = new WalletConnectProvider({
        rpc: {
          1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
          11155111: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
          5: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
        },
      });
      await provider.enable();
      const w3 = new Web3(provider);
      const accounts = await w3.eth.getAccounts();
      const cId = await w3.eth.getChainId();
      setWeb3(w3);
      setAccount(accounts[0]);
      setChainId(Number(cId));

      provider.on("accountsChanged", (accs) => setAccount(accs[0]));
      provider.on("chainChanged", (id) => setChainId(Number(id)));
      provider.on("disconnect", () => { setAccount(null); setWeb3(null); });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWeb3(null);
    setAccount(null);
    setChainId(null);
    setContract(null);
    setContractData(null);
    setIsManager(false);
  }, []);

  const loadContract = useCallback(async (address) => {
    if (!web3) throw new Error("Connect wallet first");
    if (!web3.utils.isAddress(address)) throw new Error("Invalid contract address");
    const c = new web3.eth.Contract(FUND_ABI, address);
    // Verify it's a Fund contract
    await c.methods.manager().call();
    setContract(c);
    setContractAddress(address);
    return c;
  }, [web3]);

  const refreshData = useCallback(async (c = contract) => {
    if (!c) return;
    setIsLoading(true);
    try {
      const [raised, target, numContribs, balance, deadline, numReq, manager] = await Promise.all([
        c.methods.raiseAmount().call(),
        c.methods.target().call(),
        c.methods.noOfContributors().call(),
        c.methods.checkBalance().call(),
        c.methods.deadline().call(),
        c.methods.numRequest().call(),
        c.methods.manager().call(),
      ]);

      let myContribution = "0";
      if (account) {
        myContribution = await c.methods.contributors(account).call();
        setIsManager(account.toLowerCase() === manager.toLowerCase());
      }

      // Fetch all requests
      const requests = [];
      for (let i = 0; i < Number(numReq); i++) {
        const r = await c.methods.requests(i).call();
        requests.push({ id: i, ...r });
      }

      setContractData({
        raised: raised.toString(),
        target: target.toString(),
        numContribs: numContribs.toString(),
        balance: balance.toString(),
        deadline: deadline.toString(),
        numReq: numReq.toString(),
        manager,
        myContribution: myContribution.toString(),
        requests,
      });
    } finally {
      setIsLoading(false);
    }
  }, [contract, account]);

  // Listen for MetaMask events
  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accs) => {
      setAccount(accs[0] || null);
      if (!accs[0]) disconnect();
    };
    const handleChainChanged = (id) => setChainId(parseInt(id, 16));
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  // Auto-refresh when contract/account changes
  useEffect(() => {
    if (contract && account) refreshData();
  }, [contract, account]);

  const network = chainId ? NETWORKS[chainId] : null;

  return (
    <Web3Context.Provider value={{
      web3, account, chainId, network, contract, contractAddress,
      contractData, isLoading, isManager, isConnecting,
      connectMetaMask, connectWalletConnect, disconnect,
      loadContract, refreshData, setContractAddress,
    }}>
      {children}
    </Web3Context.Provider>
  );
};
