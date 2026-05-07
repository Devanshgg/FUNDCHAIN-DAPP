import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { formatWeiStr, formatDeadline, calcProgress, isExpired } from "../utils/helpers";

export default function StatsPanel() {
  const { contractData, isLoading } = useWeb3();

  if (!contractData) {
    return (
      <div className="stats-placeholder">
        <p>Load a contract to see campaign stats</p>
      </div>
    );
  }

  const { raised, target, numContribs, balance, deadline } = contractData;
  const pct = calcProgress(raised, target);
  const expired = isExpired(deadline);

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Raised</div>
          <div className="stat-value">{formatWeiStr(raised)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Target</div>
          <div className="stat-value">{formatWeiStr(target)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Contributors</div>
          <div className="stat-value">{numContribs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatWeiStr(balance)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Deadline</div>
          <div className="stat-value" style={{ fontSize: "13px", color: expired ? "#ef4444" : "#22c55e" }}>
            {expired ? "⏰ " : "✅ "}{formatDeadline(deadline)}
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Funding Progress</span>
          <span className="progress-pct">{pct}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, transition: "width 0.6s ease" }}
          />
        </div>
        <div className="progress-footer">
          <span style={{ color: "#6366f1", fontWeight: 500 }}>{formatWeiStr(raised)}</span>
          <span style={{ color: "#9ca3af" }}>of {formatWeiStr(target)}</span>
        </div>
      </div>
    </div>
  );
}
