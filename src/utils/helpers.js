// Format wei into human-readable string
export const formatWei = (wei, decimals = 4) => {
  const n = BigInt(wei || 0);
  const ETH = BigInt("1000000000000000000");
  const GWEI = BigInt("1000000000");

  if (n >= ETH) {
    return { value: (Number(n) / 1e18).toFixed(decimals), unit: "ETH" };
  }
  if (n >= GWEI) {
    return { value: (Number(n) / 1e9).toFixed(2), unit: "Gwei" };
  }
  return { value: n.toString(), unit: "wei" };
};

export const formatWeiStr = (wei) => {
  const { value, unit } = formatWei(wei);
  return `${value} ${unit}`;
};

// Shorten an Ethereum address
export const shortAddr = (addr) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

// Format timestamp to human-readable date
export const formatDeadline = (ts) => {
  if (!ts) return "—";
  const d = new Date(Number(ts) * 1000);
  return d.toLocaleString([], {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// Check if deadline has passed
export const isExpired = (ts) => {
  if (!ts) return false;
  return Date.now() > Number(ts) * 1000;
};

// Calculate funding progress %
export const calcProgress = (raised, target) => {
  if (!target || target === "0") return 0;
  return Math.min(100, Math.round((Number(raised) / Number(target)) * 100));
};

// Parse revert reason from error
export const parseError = (e) => {
  const msg = e?.message || e?.toString() || "Unknown error";
  const revertMatch = msg.match(/revert (.+?)(?:"|$)/);
  if (revertMatch) return revertMatch[1];
  if (msg.includes("User denied")) return "Transaction was rejected";
  if (msg.includes("insufficient funds")) return "Insufficient funds";
  return msg.slice(0, 120);
};

// Etherscan TX link
export const txLink = (hash, explorer) => {
  if (!explorer || !hash) return null;
  return `${explorer}/tx/${hash}`;
};
