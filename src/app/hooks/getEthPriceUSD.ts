import { readContract } from '@wagmi/core';
import { Abi } from 'viem';
import Config from "@/rainbowKitConfig";

const aggregatorV3InterfaceABI: Abi = [
    {
        name: 'latestRoundData',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            { name: 'roundId', type: 'uint80' },
            { name: 'answer', type: 'int256' },
            { name: 'startedAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'answeredInRound', type: 'uint80' },
        ],
    },
];

const priceFeedAddress = '0x694AA1769357215DE4FAC081bf1f309aDC325306';

export async function getEthPrice(): Promise<number | null> {
    try {
        const result = await readContract(Config, {
            address: priceFeedAddress,
            abi: aggregatorV3InterfaceABI,
            functionName: 'latestRoundData',
        });

        const [, answer] = result as [bigint, bigint, bigint, bigint, bigint];
        return Number(answer) / 1e8;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
        return null;
    }
}