

export const DEMO_CONSTANTS = {
    // Initial balances
    INITIAL_WETH_BALANCE: '10.0',
    INITIAL_LINK_BALANCE: '100.0',
    INITIAL_DSC_BALANCE: '0.0',

    // Mock wallet data
    MOCK_ADDRESS: '0xDemo123...456789',
    MOCK_CHAIN_ID: 11155111, // Sepolia

    // Initial account state
    INITIAL_HEALTH_FACTOR: '0',
    INITIAL_COLLATERAL_VALUE: '0',
    INITIAL_DSC_MINTED: '0',

    // Transaction simulation delays
    TRANSACTION_DELAY: 2000, // 2 seconds
    APPROVAL_DELAY: 1000,    // 1 second

    // Demo mode indicators
    DEMO_LABEL: '🎮 DEMO',
    LIVE_LABEL: '🔗 ONCHAIN',
} as const;