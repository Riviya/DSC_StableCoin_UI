"use client";

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    Clock,
    Filter,
    Search,
    Calendar,
    Download,
    ExternalLink,
    User,
    Activity,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';
import styles from '../stylings/History.module.css';
import { fetchLatestProtocolTransactions, Transaction } from './fetchGraphHistory'

interface FilterState {
    showMyTransactions: boolean;
    selectedTypes: string[];
    searchQuery: string;
    dateRange: {
        start: string;
        end: string;
    };
}

const TRANSACTION_TYPES = [
    { value: 'MINT', label: 'Mint', icon: '💸', color: '#1e8434ff' },
    { value: 'BURN', label: 'Burn', icon: '🔥', color: '#1e8434ff' },
    { value: 'DEPOSIT', label: 'Deposit', icon: '🏦', color: '#1e8434ff' },
    { value: 'REDEEM', label: 'Redeem', icon: '🔄', color: '#1e8434ff' },
    { value: 'SWAP', label: 'Swap', icon: '↔️', color: '#1e8434ff' }
];

const TransactionSkeleton: React.FC = () => (
    <div className={styles.transactionRow}>
        <div className={styles.transactionContent}>
            <div className={styles.transactionMain}>
                <div className={`${styles.skeletonBox} ${styles.skeletonIcon}`}></div>
                <div className={styles.transactionDetails}>
                    <div className={`${styles.skeletonBox} ${styles.skeletonText}`}></div>
                    <div className={`${styles.skeletonBox} ${styles.skeletonTextSmall}`}></div>
                </div>
            </div>
            <div className={styles.transactionMeta}>
                <div className={`${styles.skeletonBox} ${styles.skeletonValue}`}></div>
                <div className={`${styles.skeletonBox} ${styles.skeletonTime}`}></div>
            </div>
        </div>
    </div>
);

