"use client";

import { useState, useCallback } from 'react';
import { DEMO_CONSTANTS } from '../constants/demoConstants';

interface MockWalletState {
    isConnected: boolean;
    address: string;
    chainId: number;
    tokenBalances: { [key: string]: string };
    collateralBalances: { [key: string]: string };
    healthFactor: string;
    collateralValue: string;
    dscMinted: string;
    dscBalance: string;
}

export const useMockWallet = () => {
    const [mockState, setMockState] = useState<MockWalletState>({
        isConnected: false,
        address: '',
        chainId: DEMO_CONSTANTS.MOCK_CHAIN_ID,
        tokenBalances: {
            '0xdd13E55209Fd76AfE204dBda4007C227904f0a81': DEMO_CONSTANTS.INITIAL_WETH_BALANCE,
            '0x779877A7B0D9E8603169DdbD7836e478b4624789': DEMO_CONSTANTS.INITIAL_LINK_BALANCE,
        },
        collateralBalances: {
            '0xdd13E55209Fd76AfE204dBda4007C227904f0a81': '0',
            '0x779877A7B0D9E8603169DdbD7836e478b4624789': '0',
        },
        healthFactor: DEMO_CONSTANTS.INITIAL_HEALTH_FACTOR,
        collateralValue: DEMO_CONSTANTS.INITIAL_COLLATERAL_VALUE,
        dscMinted: DEMO_CONSTANTS.INITIAL_DSC_MINTED,
        dscBalance: DEMO_CONSTANTS.INITIAL_DSC_BALANCE,
    });

    const connectMockWallet = useCallback(() => {
        setMockState(prev => ({
            ...prev,
            isConnected: true,
            address: DEMO_CONSTANTS.MOCK_ADDRESS,
        }));
    }, []);

    const disconnectMockWallet = useCallback(() => {
        setMockState(prev => ({
            ...prev,
            isConnected: false,
            address: '',
        }));
    }, []);

    const updateTokenBalance = useCallback((tokenAddress: string, newBalance: string) => {
        setMockState(prev => ({
            ...prev,
            tokenBalances: {
                ...prev.tokenBalances,
                [tokenAddress]: newBalance,
            },
        }));
    }, []);

    const updateCollateralBalance = useCallback((tokenAddress: string, newBalance: string) => {
        setMockState(prev => ({
            ...prev,
            collateralBalances: {
                ...prev.collateralBalances,
                [tokenAddress]: newBalance,
            },
        }));
    }, []);

    const updateAccountData = useCallback((updates: Partial<Pick<MockWalletState, 'healthFactor' | 'collateralValue' | 'dscMinted' | 'dscBalance'>>) => {
        setMockState(prev => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const calculateHealthFactor = useCallback((collateralValue: number, dscMinted: number): string => {
        if (dscMinted === 0) return '';
        const liquidationThreshold = 50; // 50%
        const healthFactor = (collateralValue * liquidationThreshold) / (100 * dscMinted);
        return healthFactor.toFixed(4);
    }, []);

    const simulateDeposit = useCallback(async (tokenAddress: string, amount: string) => {
        const amountNum = parseFloat(amount);
        const currentTokenBalance = parseFloat(mockState.tokenBalances[tokenAddress] || '0');
        const currentCollateralBalance = parseFloat(mockState.collateralBalances[tokenAddress] || '0');

        if (currentTokenBalance < amountNum) {
            throw new Error('Insufficient balance');
        }

        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, DEMO_CONSTANTS.TRANSACTION_DELAY));

        const newTokenBalance = (currentTokenBalance - amountNum).toString();
        const newCollateralBalance = (currentCollateralBalance + amountNum).toString();

        updateTokenBalance(tokenAddress, newTokenBalance);
        updateCollateralBalance(tokenAddress, newCollateralBalance);

        // Update collateral value (assuming 1:1 USD for simplicity, WETH = $3000, LINK = $15)
        const priceMultiplier = tokenAddress === '0xdd13E55209Fd76AfE204dBda4007C227904f0a81' ? 3000 : 15;
        const currentCollateralValue = parseFloat(mockState.collateralValue);
        const newCollateralValue = (currentCollateralValue + (amountNum * priceMultiplier)).toString();

        const currentDscMinted = parseFloat(mockState.dscMinted);
        const newHealthFactor = calculateHealthFactor(parseFloat(newCollateralValue), currentDscMinted);

        updateAccountData({
            collateralValue: newCollateralValue,
            healthFactor: newHealthFactor,
        });
    }, [mockState, updateTokenBalance, updateCollateralBalance, updateAccountData, calculateHealthFactor]);

    const simulateMint = useCallback(async (amount: string) => {
        const amountNum = parseFloat(amount);
        const currentCollateralValue = parseFloat(mockState.collateralValue);
        const currentDscMinted = parseFloat(mockState.dscMinted);
        const currentDscBalance = parseFloat(mockState.dscBalance);

        // Check if mint is safe (health factor > 1.1)
        const maxMintable = (currentCollateralValue * 50) / (100 * 1.1) - currentDscMinted;
        if (amountNum > maxMintable) {
            throw new Error('Would break health factor');
        }

        await new Promise(resolve => setTimeout(resolve, DEMO_CONSTANTS.TRANSACTION_DELAY));

        const newDscMinted = (currentDscMinted + amountNum).toString();
        const newDscBalance = (currentDscBalance + amountNum).toString();
        const newHealthFactor = calculateHealthFactor(currentCollateralValue, parseFloat(newDscMinted));

        updateAccountData({
            dscMinted: newDscMinted,
            dscBalance: newDscBalance,
            healthFactor: newHealthFactor,
        });
    }, [mockState, updateAccountData, calculateHealthFactor]);

    const simulateBurn = useCallback(async (amount: string) => {
        const amountNum = parseFloat(amount);
        const currentDscBalance = parseFloat(mockState.dscBalance);
        const currentDscMinted = parseFloat(mockState.dscMinted);

        if (currentDscBalance < amountNum) {
            throw new Error('Insufficient DSC balance');
        }

        await new Promise(resolve => setTimeout(resolve, DEMO_CONSTANTS.TRANSACTION_DELAY));

        const newDscBalance = (currentDscBalance - amountNum).toString();
        const newDscMinted = (currentDscMinted - amountNum).toString();
        const currentCollateralValue = parseFloat(mockState.collateralValue);
        const newHealthFactor = calculateHealthFactor(currentCollateralValue, parseFloat(newDscMinted));

        updateAccountData({
            dscBalance: newDscBalance,
            dscMinted: newDscMinted,
            healthFactor: newHealthFactor,
        });
    }, [mockState, updateAccountData, calculateHealthFactor]);

    const simulateRedeem = useCallback(async (tokenAddress: string, amount: string) => {
        const amountNum = parseFloat(amount);
        const currentCollateralBalance = parseFloat(mockState.collateralBalances[tokenAddress] || '0');
        const currentTokenBalance = parseFloat(mockState.tokenBalances[tokenAddress] || '0');

        if (currentCollateralBalance < amountNum) {
            throw new Error('Insufficient collateral balance');
        }

        await new Promise(resolve => setTimeout(resolve, DEMO_CONSTANTS.TRANSACTION_DELAY));

        const newCollateralBalance = (currentCollateralBalance - amountNum).toString();
        const newTokenBalance = (currentTokenBalance + amountNum).toString();

        updateCollateralBalance(tokenAddress, newCollateralBalance);
        updateTokenBalance(tokenAddress, newTokenBalance);

        // Update collateral value
        const priceMultiplier = tokenAddress === '0xdd13E55209Fd76AfE204dBda4007C227904f0a81' ? 3000 : 15;
        const currentCollateralValue = parseFloat(mockState.collateralValue);
        const newCollateralValue = (currentCollateralValue - (amountNum * priceMultiplier)).toString();

        const currentDscMinted = parseFloat(mockState.dscMinted);
        const newHealthFactor = calculateHealthFactor(parseFloat(newCollateralValue), currentDscMinted);

        updateAccountData({
            collateralValue: newCollateralValue,
            healthFactor: newHealthFactor,
        });
    }, [mockState, updateTokenBalance, updateCollateralBalance, updateAccountData, calculateHealthFactor]);

    return {
        mockState,
        connectMockWallet,
        disconnectMockWallet,
        simulateDeposit,
        simulateMint,
        simulateBurn,
        simulateRedeem,
    };
};