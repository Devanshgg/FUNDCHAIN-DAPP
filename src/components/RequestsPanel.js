import React, { useState } from "react";
import { useWeb3 } from "../context/Web3Context";
import { formatWeiStr, shortAddr, parseError, txLink } from "../utils/helpers";
import toast from "react-hot-toast";

function RequestCard({ req, onVote, votingId, network }) {
  const statusColor = req.completed ? "#22c55e" : "#f59e0b";
  const statusLabel = req.completed ? "Completed" : "Pending";

  return (
    <div className="request-card">
      <div className="request-top">
        <div className="request-info">
          <span className="request-id">#{req.id}</span>
          <h4 className="request-desc">{req.description}</h4>
        </div>
        <span className="badge" style={{ background: req.completed ? "#dcfce7" : "#fef3c7", color: req.completed ? "#166534" : "#92400e" }}>
          {statusLabel}
        </span>
      </div>

      <div className="request-meta">
        <div className="meta-item">
          <span className="meta-label">Amount</span>
          <span className="meta-val">{formatWeiStr(req.value)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Recipient</span>
          <span className="meta-val mono">{shortAddr(req.recipient)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Votes</span>
          <span className="meta-val">{req.noOfVoters.toString()}</span>
        </div>
      </div>

      {!req.completed && (
        <div className="request-actions">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => onVote(req.id)}
            disabled={votingId === req.id}
          >
            {votingId === req.id ? <><span className="spinner dark" /> Voting...</> : "👍 Vote"}
          </button>
          {network && (
            <a
              href={`${network.explorer}/address/${req.recipient}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-ghost"
            >
              View Recipient ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function RequestsPanel() {
  const { account, contract, contractData, network, refreshData } = useWeb3();
  const [votingId, setVotingId] = useState(null);

  const handleVote = async (requestId) => {
    if (!account) return toast.error("Connect your wallet first");
    if (!contract) return toast.error("Load a contract first");

    setVotingId(requestId);
    try {
      const tx = await contract.methods.voteRequest(requestId).send({ from: account });
      const link = txLink(tx.transactionHash, network?.explorer);
      toast.success(
        <span>
          Vote cast for request #{requestId}!{" "}
          {link && <a href={link} target="_blank" rel="noreferrer" style={{ color: "#6366f1" }}>View Tx ↗</a>}
        </span>,
        { duration: 5000 }
      );
      await refreshData();
    } catch (e) {
      toast.error(parseError(e));
    } finally {
      setVotingId(null);
    }
  };

  const requests = contractData?.requests || [];

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>No spending requests yet</p>
        <p className="empty-sub">The campaign manager hasn't created any spending requests</p>
      </div>
    );
  }

  return (
    <div>
      <div className="panel-header">
        <p className="panel-desc">
          Contributors can vote on spending requests. Requests need majority votes to be executed.
        </p>
      </div>

      <div className="requests-list">
        {requests.map((req) => (
          <RequestCard
            key={req.id}
            req={req}
            onVote={handleVote}
            votingId={votingId}
            network={network}
          />
        ))}
      </div>
    </div>
  );
}
