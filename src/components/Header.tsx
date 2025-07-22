"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import styles from "../app/stylings/Header.module.css";

interface HeaderProps {
    isDemoMode?: boolean;
    account?: {
        address?: string;
        isConnected: boolean;
        status?: 'connected' | 'disconnected' | 'reconnecting';
    };
    connectMockWallet?: () => void;
    disconnectMockWallet?: () => void;
}

export default function Header({
    isDemoMode = false,
    account,
    connectMockWallet,
    disconnectMockWallet
}: HeaderProps) {
    return (
        <nav className={`h-30 px-6 mx-4 mt-4 border border-zinc-700 text-white shadow-lg flex justify-between items-center sticky top-4 z-50 rounded-4xl ${styles.customHeader}`}>
            {/* Left section */}
            <div className="flex items-center gap-4 md:gap-6">
                <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>D</div>
                        <div className={styles.logoText}>
                            <div className={styles.logoTitle}>DSC Engine</div>
                            <div className={styles.logoSubtitle}>Decentralized Stablecoin</div>
                        </div>
                    </div>
                </a>
                <a
                    href="https://github.com/Riviya?tab=repositories"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700 cursor-pointer hidden md:block"
                >
                    <FaGithub className="h-5 w-5 text-white" />
                </a>
            </div>

            {/* Middle section */}
            <h3 className="italic text-sm lg:text-base text-zinc-400 hidden lg:block max-w-md text-center">
                Learn DeFi & Mint Stablecoins - Interactive Demo Platform.
            </h3>

            {/* Right section */}
            <div className="flex items-center gap-4">
                {!isDemoMode ? (
                    <ConnectButton />
                ) : account?.isConnected ? (
                    <button
                        onClick={disconnectMockWallet}
                        className="bg-red-600 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Disconnect Demo
                    </button>
                ) : (
                    <button
                        onClick={connectMockWallet}
                        className="bg-blue-600 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Connect Demo
                    </button>
                )}
            </div>
        </nav>
    );
}