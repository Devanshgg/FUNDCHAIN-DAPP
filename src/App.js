import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Web3Provider, useWeb3 } from "./context/Web3Context";
import Header from "./components/Header";
import StatsPanel from "./components/StatsPanel";
import ContributePanel from "./components/ContributePanel";
import RequestsPanel from "./components/RequestsPanel";
import ManagerPanel from "./components/ManagerPanel";
import InfoPanel from "./components/InfoPanel";
import toast from "react-hot-toast";
import "./App.css";

const TABS = [
  { id: "contribute", label: "Contribute" },
  { id: "requests", label: "Spending Requests" },
  { id: "manager", label: "Manager" },
  { id: "info", label: "Contract Info" },
];

function AppContent() {
  const { web3, account, contract, isLoading, loadContract, refreshData, setContractAddress, contractAddress } = useWeb3();
  const [activeTab, setActiveTab] = useState("contribute");
  const [addrInput, setAddrInput] = useState("");
  const [loadingContract, setLoadingContract] = useState(false);

  const handleLoad = async () => {
    if (!account) return toast.error("Connect your wallet first");
    setLoadingContract(true);
    try {
      const c = await loadContract(addrInput.trim());
      await refreshData(c);
      toast.success("Contract loaded!");
    } catch (e) {
      toast.error(e.message || "Failed to load contract");
    } finally {
      setLoadingContract(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main">
        {/* Contract Address Bar */}
        <div className="contract-bar">
          <input
            className="contract-input"
            value={addrInput}
            onChange={(e) => setAddrInput(e.target.value)}
            placeholder="Enter deployed contract address (0x...)"
            onKeyDown={(e) => e.key === "Enter" && handleLoad()}
          />
          <button
            className="btn btn-primary"
            onClick={handleLoad}
            disabled={loadingContract || !addrInput.trim()}
          >
            {loadingContract ? <><span className="spinner" /> Loading...</> : "Load Contract"}
          </button>
          {contract && (
            <button className="btn btn-outline" onClick={() => refreshData()} disabled={isLoading}>
              {isLoading ? "↻" : "⟳ Refresh"}
            </button>
          )}
        </div>

        {/* Stats */}
        <StatsPanel />

        {/* Tabs */}
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "contribute" && <ContributePanel />}
          {activeTab === "requests" && <RequestsPanel />}
          {activeTab === "manager" && <ManagerPanel />}
          {activeTab === "info" && <InfoPanel />}
        </div>
      </main>

      <footer className="footer">
        <p>FundChain DApp · Built on Ethereum · Contract: Fund.sol</p>
        <p>Always verify contract addresses before interacting</p>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: "inherit", fontSize: "13px" },
          duration: 4000,
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
