// This middleware ensures requests requiring a wallet address actually provide one.
function validateWallet(req, res, next) {
  const walletAddress = req.body.walletAddress || req.params.walletAddress || req.query.walletAddress;

  if (!walletAddress) {
    return res.status(401).json({ error: "Unauthorized: Wallet address is required" });
  }

  // Basic validate string format (base58 chars, length between 32-44)
  const isBase58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress);
  if (!isBase58) {
    return res.status(400).json({ error: "Invalid wallet address format" });
  }

  // Pass it along
  req.walletAddress = walletAddress;
  next();
}

module.exports = validateWallet;