const TransactionHistory: React.FC = () => {
    const account = useAccount();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [filters, setFilters] = useState<FilterState>({
        showMyTransactions: false,
        selectedTypes: [],
        searchQuery: '',
        dateRange: {
            start: '',
            end: ''
        }
    });

    const ITEMS_PER_PAGE = 10;

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const latestTxs = await fetchLatestProtocolTransactions();
            setTransactions(latestTxs);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        if (filters.showMyTransactions && account.address) {
            filtered = filtered.filter(tx =>
                tx.from.toLowerCase() === account.address?.toLowerCase() ||
                tx.to.toLowerCase() === account.address?.toLowerCase()
            );
        }

        if (filters.selectedTypes.length > 0) {
            filtered = filtered.filter(tx => filters.selectedTypes.includes(tx.type));
        }

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(tx =>
                tx.hash.toLowerCase().includes(query) ||
                tx.from.toLowerCase().includes(query) ||
                tx.to.toLowerCase().includes(query)
            );
        }

        if (filters.dateRange.start && filters.dateRange.end) {
            const startDate = new Date(filters.dateRange.start).getTime();
            const endDate = new Date(filters.dateRange.end).getTime();
            filtered = filtered.filter(tx =>
                tx.timestamp >= startDate && tx.timestamp <= endDate
            );
        }

        return filtered;
    }, [transactions, filters, account.address]);

    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredTransactions.slice(start, end);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const truncateHash = (hash: string): string => {
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    const formatValue = (value: string, symbol?: string): string => {
        const numValue = parseFloat(value);
        if (numValue >= 1000000) {
            return `${(numValue / 1000000).toFixed(2)}M ${symbol || ''}`;
        }
        if (numValue >= 1000) {
            return `${(numValue / 1000).toFixed(2)}K ${symbol || ''}`;
        }
        return `${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol || ''}`;
    };

    const getTransactionConfig = (type: string) => {
        return TRANSACTION_TYPES.find(t => t.value === type) || TRANSACTION_TYPES[0];
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle size={16} className={styles.statusConfirmed} />;
            case 'pending':
                return <Loader size={16} className={styles.statusPending} />;
            case 'failed':
                return <AlertCircle size={16} className={styles.statusFailed} />;
            default:
                return null;
        }
    };

    const handleFilterChange = (key: keyof FilterState, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setCurrentPage(1);
    };

    const handleTypeFilter = (type: string) => {
        const isSelected = filters.selectedTypes.includes(type);
        const newTypes = isSelected
            ? filters.selectedTypes.filter(t => t !== type)
            : [...filters.selectedTypes, type];

        handleFilterChange('selectedTypes', newTypes);
    };

    const exportToCSV = () => {
        const csvHeaders = ['Hash', 'Type', 'From', 'To', 'Value', 'USD Value', 'Status', 'Timestamp'];
        const csvData = filteredTransactions.map(tx => [
            tx.hash,
            tx.type,
            tx.from,
            tx.to,
            `${tx.value} ${tx.tokenSymbol || ''}`,
            `$${tx.usdValue?.toFixed(2) || '0.00'}`,
            tx.status,
            new Date(tx.timestamp).toLocaleString()
        ]);

        const csvContent = [csvHeaders, ...csvData]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transaction-history.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.transactionPage}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Transaction History</h1>
                <p className={styles.subtitle}>
                    Complete overview of all protocol transactions with advanced filtering and analytics
                </p>
            </div>

            <div className={styles.filtersSection}>
                <div className={styles.filtersContainer}>
                    <div className={styles.filterGroup}>
                        <label className={styles.toggleContainer}>
                            <input
                                type="checkbox"
                                checked={filters.showMyTransactions}
                                onChange={(e) => handleFilterChange('showMyTransactions', e.target.checked)}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSlider}></span>
                            <span className={styles.toggleLabel}>
                                <User size={16} />
                                My Transactions
                            </span>
                        </label>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <Filter size={16} />
                            Transaction Types
                        </label>
                        <div className={styles.typeFilters}>
                            {TRANSACTION_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    onClick={() => handleTypeFilter(type.value)}
                                    className={`${styles.typeFilterBtn} ${filters.selectedTypes.includes(type.value) ? styles.active : ''
                                        }`}
                                    style={{
                                        '--type-color': type.color
                                    } as React.CSSProperties}
                                >
                                    <span className={styles.typeIcon}>{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <Search size={16} />
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by hash or address..."
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>
                            <Calendar size={16} />
                            Date Range
                        </label>
                        <div className={styles.dateRange}>
                            <input
                                type="date"
                                value={filters.dateRange.start}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...filters.dateRange,
                                    start: e.target.value
                                })}
                                className={styles.dateInput}
                            />
                            <span className={styles.dateSeparator}>to</span>
                            <input
                                type="date"
                                value={filters.dateRange.end}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...filters.dateRange,
                                    end: e.target.value
                                })}
                                className={styles.dateInput}
                            />
                        </div>
                    </div>

                    <div className={styles.filterActions}>
                        <button
                            onClick={fetchTransactions}
                            className={styles.refreshBtn}
                            disabled={isLoading}
                        >
                            <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={exportToCSV}
                            className={styles.exportBtn}
                            disabled={filteredTransactions.length === 0}
                        >
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <Activity size={20} />
                            <span>Total Transactions</span>
                        </div>
                        <div className={styles.statValue}>
                            {filteredTransactions.length.toLocaleString()}
                        </div>
                        <div className={styles.statDesc}>Filtered Results</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <TrendingUp size={20} />
                            <span>Total Volume</span>
                        </div>
                        <div className={styles.statValue}>
                            ${filteredTransactions.reduce((sum, tx) => sum + (tx.usdValue || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={styles.statDesc}>USD Value</div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <Clock size={20} />
                            <span>Latest Transaction</span>
                        </div>
                        <div className={styles.statValue}>
                            {filteredTransactions.length > 0
                                ? formatDistanceToNow(filteredTransactions[0]?.timestamp || Date.now(), { addSuffix: true })
                                : 'No transactions'
                            }
                        </div>
                        <div className={styles.statDesc}>Most Recent</div>
                    </div>
                </div>
            </div>

            <div className={styles.transactionsSection}>
                <div className={styles.transactionsContainer}>
                    <div className={styles.transactionsHeader}>
                        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
                        <div className={styles.resultsCount}>
                            Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                        </div>
                    </div>

                    <div className={styles.transactionsList}>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, index) => (
                                <TransactionSkeleton key={`skeleton-${index}`} />
                            ))
                        ) : paginatedTransactions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Activity size={48} className={styles.emptyIcon} />
                                <h3>No transactions found</h3>
                                <p>Try adjusting your filters to see more results</p>
                            </div>
                        ) : (
                            paginatedTransactions.map((transaction) => {
                                const config = getTransactionConfig(transaction.type);
                                const isUserTransaction = account.address && (
                                    transaction.from.toLowerCase() === account.address.toLowerCase() ||
                                    transaction.to.toLowerCase() === account.address.toLowerCase()
                                );
                                const isOutgoing = account.address &&
                                    transaction.from.toLowerCase() === account.address.toLowerCase();

                                return (
                                    <div
                                        key={`${transaction.hash}-${transaction.timestamp}`}
                                        className={`${styles.transactionRow} ${isUserTransaction ? styles.userTransaction : ''}`}
                                    >
                                        <div className={styles.transactionContent}>
                                            <div className={styles.transactionMain}>
                                                <div
                                                    className={styles.transactionIcon}
                                                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                                                >
                                                    <span className={styles.typeEmoji}>{config.icon}</span>
                                                </div>

                                                <div className={styles.transactionDetails}>
                                                    <div className={styles.transactionType}>
                                                        <span className={styles.typeName}>{config.label}</span>
                                                        {getStatusIcon(transaction.status)}
                                                        {isUserTransaction && (
                                                            <span className={`${styles.direction} ${isOutgoing ? styles.outgoing : styles.incoming}`}>
                                                                {isOutgoing ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                                                {isOutgoing ? 'OUT' : 'IN'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={styles.transactionHash}>
                                                        <a
                                                            href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.hashLink}
                                                        >
                                                            {truncateHash(transaction.hash)}
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    </div>

                                                    <div className={styles.transactionAddresses}>
                                                        <span className={styles.addressLabel}>From:</span>
                                                        <span className={styles.address}>{truncateHash(transaction.from)}</span>
                                                        <span className={styles.addressLabel}>To:</span>
                                                        <span className={styles.address}>{truncateHash(transaction.to)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.transactionMeta}>
                                                <div className={styles.transactionValue}>
                                                    <div className={styles.primaryValue}>
                                                        {formatValue(transaction.value, transaction.tokenSymbol)}
                                                    </div>
                                                    <div className={styles.usdValue}>
                                                        ${transaction.usdValue?.toFixed(2) || '0.00'}
                                                    </div>
                                                </div>

                                                <div className={styles.transactionTime}>
                                                    <Clock size={14} />
                                                    {formatDistanceToNow(transaction.timestamp, { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={styles.paginationBtn}
                            >
                                Previous
                            </button>

                            <div className={styles.paginationInfo}>
                                Page {currentPage} of {totalPages}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={styles.paginationBtn}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;