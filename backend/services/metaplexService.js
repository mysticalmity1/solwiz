const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58').default || require('bs58'); // Ensure bs58 is compatible

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
let metaplex;

if (process.env.BACKEND_KEYPAIR) {
  try {
    const secretKey = bs58.decode(process.env.BACKEND_KEYPAIR);
    const keypair = Keypair.fromSecretKey(secretKey);
    metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
    console.log("Metaplex service initialized with authority:", keypair.publicKey.toBase58());
  } catch (err) {
    console.error("Failed to initialize Metaplex authority:", err.message);
  }
}

/**
 * Updates the 'Level' attribute on-chain.
 */
async function updateWizardLevel(mintAddress, newLevel, retryCount = 0) {
  if (!metaplex) {
    console.warn("Metaplex not initialized. Skipping on-chain update for mint", mintAddress);
    return false;
  }

  try {
    const mintPublicKey = new PublicKey(mintAddress);
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
    
    // Find and update the Level attribute
    const updatedAttributes = nft.json.attributes.map(attr => {
      if (attr.trait_type === "Level") {
        return { ...attr, value: newLevel };
      }
      return attr;
    });

    const { uri: newUri } = await metaplex.nfts().uploadMetadata({
      ...nft.json,
      attributes: updatedAttributes
    });

    await metaplex.nfts().update({
      nftOrSft: nft,
      uri: newUri
    });

    console.log(`Successfully updated NFT ${mintAddress} to level ${newLevel} on-chain.`);
    return true;
  } catch (error) {
    console.error(`Error updating NFT level for ${mintAddress}:`, error.message);
    if (retryCount < 3) {
      console.log(`Retrying on-chain update... attempt ${retryCount + 1}`);
      return updateWizardLevel(mintAddress, newLevel, retryCount + 1);
    }
    return false;
  }
}

module.exports = {
  updateWizardLevel
};
