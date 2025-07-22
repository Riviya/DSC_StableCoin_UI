"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Wallet, Activity, TrendingUp, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { DSCEngineABI } from '../utils/DSCEngine';
import { DSCEngineAddress } from '@/utils/addresses';
import { DSCAddress } from '@/utils/addresses';
import { DSCABI } from '../utils/DSCABI';
import Config from "@/rainbowKitConfig";
import { readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { erc20Abi, formatUnits, parseUnits } from 'viem'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import styles from '../app/stylings/Home.module.css';

// --- TYPE DEFINITIONS ---
interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

interface TokenSelectorProps {
    selectedToken: Token | null;
    onTokenSelect: (token: Token) => void;
    tokens: Token[];
}

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    availableAmount?: string;
    tokenSymbol?: string;
    onMaxClick?: () => void;
}

// Props for the Home component, enabling Demo Mode
interface HomeProps {
    isDemoMode?: boolean;
    account?: {
        address?: `0x${string}` | undefined;
        isConnected: boolean;
        status?: 'connected' | 'disconnected';
    };
    healthFactor?: string;
    collateralValue?: string;
    dscMinted?: string;
    dscBalance?: string;
    tokenBalances?: { [key: string]: string };
    collateralBalances?: { [key: string]: string };
    isLoading?: boolean;
    addToast?: (message: string, type: 'success' | 'error') => void;
    handleDeposit?: (token: Token, amount: string) => Promise<void>;
    handleMint?: (amount: string) => Promise<void>;
    handleBurn?: (amount: string) => Promise<void>;
    handleRedeem?: (token: Token, amount: string) => Promise<void>;
    handleComboRedeem?: (token: Token, collateralAmount: string, dscAmount: string) => Promise<void>;
}


