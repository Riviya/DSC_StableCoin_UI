"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react"
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import config from "@/rainbowKitConfig"
import { useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";


export function Providers(props: { children: ReactNode }) {

    const customTheme = lightTheme({
        accentColor: '#2520c8ff'

    });


    const [queryClient] = useState(() => new QueryClient());
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={customTheme}>
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}