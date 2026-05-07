import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { shortAddr } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Header() {
  const { account, network, isConnecting, connectMetaMask, connectWalletConnect, disconnect, chainId } = useWeb3();
  const [showMenu, setShowMenu] = useState(false);

  const handleMetaMask = async () => {
    setShowMenu(false);
    try {
      await connectMetaMask();
      toast.success("MetaMask connected!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleWalletConnect = async () => {
    setShowMenu(false);
    try {
      await connectWalletConnect();
      toast.success("WalletConnect connected!");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h1 className="logo-title">FundChain</h1>
          <p className="logo-sub">Decentralized Crowdfunding</p>
        </div>
      </div>

      <div className="header-right">
        {network && (
          <div className="network-badge">
            <span className="net-dot" style={{ background: network.color }} />
            {network.name}
          </div>
        )}
        {chainId && !network && (
          <div className="network-badge">
            <span className="net-dot" style={{ background: "#f59e0b" }} />
            Chain #{chainId}
          </div>
        )}

        {account ? (
          <div className="wallet-connected">
            <div className="wallet-address">
              <span className="wallet-dot connected" />
              {shortAddr(account)}
            </div>
            <button className="btn btn-sm btn-outline" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        ) : (
          <div className="wallet-menu-wrap">
            <button
              className="btn btn-primary"
              onClick={() => setShowMenu(!showMenu)}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
            {showMenu && (
              <div className="wallet-menu">
                <button className="wallet-option" onClick={handleMetaMask}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width="20" height="20" />
                  MetaMask
                </button>
                <button className="wallet-option" onClick={handleWalletConnect}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b99fc">
                    <path d="M6.1 8.4c3.3-3.2 8.5-3.2 11.8 0l.4.4c.2.2.2.4 0 .6l-1.3 1.3c-.1.1-.3.1-.4 0l-.5-.5c-2.3-2.2-6-2.2-8.3 0l-.6.5c-.1.1-.3.1-.4 0L5.5 9.5c-.2-.2-.2-.4 0-.6l.6-.5zm14.6 2.7l1.2 1.1c.2.2.2.4 0 .6l-5.3 5.1c-.2.2-.4.2-.6 0l-3.8-3.6c-.1-.1-.2-.1-.3 0l-3.8 3.6c-.2.2-.4.2-.6 0L2.2 12.8c-.2-.2-.2-.4 0-.6l1.2-1.1c.2-.2.4-.2.6 0l3.8 3.6c.1.1.2.1.3 0l3.8-3.6c.2-.2.4-.2.6 0l3.8 3.6c.1.1.2.1.3 0l3.8-3.6c.1-.1.4-.1.6 0z"/>
                  </svg>
                  WalletConnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
