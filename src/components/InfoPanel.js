import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { formatWeiStr, formatDeadline, shortAddr } from "../utils/helpers";

export default function InfoPanel() {
  const { contractData, contractAddress, network } = useWeb3();

  const rows = contractData
    ? [
        { label: "Contract Address", value: contractAddress, mono: true, link: network ? `${network.explorer}/address/${contractAddress}` : null },
        { label: "Manager", value: contractData.manager, mono: true, link: network ? `${network.explorer}/address/${contractData.manager}` : null },
        { label: "Target", value: formatWeiStr(contractData.target) },
        { label: "Raised Amount", value: formatWeiStr(contractData.raised) },
        { label: "Contract Balance", value: formatWeiStr(contractData.balance) },
        { label: "Contributors", value: contractData.numContribs },
        { label: "Spending Requests", value: contractData.numReq },
        { label: "Min Contribution", value: "100 wei" },
        { label: "Deadline", value: formatDeadline(contractData.deadline) },
      ]
    : [];

  const abiMethods = [
    { name: "sendEth()", type: "payable", desc: "Contribute ETH to the campaign" },
    { name: "checkBalance()", type: "view", desc: "Returns current contract balance" },
    { name: "refund()", type: "write", desc: "Claim refund if deadline passed & target not met" },
    { name: "createRequest(description, value, recipient)", type: "manager", desc: "Create a spending request" },
    { name: "voteRequest(requestId)", type: "write", desc: "Vote to approve a spending request" },
    { name: "makePayment(requestId)", type: "manager", desc: "Execute an approved spending request" },
  ];

  const typeColors = {
    payable: { bg: "#ede9fe", color: "#6d28d9" },
    view: { bg: "#e0f2fe", color: "#0369a1" },
    write: { bg: "#fef9c3", color: "#a16207" },
    manager: { bg: "#fee2e2", color: "#b91c1c" },
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">Contract Details</h3>
        {rows.length === 0 ? (
          <div className="empty-state" style={{ padding: "1rem 0" }}>
            <p>Load a contract to see details</p>
          </div>
        ) : (
          <div className="info-table">
            {rows.map(({ label, value, mono, link }) => (
              <div key={label} className="info-row">
                <span className="info-label">{label}</span>
                <span className={`info-val ${mono ? "mono" : ""}`}>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="info-link">
                      {value} ↗
                    </a>
                  ) : (
                    value
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 className="card-title">ABI Reference</h3>
        <div className="abi-list">
          {abiMethods.map((m) => {
            const style = typeColors[m.type];
            return (
              <div key={m.name} className="abi-row">
                <div className="abi-top">
                  <code className="abi-name">{m.name}</code>
                  <span className="badge" style={{ background: style.bg, color: style.color, fontSize: "10px" }}>
                    {m.type}
                  </span>
                </div>
                <p className="abi-desc">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
