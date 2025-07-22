export const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/d88YssUM39VV0HbObmjiz8yaMlarlBI8";
export const CONTRACT_ADDRESS = "0x16aFc4470C195A45233f4e4ae8cED7403b359A84"; // Replace with your deployed contract address on Sepolia
export const CHAIN_ID = 11155111; // Sepolia Testnet Chain ID

export const getSepoliaConfig = () => {
    return {
        rpcUrl: SEPOLIA_RPC_URL,
        contractAddress: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
    };
};