// --- CONSTANTS ---
const SUPPORTED_TOKENS: Token[] = [
    { symbol: 'WETH', name: 'Wrapped Ethereum', address: '0xdd13E55209Fd76AfE204dBda4007C227904f0a81', decimals: 18 },
    { symbol: 'LINK', name: 'Chainlink', address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', decimals: 18 }
];


// --- UI SUB-COMPONENTS ---
const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles.toast} ${type === 'success' ? styles.toastSuccess : styles.toastError}`} onClick={onClose}>
            <div className={styles.toastContent}>
                {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                <span>{message}</span>
            </div>
        </div>
    );
};

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, placeholder = "0.00", disabled = false, availableAmount, tokenSymbol, onMaxClick }) => {
    return (
        <div className={styles.amountInputContainer}>
            <div className={styles.amountInputWrapper}>
                <input
                    type="number"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.formInput}
                    disabled={disabled}
                />
                {onMaxClick && (
                    <button type="button" className={styles.maxButton} onClick={onMaxClick} disabled={disabled}>
                        MAX
                    </button>
                )}
            </div>
            {availableAmount && (
                <div className={styles.availableAmount}>
                    Available: {availableAmount} {tokenSymbol}
                </div>
            )}
        </div>
    );
};

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, onTokenSelect, tokens }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className={styles.tokenSelector}>
            <button className={styles.tokenSelectorButton} onClick={() => setIsOpen(!isOpen)}>
                {selectedToken ? (
                    <div className={styles.tokenDisplay}>
                        <div className={styles.tokenIcon}>{selectedToken.symbol[0]}</div>
                        <span>{selectedToken.symbol}</span>
                    </div>
                ) : (
                    <span>Select Token</span>
                )}
                <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronRotate : ''}`} />
            </button>
            {isOpen && (
                <div className={styles.tokenDropdown}>
                    {tokens.map((token) => (
                        <button key={token.address} className={styles.tokenOption} onClick={() => { onTokenSelect(token); setIsOpen(false); }}>
                            <div className={styles.tokenDisplay}>
                                <div className={styles.tokenIcon}>{token.symbol[0]}</div>
                                <div>
                                    <div className={styles.tokenSymbol}>{token.symbol}</div>
                                    <div className={styles.tokenName}>{token.name}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const Home: React.FC<HomeProps> = (props) => {
    const { isDemoMode = false } = props;

    // --- DATA HOOKS & STATE SELECTION ---

    // Live mode data from wagmi
    const liveAccount = useAccount();

    // Demo mode data from props
    const demoData = {
        account: props.account,
        healthFactor: props.healthFactor ?? 'NaN',
        collateralValue: props.collateralValue ?? 'NaN',
        dscMinted: props.dscMinted ?? 'NaN',
        dscBalance: props.dscBalance ?? 'NaN',
        tokenBalances: props.tokenBalances ?? {},
        collateralBalances: props.collateralBalances ?? {},
        isLoading: props.isLoading ?? false,
    };

    // Select the active data source based on mode
    const account = isDemoMode ? demoData.account : liveAccount;

    // State for live mode data (fetched from contracts)
    const [liveHealthFactor, setLiveHealthFactor] = useState<string>('NaN');
    const [liveCollateralValue, setLiveCollateralValue] = useState<string>('NaN');
    const [liveDscMinted, setLiveDscMinted] = useState<string>('NaN');
    const [liveDscBalance, setLiveDscBalance] = useState<string>('NaN');
    const [liveTokenBalances, setLiveTokenBalances] = useState<{ [key: string]: string }>({});
    const [liveCollateralBalances, setLiveCollateralBalances] = useState<{ [key: string]: string }>({});
    const [liveIsLoading, setLiveIsLoading] = useState<boolean>(false);

    // Select the active state values to display in the UI
    const healthFactor = isDemoMode ? demoData.healthFactor : liveHealthFactor;
    const collateralValue = isDemoMode ? demoData.collateralValue : liveCollateralValue;
    const dscMinted = isDemoMode ? demoData.dscMinted : liveDscMinted;
    const dscBalance = isDemoMode ? demoData.dscBalance : liveDscBalance;
    const tokenBalances = isDemoMode ? demoData.tokenBalances : liveTokenBalances;
    const collateralBalances = isDemoMode ? demoData.collateralBalances : liveCollateralBalances;
    const isLoading = isDemoMode ? demoData.isLoading : liveIsLoading;

    // Form states (shared between modes)
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [depositToken, setDepositToken] = useState<Token | null>(null);
    const [depositAmount, setDepositAmount] = useState<string>('');
    const [mintAmount, setMintAmount] = useState<string>('');
    const [burnAmount, setBurnAmount] = useState<string>('');
    const [redeemToken, setRedeemToken] = useState<Token | null>(null);
    const [redeemAmount, setRedeemAmount] = useState<string>('');
    const [comboToken, setComboToken] = useState<Token | null>(null);
    const [comboCollateralAmount, setComboCollateralAmount] = useState<string>('');
    const [comboDscAmount, setComboDscAmount] = useState<string>('');

    // --- TOAST MANAGEMENT ---
    const liveAddToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    const addToast = isDemoMode ? (props.addToast!) : liveAddToast;

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // --- LIVE MODE DATA FETCHING ---
    const fetchTokenBalances = async () => {
        if (!account?.address || !account.isConnected) return;
        try {
            const balances: Record<string, string> = {}
            const collateralBals: Record<string, string> = {}
            for (const token of SUPPORTED_TOKENS) {
                const balance = await readContract(Config, { abi: erc20Abi, address: token.address as `0x${string}`, functionName: 'balanceOf', args: [account.address], });
                balances[token.address] = formatUnits(balance as bigint, token.decimals)
                const collateralAmount = await readContract(Config, { abi: DSCEngineABI, address: DSCEngineAddress as `0x${string}`, functionName: 'getCollateralBalanceOfUser', args: [account.address, token.address], });
                collateralBals[token.address] = formatUnits(collateralAmount as bigint, token.decimals)
            }
            setLiveTokenBalances(balances);
            setLiveCollateralBalances(collateralBals);
        } catch (error) {
            console.error('Error fetching token balances:', error);
        }
    }

    const fetchData = useCallback(async () => {
        if (isDemoMode) return; // Don't fetch on-chain data in demo mode

        if (!account?.address || !account.isConnected) {
            // Reset all values when wallet is disconnected
            setLiveHealthFactor('NaN');
            setLiveCollateralValue('NaN');
            setLiveDscMinted('NaN');
            setLiveDscBalance('NaN');
            setLiveTokenBalances({});
            setLiveCollateralBalances({});
            return;
        }

        try {
            // Fetch health factor
            const hf = await readContract(Config, {
                abi: DSCEngineABI,
                address: DSCEngineAddress as `0x${string}`,
                functionName: 'getHealthFactor',
                args: [account.address]
            });
            setLiveHealthFactor(formatUnits(hf as bigint, 18));

            // Fetch collateral value
            const cv = await readContract(Config, {
                abi: DSCEngineABI,
                address: DSCEngineAddress as `0x${string}`,
                functionName: 'getAccountCollateralValue',
                args: [account.address]
            });
            setLiveCollateralValue(formatUnits(cv as bigint, 18));

            // Fetch account information (DSC minted)
            const accountInfo = await readContract(Config, {
                abi: DSCEngineABI,
                address: DSCEngineAddress as `0x${string}`,
                functionName: 'getAccountInformation',
                args: [account.address]
            });
            setLiveDscMinted(formatUnits((accountInfo as [bigint, bigint])[0], 18));

            // Fetch DSC balance
            const bal = await readContract(Config, {
                abi: DSCABI,
                address: DSCAddress as `0x${string}`,
                functionName: 'balanceOf',
                args: [account.address]
            });
            setLiveDscBalance(formatUnits(bal as bigint, 18));

            // Fetch token balances
            await fetchTokenBalances();
        } catch (error) {
            console.error('Error fetching data:', error);
            setLiveHealthFactor('NaN');
            setLiveCollateralValue('NaN');
            setLiveDscMinted('NaN');
            setLiveDscBalance('NaN');
        }
    }, [account?.address, account?.isConnected, isDemoMode]); // Add dependencies

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- MAX BUTTON HANDLERS ---
    const handleDepositMax = () => depositToken && tokenBalances[depositToken.address] && setDepositAmount(tokenBalances[depositToken.address]);
    const handleMintMax = () => collateralValue !== 'NaN' && healthFactor !== 'NaN' && setMintAmount((parseFloat(collateralValue) * 50 / (100 * 1.1) - parseFloat(dscMinted)).toString());
    const handleBurnMax = () => dscBalance !== 'NaN' && setBurnAmount(dscBalance);
    const handleRedeemMax = () => redeemToken && collateralBalances[redeemToken.address] && setRedeemAmount(collateralBalances[redeemToken.address]);
    const handleComboCollateralMax = () => comboToken && collateralBalances[comboToken.address] && setComboCollateralAmount(collateralBalances[comboToken.address]);
    const handleComboDscMax = () => dscBalance !== 'NaN' && setComboDscAmount(dscBalance);

    // --- TRANSACTION HANDLERS ---
    const handleDeposit = async () => {
        if (isDemoMode) {
            await props.handleDeposit!(depositToken!, depositAmount);
            setDepositAmount('');
            return;
        }
        if (!depositToken || depositAmount == '0') return addToast('Please select a token and enter an amount', 'error');
        if (!account?.isConnected || !account?.address) return addToast('Please connect your wallet', 'error');
        try {
            setLiveIsLoading(true);
            const amount = parseUnits(depositAmount, depositToken.decimals);
            const approveTx = await writeContract(Config, {
                abi: erc20Abi,
                address: depositToken.address as `0x${string}`,
                functionName: 'approve',
                args: [DSCEngineAddress as `0x${string}`, amount],
            });
            await waitForTransactionReceipt(Config, { hash: approveTx });
            const depositTx = await writeContract(Config, {
                abi: DSCEngineABI,
                address: DSCEngineAddress as `0x${string}`,
                functionName: 'depositCollateral',
                args: [depositToken.address as `0x${string}`, amount],
            });
            await waitForTransactionReceipt(Config, { hash: depositTx });
            addToast(`Successfully deposited ${depositAmount} ${depositToken.symbol}`, 'success');
            setDepositAmount('');

            await fetchData();  // Refresh data after minting

        } catch (error) {
            console.error('Deposit error:', error); addToast('Deposit failed', 'error');
        } finally {
            setLiveIsLoading(false);
        }
    };

    const handleMint = async () => {
        if (isDemoMode) {
            await props.handleMint!(mintAmount);
            setMintAmount('');
            return;
        }
        if (mintAmount == '0' || mintAmount === '') return addToast('Please enter an amount to mint', 'error');
        if (!account?.isConnected || !account?.address) return addToast('Please connect your wallet', 'error');
        try {
            setLiveIsLoading(true);
            const amount = parseUnits(mintAmount, 18);
            const txHash = await writeContract(Config, { abi: DSCEngineABI, address: DSCEngineAddress as `0x${string}`, functionName: 'mintDsc', args: [amount], });
            await waitForTransactionReceipt(Config, { hash: txHash });
            addToast(`Successfully minted ${mintAmount} DSC`, 'success');
            setMintAmount('');

            await fetchData();  // Refresh data after minting

        } catch (error) {
            console.error('Mint error:', error); addToast('Mint failed', 'error');
        } finally {
            setLiveIsLoading(false);
        }
    };

    const handleBurn = async () => {
        if (isDemoMode) {
            await props.handleBurn!(burnAmount);
            setBurnAmount('');
            return;
        }
        if (burnAmount == '0' || burnAmount === '') return addToast('Please enter an amount to burn', 'error');
        if (!account?.isConnected || !account?.address) return addToast('Please connect your wallet', 'error');
        try {
            setLiveIsLoading(true);
            const amount = parseUnits(burnAmount, 18);
            const approveTx = await writeContract(Config, {
                abi: erc20Abi,
                address: DSCAddress as `0x${string}`,
                functionName: 'approve',
                args: [DSCEngineAddress as `0x${string}`, amount],
            });
            await waitForTransactionReceipt(Config, { hash: approveTx });
            const burnTx = await writeContract(Config, {
                abi: DSCEngineABI,
                address: DSCEngineAddress as `0x${string}`,
                functionName: 'burnDsc',
                args: [amount],
            });
            await waitForTransactionReceipt(Config, { hash: burnTx });
            addToast(`Successfully burned ${burnAmount} DSC`, 'success');
            setBurnAmount('');

            await fetchData();  // Refresh data after minting

        } catch (error) {
            console.error('Burn error:', error); addToast('Burn failed', 'error');
        } finally {
            setLiveIsLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (isDemoMode) {
            await props.handleRedeem!(redeemToken!, redeemAmount);
            setRedeemAmount('');
            return;
        }
        if (!redeemToken || redeemAmount === '0' || redeemAmount === '') return addToast('Please select a token and enter an amount', 'error');
        if (!account?.isConnected || !account?.address) return addToast('Please connect your wallet', 'error');
        try {
            setLiveIsLoading(true);
            const amount = parseUnits(redeemAmount, redeemToken.decimals);
            const txHash = await writeContract(Config, { abi: DSCEngineABI, address: DSCEngineAddress as `0x${string}`, functionName: 'redeemCollateral', args: [redeemToken.address as `0x${string}`, amount], });
            await waitForTransactionReceipt(Config, { hash: txHash });
            addToast(`Successfully redeemed ${redeemAmount} ${redeemToken.symbol}`, 'success');
            setRedeemAmount('');

            await fetchData();  // Refresh data after minting

        } catch (error) {
            console.error('Redeem error:', error); addToast('Redeem failed', 'error');
        } finally {
            setLiveIsLoading(false);
        }
    };

    const handleComboRedeem = async () => {
        if (isDemoMode) {
            await props.handleComboRedeem!(comboToken!, comboCollateralAmount, comboDscAmount);
            setComboCollateralAmount('');
            setComboDscAmount('');
            return;
        }
        if (!comboToken || comboCollateralAmount == '0' || comboDscAmount == '0') return addToast('Please fill in all fields', 'error');
        if (!account?.isConnected || !account?.address) return addToast('Please connect your wallet', 'error');
        try {
            setLiveIsLoading(true);
            const collateralAmount = parseUnits(comboCollateralAmount, comboToken.decimals);
            const dscAmount = parseUnits(comboDscAmount, 18);
            const approveTx = await writeContract(Config, { abi: ['function approve(address spender, uint256 amount) public returns (bool)',], address: DSCAddress as `0x${string}`, functionName: 'approve', args: [DSCEngineAddress as `0x${string}`, dscAmount], });
            await waitForTransactionReceipt(Config, { hash: approveTx });
            const comboTx = await writeContract(Config, { abi: DSCEngineABI, address: DSCEngineAddress as `0x${string}`, functionName: 'redeemCollateralForDsc', args: [comboToken.address as `0x${string}`, collateralAmount, dscAmount], });
            await waitForTransactionReceipt(Config, { hash: comboTx });
            addToast(`Successfully redeemed ${comboCollateralAmount} ${comboToken.symbol} for ${comboDscAmount} DSC`, 'success');
            setComboCollateralAmount('');
            setComboDscAmount('');

            await fetchData();  // Refresh data after minting


        } catch (error) {
            console.error('Combo redeem error:', error); addToast('Combo redeem failed', 'error');
        } finally {
            setLiveIsLoading(false);
        }
    };

    // --- UI HELPER FUNCTIONS ---
    const formatAvailableAmount = (amount: string): string => {
        if (!amount || amount === '0') return '0.00';
        const numAmount = parseFloat(amount);
        return numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    };

    const getHealthFactorColor = (factor: string): string => {
        if (factor === 'NaN' || factor === '') return '#888';
        const numFactor = parseFloat(factor);
        if (numFactor >= 1.5) return '#1bc835de';
        if (numFactor >= 1.2) return '#ffa500';
        return '#ff3c6a';
    };

    const getHealthFactorStatus = (factor: string): string => {
        if (factor === 'NaN') return 'Connect Wallet';
        if (factor === '') return 'No Collateral';
        const numFactor = parseFloat(factor);
        if (numFactor >= 1.5) return 'Safe';
        if (numFactor >= 1.2) return 'Caution';
        return 'Danger';
    };

    const formatDisplayValue = (value: string, isUSD = false): string => {
        if (value === 'NaN') return 'N/A';
        const numValue = parseFloat(value);
        if (isUSD) return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    // --- RENDER ---
    return (
        <div className={styles.dashboard}>
            <div className={styles.toastContainer}>
                {toasts.map((toast) => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
                ))}
            </div>

            <div className={styles.hero}>
                <h1 className={styles.title}>DeFi Dashboard</h1>
                <p className={styles.subtitle}>
                    Manage your collateral, mint DSC tokens, and monitor your health factor in this decentralized stablecoin protocol
                </p>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}><Activity size={20} /><span>Health Factor</span></div>
                    <div className={styles.infoValue} style={{ color: getHealthFactorColor(healthFactor) }}>{formatDisplayValue(healthFactor)}</div>
                    <div className={styles.infoDesc} style={{ color: getHealthFactorColor(healthFactor) }}>{getHealthFactorStatus(healthFactor)}</div>
                </div>
                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}><TrendingUp size={20} /><span>Collateral Value</span></div>
                    <div className={styles.infoValue}>${formatDisplayValue(collateralValue, true)}</div>
                    <div className={styles.infoDesc}>USD Value</div>
                </div>
                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}><DollarSign size={20} /><span>DSC Minted</span></div>
                    <div className={styles.infoValue}>{formatDisplayValue(dscMinted)}</div>
                    <div className={styles.infoDesc}>DSC Tokens</div>
                </div>
                <div className={styles.infoCard}>
                    <div className={styles.infoHeader}><Wallet size={20} /><span>DSC Balance</span></div>
                    <div className={styles.infoValue}>{formatDisplayValue(dscBalance)}</div>
                    <div className={styles.infoDesc}>In Wallet</div>
                </div>
            </div>

            <div className={styles.actionGrid}>
                <div className={styles.actionCard}>
                    <div className={styles.actionHeader}><h3>Deposit Collateral</h3><p>Add collateral to increase your borrowing power</p></div>
                    <div className={styles.formGroup}><label>Token</label><TokenSelector selectedToken={depositToken} onTokenSelect={setDepositToken} tokens={SUPPORTED_TOKENS} /></div>
                    <div className={styles.formGroup}><label>Amount</label><AmountInput value={depositAmount} onChange={setDepositAmount} availableAmount={depositToken ? formatAvailableAmount(tokenBalances[depositToken.address] || '0') : undefined} tokenSymbol={depositToken?.symbol} onMaxClick={handleDepositMax} disabled={isLoading} /></div>
                    <button className={styles.actionButton} onClick={handleDeposit} disabled={!account?.isConnected || isLoading}>{isLoading ? 'Processing...' : 'Deposit Collateral'}</button>
                </div>

                <div className={styles.actionCard}>
                    <div className={styles.actionHeader}><h3>Mint DSC</h3><p>Mint DSC tokens against your collateral</p></div>
                    <div className={styles.formGroup}><label>DSC Amount</label><AmountInput value={mintAmount} onChange={setMintAmount} availableAmount={collateralValue !== 'NaN' ? formatAvailableAmount((parseFloat(collateralValue) * 50 / (100 * 1.1) - parseFloat(dscMinted)).toString()) : undefined} tokenSymbol="DSC" onMaxClick={handleMintMax} disabled={isLoading} /></div>
                    <button className={styles.actionButton} onClick={handleMint} disabled={!account?.isConnected || isLoading}>{isLoading ? 'Processing...' : 'Mint DSC'}</button>
                </div>

                <div className={styles.actionCard}>
                    <div className={styles.actionHeader}><h3>Burn DSC</h3><p>Burn DSC tokens to reduce your debt</p></div>
                    <div className={styles.formGroup}><label>DSC Amount</label><AmountInput value={burnAmount} onChange={setBurnAmount} availableAmount={formatAvailableAmount(dscBalance)} tokenSymbol="DSC" onMaxClick={handleBurnMax} disabled={isLoading} /></div>
                    <button className={styles.actionButton} onClick={handleBurn} disabled={!account?.isConnected || isLoading}>{isLoading ? 'Processing...' : 'Burn DSC'}</button>
                </div>

                <div className={styles.actionCard}>
                    <div className={styles.actionHeader}><h3>Redeem Collateral</h3><p>Withdraw your collateral tokens</p></div>
                    <div className={styles.formGroup}><label>Token</label><TokenSelector selectedToken={redeemToken} onTokenSelect={setRedeemToken} tokens={SUPPORTED_TOKENS} /></div>
                    <div className={styles.formGroup}><label>Amount</label><AmountInput value={redeemAmount} onChange={setRedeemAmount} availableAmount={redeemToken ? formatAvailableAmount(collateralBalances[redeemToken.address] || '0') : undefined} tokenSymbol={redeemToken?.symbol} onMaxClick={handleRedeemMax} disabled={isLoading} /></div>
                    <button className={styles.actionButton} onClick={handleRedeem} disabled={!account?.isConnected || isLoading}>{isLoading ? 'Processing...' : 'Redeem Collateral'}</button>
                </div>

                <div className={`${styles.actionCard} ${styles.actionCardLarge}`}>
                    <div className={styles.actionHeader}><h3>Redeem Collateral for DSC</h3><p>Simultaneously redeem collateral and burn DSC tokens</p></div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label>Token</label><TokenSelector selectedToken={comboToken} onTokenSelect={setComboToken} tokens={SUPPORTED_TOKENS} /></div>
                        <div className={styles.formGroup}><label>Collateral Amount</label><AmountInput value={comboCollateralAmount} onChange={setComboCollateralAmount} availableAmount={comboToken ? formatAvailableAmount(collateralBalances[comboToken.address] || '0') : undefined} tokenSymbol={comboToken?.symbol} onMaxClick={handleComboCollateralMax} disabled={isLoading} /></div>
                        <div className={styles.formGroup}><label>DSC to Burn</label><AmountInput value={comboDscAmount} onChange={setComboDscAmount} availableAmount={formatAvailableAmount(dscBalance)} tokenSymbol="DSC" onMaxClick={handleComboDscMax} disabled={isLoading} /></div>
                    </div>
                    <button className={styles.actionButton} onClick={handleComboRedeem} disabled={!account?.isConnected || isLoading}>{isLoading ? 'Processing...' : 'Redeem & Burn'}</button>
                </div>
            </div>
        </div>
    );
};

export default Home;