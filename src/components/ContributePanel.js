import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { formatWeiStr, parseError, txLink } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ContributePanel() {
  const { web3, account, contract, contractData, network, refreshData } = useWeb3();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);

  const handleSendEth = async () => {
    if (!account) return toast.error("Connect your wallet first");
    if (!contract) return toast.error("Load a contract first");
    const val = amount.trim();
    if (!val || Number(val) < 100) return toast.error("Minimum contribution is 100 wei");

    setLoading(true);
    try {
      const tx = await contract.methods.sendEth().send({ from: account, value: val });
      const link = txLink(tx.transactionHash, network?.explorer);
      toast.success(
        <span>
          Contribution sent!{" "}
          {link && <a href={link} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>View Tx ↗</a>}
        </span>,
        { duration: 6000 }
      );
      setAmount("");
      await refreshData();
    } catch (e) {
      toast.error(parseError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!account) return toast.error("Connect your wallet first");
    if (!contract) return toast.error("Load a contract first");

    setRefundLoading(true);
    try {
      const tx = await contract.methods.refund().send({ from: account });
      const link = txLink(tx.transactionHash, network?.explorer);
      toast.success(
        <span>
          Refund successful!{" "}
          {link && <a href={link} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>View Tx ↗</a>}
        </span>,
        { duration: 6000 }
      );
      await refreshData();
    } catch (e) {
      toast.error(parseError(e));
    } finally {
      setRefundLoading(false);
    }
  };

  const myContrib = contractData?.myContribution || "0";

  return (
    <div className="panel-grid">
      {/* Send ETH */}
      <div className="card">
        <h3 className="card-title">Send ETH</h3>
        <p className="card-desc">Contribute to this campaign. Minimum contribution is 100 wei.</p>

        <div className="field">
          <label>Amount (wei)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in wei (min 100)"
            min="100"
          />
        </div>

        {amount && Number(amount) > 0 && (
          <div className="convert-hint">
            ≈ {web3?.utils.fromWei(amount, "ether")} ETH
          </div>
        )}

        <button
          className="btn btn-primary btn-block"
          onClick={handleSendEth}
          disabled={loading || !account || !contract}
        >
          {loading ? <><span className="spinner" /> Sending...</> : "⬆ Contribute"}
        </button>
      </div>

      {/* My Contribution & Refund */}
      <div className="card">
        <h3 className="card-title">My Contribution</h3>
        <div className="my-contrib-value">
          {myContrib !== "0" ? formatWeiStr(myContrib) : "No contributions yet"}
        </div>

        <div className="divider" />

        <div className="refund-info">
          <p className="card-desc">
            Refunds are available if the deadline passes and the target is not reached.
          </p>
        </div>

        <button
          className="btn btn-danger btn-block"
          onClick={handleRefund}
          disabled={refundLoading || !account || !contract || myContrib === "0"}
        >
          {refundLoading ? <><span className="spinner" /> Processing...</> : "↩ Request Refund"}
        </button>

        {!account && (
          <p className="hint-text">Connect wallet to contribute or refund</p>
        )}
      </div>
    </div>
  );
}
