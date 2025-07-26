// lib/getTotalBurnedAmount.ts
import { createPublicClient, http, Log } from 'viem';
import { sepolia } from 'viem/chains';
import { DSCEngineAddress, DSCAddress } from '../../utils/addresses';
import { DSCEngineABI } from '../../utils/DSCEngine';
import { formatUnits } from 'viem/utils';

// Common Transfer-like event arguments
interface TransferArgs {
    from: `0x${string}`;
    to: `0x${string}`;
    value: bigint;
}

// Burned logs (Transfer to 0x0)
interface BurnLog extends Omit<Log, 'args'> {
    args: TransferArgs;
}

// Minted logs (Transfer from 0x0)
interface MintLog extends Omit<Log, 'args'> {
    args: TransferArgs;
}

export const getTotalProtocolBurnedAmount = async (): Promise<string> => {
    const client = createPublicClient({
        chain: sepolia,
        transport: http(),
    });

    try {
        const currentBlock = await client.getBlockNumber();
        const startBlock = BigInt(Math.max(0, Number(currentBlock) - 10000));
        const endBlock = currentBlock;
        const batchSize = BigInt(1000);

        let allLogs: BurnLog[] = [];

        for (let from = startBlock; from <= endBlock; from += batchSize + BigInt(1)) {
            const to = from + batchSize > endBlock ? endBlock : from + batchSize;

            try {
                const logs = await client.getLogs({
                    address: DSCAddress,
                    event: {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [
                            { name: 'from', type: 'address', indexed: true },
                            { name: 'to', type: 'address', indexed: true },
                            { name: 'value', type: 'uint256', indexed: false },
                        ],
                    },
                    args: {
                        to: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                    },
                    fromBlock: from,
                    toBlock: to,
                });

                allLogs = allLogs.concat(logs as BurnLog[]);
            } catch (error) {
                console.error(`Error fetching burn logs from ${from} to ${to}:`, error);
            }
        }

        let totalBurned = BigInt(0);
        for (const log of allLogs) {
            totalBurned += log.args.value;
        }

        return formatUnits(totalBurned, 18);
    } catch (error) {
        console.error('Error in getTotalProtocolBurnedAmount:', error);
        return '0';
    }
};

export const getTotalProtocolMintedAmount = async (): Promise<string> => {
    const client = createPublicClient({
        chain: sepolia,
        transport: http(),
    });

    try {
        const currentBlock = await client.getBlockNumber();
        const startBlock = BigInt(Math.max(0, Number(currentBlock) - 10000));
        const endBlock = currentBlock;
        const batchSize = BigInt(1000);

        let allLogs: MintLog[] = [];

        for (let from = startBlock; from <= endBlock; from += batchSize + BigInt(1)) {
            const to = from + batchSize > endBlock ? endBlock : from + batchSize;

            try {
                const logs = await client.getLogs({
                    address: DSCAddress,
                    event: {
                        type: 'event',
                        name: 'Transfer',
                        inputs: [
                            { name: 'from', type: 'address', indexed: true },
                            { name: 'to', type: 'address', indexed: true },
                            { name: 'value', type: 'uint256', indexed: false },
                        ],
                    },
                    args: {
                        from: '0x0000000000000000000000000000000000000000' as `0x${string}`,
                    },
                    fromBlock: from,
                    toBlock: to,
                });

                allLogs = allLogs.concat(logs as MintLog[]);
            } catch (error) {
                console.error(`Error fetching mint logs from ${from} to ${to}:`, error);
            }
        }

        let totalMinted = BigInt(0);
        for (const log of allLogs) {
            totalMinted += log.args.value;
        }

        return formatUnits(totalMinted, 18);
    } catch (error) {
        console.error('Error in getTotalProtocolMintedAmount:', error);
        return '0';
    }
};
