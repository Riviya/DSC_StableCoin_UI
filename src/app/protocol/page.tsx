"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, PieChart, TrendingUp, DollarSign, Shield, Activity, Users, Lock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { DSCEngineABI } from '../../utils/DSCEngine';
import { DSCEngineAddress, DSCAddress } from '@/utils/addresses';
import { DSCABI } from '../../utils/DSCABI';
import Config from "@/rainbowKitConfig";
import { readContract } from '@wagmi/core'
import { formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import styles from '../stylings/Protocol.module.css';
import { getTotalProtocolCollateral } from './getTotalCollateral';
import { getTotalProtocolBurnedAmount } from './getTotalProtocolBurnedAmount ';

// --- TYPE DEFINITIONS ---
interface ProtocolStats {
    totalSupply: string;
    totalCollateralValue: string;
    totalBurned: string;
    collateralizationRatio: string;
}

interface ChartDataPoint {
    name: string;
    value: number;
    date?: string;
    color?: string; // For pie chart segments
}

// --- CONSTANTS ---
const SUPPORTED_TOKENS = [
    { symbol: 'WETH', name: 'Wrapped Ethereum', address: '0xdd13E55209Fd76AfE204dBda4007C227904f0a81', color: '#627EEA' },
    { symbol: 'LINK', name: 'Chainlink', address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', color: '#375BD2' }
];

// Sample data for charts
const SAMPLE_SUPPLY_DATA: ChartDataPoint[] = [
    { name: 'Jan', value: 1250000, date: '2024-01' },
    { name: 'Feb', value: 1800000, date: '2024-02' },
    { name: 'Mar', value: 2100000, date: '2024-03' },
    { name: 'Apr', value: 2450000, date: '2024-04' },
    { name: 'May', value: 2750000, date: '2024-05' },
    { name: 'Jun', value: 3200000, date: '2024-06' },
    { name: 'Jul', value: 3650000, date: '2024-07' }
];

const SAMPLE_COLLATERAL_DATA: ChartDataPoint[] = [
    { name: 'WETH', value: 65, color: '#627EEA' },
    { name: 'LINK', value: 35, color: '#375BD2' }
];

const COLORS = ['#627EEA', '#375BD2', '#00ffe7', '#0080ff'];

// --- MAIN COMPONENT ---
const Protocol: React.FC = () => {
    const account = useAccount();

    // State for live protocol data
    const [protocolStats, setProtocolStats] = useState<ProtocolStats>({
        totalSupply: 'lo3',
        totalCollateralValue: 'CALCULATING...',
        totalBurned: 'CALCULATING...',
        collateralizationRatio: '...'
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [supplyData, setSupplyData] = useState<ChartDataPoint[]>(SAMPLE_SUPPLY_DATA);
    const [collateralData, setCollateralData] = useState<ChartDataPoint[]>(SAMPLE_COLLATERAL_DATA);

    // --- DATA FETCHING ---
    const fetchProtocolData = useCallback(async () => {

        try {
            setIsLoading(true);

            const totalProtocolCollateralUSD = await getTotalProtocolCollateral();
            const totalCollateralFloat = parseFloat(totalProtocolCollateralUSD);
            const totalBurned = await getTotalProtocolBurnedAmount();


            const totalSupply = await readContract(Config, {
                abi: DSCABI,
                address: DSCAddress as `0x${string}`,
                functionName: 'totalSupply',
                args: []
            });

            const formattedSupply = formatUnits(totalSupply as bigint, 18);
            const supplyFloat = parseFloat(formattedSupply);

            const collateralizationRatio = supplyFloat > 0
                ? ((totalCollateralFloat / supplyFloat) * 100).toFixed(2)
                : '0.00';

            console.log('Total Supply:', formattedSupply);

            setProtocolStats({
                totalSupply: formattedSupply,
                totalCollateralValue: totalProtocolCollateralUSD,
                totalBurned: totalBurned,
                collateralizationRatio: collateralizationRatio
            });
        } catch (error) {
            console.error('Error fetching protocol data:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchProtocolData();
    }, [fetchProtocolData]);

    // --- UI HELPER FUNCTIONS ---
    const formatDisplayValue = (value: string, isUSD = false, isPercentage = false): string => {
        if (!value || value === '0') return isUSD ? '$0.00' : '0';
        const numValue = parseFloat(value);

        if (isPercentage) {
            return `${numValue.toFixed(1)}%`;
        }

        if (isUSD) {
            return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(2)}M`;
        }
        if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(2)}K`;
        }

        return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={styles.chartTooltip}>
                    <p className={styles.tooltipLabel}>{label}</p>
                    <p className={styles.tooltipValue}>
                        {`Supply: ${formatDisplayValue(payload[0].value.toString())} DSC`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // --- RENDER ---
    return (
        <div className={styles.protocolPage}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <h1 className={styles.title}>Protocol Overview</h1>
                <p className={styles.subtitle}>
                    Comprehensive statistics and insights into the DSC decentralized stablecoin protocol
                </p>
            </div>

            {/* Introduction Section */}
            <div className={styles.introSection}>
                <div className={styles.introCard}>
                    <div className={styles.introHeader}>
                        <Shield size={24} />
                        <h2>What is a Stablecoin?</h2>
                    </div>
                    <p className={styles.introText}>
                        Stablecoins are cryptocurrencies designed to maintain a stable value relative to a reference asset,
                        typically the US Dollar. They achieve this through various mechanisms including collateralization,
                        algorithmic control, or backing by traditional assets, providing the benefits of digital currency
                        while minimizing price volatility.
                    </p>
                </div>

                <div className={styles.introCard}>
                    <div className={styles.introHeader}>
                        <DollarSign size={24} />
                        <h2>DSC Protocol</h2>
                    </div>
                    <p className={styles.introText}>
                        DSC (Decentralized Stablecoin) is an over-collateralized, decentralized stablecoin backed by
                        cryptocurrency assets like WETH and LINK. Users deposit collateral to mint DSC tokens, maintaining
                        stability through liquidation mechanisms and requiring a minimum health factor to ensure solvency.
                    </p>
                </div>
            </div>

            {/* Protocol Stats Section */}
            <div className={styles.statsSection}>
                <h2 className={styles.sectionTitle}>Protocol Statistics</h2>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <DollarSign size={20} />
                            <span>Total DSC Supply</span>
                        </div>
                        <div className={styles.statValue}>
                            {formatDisplayValue(protocolStats.totalSupply)} DSC
                        </div>
                        <div className={styles.statDesc}>Circulating Supply</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <Lock size={20} />
                            <span>Total Collateral Value</span>
                        </div>
                        <div className={styles.statValue}>
                            {formatDisplayValue(protocolStats.totalCollateralValue, true)}
                        </div>
                        <div className={styles.statDesc}>USD Value Locked</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <TrendingUp size={20} />
                            <span>Collateralization Ratio</span>
                        </div>
                        <div className={styles.statValue}>
                            {formatDisplayValue(protocolStats.collateralizationRatio, false, true)}
                        </div>
                        <div className={styles.statDesc}>Average Ratio</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <Activity size={20} />
                            <span>Total Burned DSC</span>
                        </div>
                        <div className={styles.statValue}>
                            {formatDisplayValue(protocolStats.totalBurned)} DSC
                        </div>
                        <div className={styles.statDesc}>Lifetime Burns</div>
                    </div>
                </div>
            </div>

            {/* Data Visualization Section */}
            <div className={styles.chartsSection}>
                <h2 className={styles.sectionTitle}>Protocol Analytics</h2>

                <div className={styles.chartsGrid}>
                    {/* Supply Growth Chart */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <BarChart3 size={20} />
                            <h3>DSC Supply Growth</h3>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={supplyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#8892b0"
                                        fontSize={12}
                                    />
                                    <YAxis
                                        stroke="#8892b0"
                                        fontSize={12}
                                        tickFormatter={(value) => formatDisplayValue(value.toString())}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#00ffe7"
                                        strokeWidth={3}
                                        dot={{ fill: '#00ffe7', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#00ffe7', strokeWidth: 2, fill: '#0080ff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Collateral Composition Chart */}
                    <div className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <PieChart size={20} />
                            <h3>Collateral Composition</h3>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Tooltip
                                        formatter={(value: any) => [`${value}%`, 'Share']}
                                        labelStyle={{ color: '#fff' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Pie
                                        data={collateralData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}%`}
                                        labelLine={false}
                                    >
                                        {collateralData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={styles.legendContainer}>
                            {collateralData.map((entry, index) => (
                                <div key={entry.name} className={styles.legendItem}>
                                    <div
                                        className={styles.legendColor}
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    ></div>
                                    <span>{entry.name}: {entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Protocol Info */}
            <div className={styles.additionalInfo}>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <h4>Liquidation Threshold</h4>
                        <p>Positions with health factor below 1.0 are subject to liquidation to maintain protocol solvency.</p>
                    </div>
                    <div className={styles.infoItem}>
                        <h4>Supported Collateral</h4>
                        <p>Currently supports WETH and LINK as collateral assets with real-time price feeds from Chainlink oracles.</p>
                    </div>
                    <div className={styles.infoItem}>
                        <h4>Minimum Collateralization</h4>
                        <p>All positions must maintain a minimum 150% collateralization ratio to ensure stability and solvency.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Protocol;