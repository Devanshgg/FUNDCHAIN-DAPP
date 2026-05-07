import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { formatWeiStr, shortAddr, parseError, txLink } from "../utils/helpers";
import toast from "react-hot-toast";

export default function ManagerPanel() {
  const { web3, account, contract, contractData, isManager, network, refreshData } = useWeb3();
  const [form, setForm] = useState({ description: "", value: "", recipient: "" });
  const [creating, setCreating] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleCreate = async () => {
    if (!account) return toast.error("Connect wallet first");
    if (!contract) return toast.error("Load contract first");
    if (!isManager) return toast.error("Only manager can create requests");
    if (!form.description.trim()) return toast.error("Description is required");
    if (!form.value || Number(form.value) <= 0) return toast.error("Amount must be > 0");
    if (!web3.utils.isAddress(form.recipient)) return toast.error("Invalid recipient address");

    setCreating(true);
    try {
      const tx = await contract.methods
        .createRequest(form.description, form.value, form.recipient)
        .send({ from: account });
      const link = txLink(tx.transactionHash, network?.explorer);
      toast.success(
        <span>
          Request created!{" "}
          {link && <a href={link} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>View Tx ↗</a>}
        </span>,
        { duration: 5000 }
      );
      setForm({ description: "", value: "", recipient: "" });
      await refreshData();
    } catch (e) {
      toast.error(parseError(e));
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async (requestId) => {
    if (!account) return toast.error("Connect wallet first");
    if (!contract) return toast.error("Load contract first");
    if (!isManager) return toast.error("Only manager can make payments");

    setPayingId(requestId);
    try {
      const tx = await contract.methods.makePayment(requestId).send({ from: account });
      const link = txLink(tx.transactionHash, network?.explorer);
      toast.success(
        <span>
          Payment sent for request #{requestId}!{" "}
          {link && <a href={link} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>View Tx ↗</a>}
        </span>,
        { duration: 5000 }
      );
      await refreshData();
    } catch (e) {
      toast.error(parseError(e));
    } finally {
      setPayingId(null);
    }
  };

  if (!isManager) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <p>Manager Access Only</p>
        <p className="empty-sub">
          This panel is restricted to the campaign manager.
          {contractData?.manager && (
            <><br />Manager: <span className="mono">{shortAddr(contractData.manager)}</span></>
          )}
        </p>
      </div>
    );
  }

  const pendingRequests = (contractData?.requests || []).filter((r) => !r.completed);

  return (
    <div>
      {/* Create Request */}
      <div className="card">
        <h3 className="card-title">Create Spending Request</h3>
        <p className="card-desc">Create a payment request that contributors can vote on.</p>

        <div className="field">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="What is this payment for?"
            rows={3}
          />
        </div>

        <div className="panel-grid">
          <div className="field">
            <label>Amount (wei)</label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setField("value", e.target.value)}
              placeholder="Amount in wei"
              min="1"
            />
          </div>
          <div className="field">
            <label>Recipient Address</label>
            <input
              type="text"
              value={form.recipient}
              onChange={(e) => setField("recipient", e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? <><span className="spinner" /> Creating...</> : "+ Create Request"}
        </button>
      </div>

      {/* Pending Payments */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 className="card-title">Execute Payments</h3>
        <p className="card-desc">
          Execute approved requests. Requires: target reached + majority votes.
        </p>

        {pendingRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem 0" }}>
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="requests-list">
            {pendingRequests.map((req) => (
              <div key={req.id} className="request-card">
                <div className="request-top">
                  <div className="request-info">
                    <span className="request-id">#{req.id}</span>
                    <h4 className="request-desc">{req.description}</h4>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePay(req.id)}
                    disabled={payingId === req.id}
                  >
                    {payingId === req.id ? <><span className="spinner" /> Paying...</> : "💸 Pay"}
                  </button>
                </div>
                <div className="request-meta">
                  <div className="meta-item">
                    <span className="meta-label">Amount</span>
                    <span className="meta-val">{formatWeiStr(req.value)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">To</span>
                    <span className="meta-val mono">{shortAddr(req.recipient)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Votes</span>
                    <span className="meta-val">{req.noOfVoters.toString()} / {Math.ceil(Number(contractData.numContribs) / 2)} needed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
