"use client";

import React, { useState } from 'react';
import { useMockWallet } from '../app/hooks/useMockWallet';
import Header from '../components/Header';
import Home from '../components/Home';
import styles from '../app/stylings/Home.module.css'; // Assuming you have some styles defined

interface DemoWrapperProps {
    children: React.ReactNode;
    isDemoMode: boolean;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

// Toast Component
const ToastNotification: React.FC<{
    toast: Toast;
    onClose: (id: number) => void;
}> = ({ toast, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 4000); // Auto-close after 4 seconds

        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    return (
        <div
            className={`${styles.toast}  ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}
            onClick={() => onClose(toast.id)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className="mr-2">
                        {toast.type === 'success' ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">{toast.message}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(toast.id);
                    }}
                    className="ml-4 text-white hover:text-gray-200 font-bold text-lg leading-none"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

// Mock account object to match wagmi's useAccount return type
const createMockAccount = (mockState: any) => ({
    address: mockState.address as `0x${string}` | undefined,
    isConnected: mockState.isConnected,
    isConnecting: false,
    isDisconnected: !mockState.isConnected,
    isReconnecting: false,
    status: (mockState.isConnected ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
});

const DemoWrapper: React.FC<DemoWrapperProps> = ({ children, isDemoMode }) => {
    const mockWallet = useMockWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // If not in demo mode, return original components
    if (!isDemoMode) {
        return <>{children}</>;
    }

    // Enhanced toast function with proper UI
    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        const newToast: Toast = { id, message, type };

        setToasts(prev => [...prev, newToast]);
        console.log(`[DEMO TOAST] ${type.toUpperCase()}: ${message}`);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Mock transaction functions
    const createMockTransactionHandlers = () => {
        const handleDeposit = async (depositToken: any, depositAmount: string) => {
            if (!depositToken || depositAmount === '0') {
                addToast('Please select a token and enter an amount', 'error');
                return;
            }

            if (!mockWallet.mockState.isConnected) {
                addToast('Please connect your wallet', 'error');
                return;
            }

            try {
                setIsLoading(true);
                await mockWallet.simulateDeposit(depositToken.address, depositAmount);
                addToast(`Successfully deposited ${depositAmount} ${depositToken.symbol}`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Deposit failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleMint = async (mintAmount: string) => {
            if (mintAmount === '0' || mintAmount === '') {
                addToast('Please enter an amount to mint', 'error');
                return;
            }

            if (!mockWallet.mockState.isConnected) {
                addToast('Please connect your wallet', 'error');
                return;
            }

            try {
                setIsLoading(true);
                await mockWallet.simulateMint(mintAmount);
                addToast(`Successfully minted ${mintAmount} DSC`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Mint failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleBurn = async (burnAmount: string) => {
            if (burnAmount === '0' || burnAmount === '') {
                addToast('Please enter an amount to burn', 'error');
                return;
            }

            if (!mockWallet.mockState.isConnected) {
                addToast('Please connect your wallet', 'error');
                return;
            }

            try {
                setIsLoading(true);
                await mockWallet.simulateBurn(burnAmount);
                addToast(`Successfully burned ${burnAmount} DSC`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Burn failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleRedeem = async (redeemToken: any, redeemAmount: string) => {
            if (!redeemToken || redeemAmount === '0' || redeemAmount === '') {
                addToast('Please select a token and enter an amount', 'error');
                return;
            }

            if (!mockWallet.mockState.isConnected) {
                addToast('Please connect your wallet', 'error');
                return;
            }

            try {
                setIsLoading(true);
                await mockWallet.simulateRedeem(redeemToken.address, redeemAmount);
                addToast(`Successfully redeemed ${redeemAmount} ${redeemToken.symbol}`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Redeem failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        const handleComboRedeem = async (comboToken: any, comboCollateralAmount: string, comboDscAmount: string) => {
            if (!comboToken || comboCollateralAmount === '0' || comboCollateralAmount === '' || comboDscAmount === '0' || comboDscAmount === '') {
                addToast('Please fill in all fields', 'error');
                return;
            }

            if (!mockWallet.mockState.isConnected) {
                addToast('Please connect your wallet', 'error');
                return;
            }

            try {
                setIsLoading(true);
                // Simulate both operations
                await mockWallet.simulateRedeem(comboToken.address, comboCollateralAmount);
                await mockWallet.simulateBurn(comboDscAmount);
                addToast(`Successfully redeemed ${comboCollateralAmount} ${comboToken.symbol} for ${comboDscAmount} DSC`, 'success');
            } catch (error: any) {
                addToast(error.message || 'Combo redeem failed', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        return {
            handleDeposit,
            handleMint,
            handleBurn,
            handleRedeem,
            handleComboRedeem,
        };
    };

    const mockAccount = createMockAccount(mockWallet.mockState);
    const mockTransactionHandlers = createMockTransactionHandlers();

    // Use React.Children.map to clone and pass props to each child
    const enhancedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            // Check the component type and inject the appropriate props
            if (child.type === Header) {
                return React.cloneElement(child as React.ReactElement<React.ComponentProps<typeof Header>>, {
                    isDemoMode: true,
                    account: mockAccount,
                    connectMockWallet: mockWallet.connectMockWallet,
                    disconnectMockWallet: mockWallet.disconnectMockWallet,
                });
            }

            if (child.type === Home) {
                return React.cloneElement(child as React.ReactElement<React.ComponentProps<typeof Home>>, {
                    isDemoMode: true,
                    account: mockAccount,
                    healthFactor: mockWallet.mockState.healthFactor,
                    collateralValue: mockWallet.mockState.collateralValue,
                    dscMinted: mockWallet.mockState.dscMinted,
                    dscBalance: mockWallet.mockState.dscBalance,
                    tokenBalances: mockWallet.mockState.tokenBalances,
                    collateralBalances: mockWallet.mockState.collateralBalances,
                    isLoading: isLoading,
                    addToast: addToast, // Pass the enhanced toast function
                    ...mockTransactionHandlers,
                });
            }
        }
        return child;
    });

    return (
        <div className="relative">
            {enhancedChildren}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
                {toasts.map(toast => (
                    <ToastNotification
                        key={toast.id}
                        toast={toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>
    );
}

export default DemoWrapper;