// Navbar.js
"use client";

import React, { useState } from 'react';
import styles from '../app/stylings/NavBar.module.css';
import { FaWallet, FaChartLine, FaHistory } from 'react-icons/fa';
import Link from 'next/link';
import path from 'path';


const navItems = [
    { name: 'Wallet', icon: <FaWallet />, key: 'wallet', ariaLabel: 'Wallet Page', path: '/' },
    { name: 'Protocol', icon: <FaChartLine />, key: 'protocol', ariaLabel: 'Protocol Page', path: '/protocol' },
    { name: 'History', icon: <FaHistory />, key: 'history', ariaLabel: 'History Page', path: '/history' },
];

export default function Navbar() {
    const [active, setActive] = useState('/');
    const [expanded, setExpanded] = useState(false);

    return (
        <nav
            className={`${styles.navbar} ${expanded ? styles.expanded : styles.collapsed}`}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
            role="navigation"
            aria-label="Main Navigation"
        >
            <ul className={styles.navList}>
                {navItems.map((item) => (
                    <Link
                        href={item.path}
                        className={styles.navLink}
                        key={item.key}
                    >
                        <li
                            key={item.key}
                            className={`${styles.navItem} ${active === item.key ? styles.active : ''}`}
                            onClick={() => setActive(item.key)}
                            aria-label={item.ariaLabel}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setActive(item.key)}
                        >

                            <span className={styles.icon}>{item.icon}</span>
                            {expanded && <span className={styles.label}>{item.name}</span>}

                        </li>
                    </Link>
                ))}
            </ul>
        </nav>
    );
}
