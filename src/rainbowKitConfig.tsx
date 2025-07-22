// What kind of chains we can connect to
// How to connect to our website

"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil, sepolia } from "wagmi/chains";

export default getDefaultConfig({
    appName: "Defi Stablecoin",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [anvil, sepolia],
    ssr: false,

})