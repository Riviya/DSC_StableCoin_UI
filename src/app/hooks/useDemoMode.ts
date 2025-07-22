"use client";

import { useState, useCallback, useEffect } from 'react';

export interface DemoModeState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
}

export const useDemoMode = (): DemoModeState => {
    const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo mode

    const toggleDemoMode = useCallback(() => {
        setIsDemoMode(prev => !prev);
    }, []);

    // Optional: Persist mode to localStorage (commented out since it's not supported in artifacts)
    // useEffect(() => {
    //   const savedMode = localStorage.getItem('dsc-demo-mode');
    //   if (savedMode !== null) {
    //     setIsDemoMode(savedMode === 'true');
    //   }
    // }, []);

    // useEffect(() => {
    //   localStorage.setItem('dsc-demo-mode', isDemoMode.toString());
    // }, [isDemoMode]);

    return {
        isDemoMode,
        toggleDemoMode,
    };
};