import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { WizardNFT } from '../types';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com');
const metaplex = new Metaplex(connection);

export const fetchWalletWizards = async (walletAddress: string): Promise<WizardNFT[]> => {
  try {
    const owner = new PublicKey(walletAddress);
    const nfts = await metaplex.nfts().findAllByOwner({ owner });
    
    const wizards: WizardNFT[] = [];

    // Filter by symbol "SOLWIZ"
    for (const nft of nfts) {
      if (nft.symbol === "SOLWIZ") {
        // FindAllByOwner returns basic metadata. We need to load full JSON to get attributes
        const fullNft = await metaplex.nfts().load({ metadata: nft });
        
        const attributes = fullNft.json?.attributes || [];
        const typeAttr = attributes.find(a => a.trait_type === "Type");
        const levelAttr = attributes.find(a => a.trait_type === "Level");
        const attackAttr = attributes.find(a => a.trait_type === "Attack");
        const defenseAttr = attributes.find(a => a.trait_type === "Defense");
        const speedAttr = attributes.find(a => a.trait_type === "Speed");
        const hpAttr = attributes.find(a => a.trait_type === "HP");
        const mpAttr = attributes.find(a => a.trait_type === "MP");

        wizards.push({
          mintAddress: fullNft.mint.address.toBase58(),
          name: fullNft.name,
          symbol: fullNft.symbol,
          description: fullNft.json?.description || "",
          image: fullNft.json?.image || "",
          attributes: {
            type: typeAttr?.value?.toString() || "Viking",
            level: Number(levelAttr?.value) || 1,
            attack: Number(attackAttr?.value) || 50,
            defense: Number(defenseAttr?.value) || 50,
            speed: Number(speedAttr?.value) || 50,
            hp: Number(hpAttr?.value) || 100,
            mp: Number(mpAttr?.value) || 50
          }
        });
      }
    }
    
    if (wizards.length === 0) {
      wizards.push({
        mintAddress: "MockMintAddressDefau1tViking",
        name: "Test Viking (Mock)",
        symbol: "SOLWIZ",
        description: "A mock viking for testing the UI",
        image: "",
        attributes: {
          type: "Viking",
          level: 1,
          attack: 50,
          defense: 50,
          speed: 50,
          hp: 100,
          mp: 50
        }
      });
    }

    return wizards;
  } catch (error) {
    console.error("Error fetching wizards from wallet:", error);
    return [];
  }
};
