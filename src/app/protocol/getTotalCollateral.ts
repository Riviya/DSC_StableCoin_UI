// lib/getTotalCollateral.ts
import { createPublicClient, http, Log } from 'viem';
import { sepolia } from 'viem/chains';
import { DSCEngineAddress } from '../../utils/addresses';
import { DSCEngineABI } from '../../utils/DSCEngine';
import { formatUnits } from 'viem/utils';

// Define a typed interface for the event log args you expect
interface CollateralDepositedArgs {
    user: `0x${string}`;
    token: `0x${string}`;
    amount: bigint;
}

// Extend viem's Log to type args as CollateralDepositedArgs
interface CollateralDepositedLog extends Omit<Log, 'args'> {
    args: CollateralDepositedArgs;
}

// Create a public client to interact with Sepolia network
const client = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export const getTotalProtocolCollateral = async (): Promise<string> => {
    console.log('Starting getTotalProtocolCollateral...');
    console.log('DSCEngine Address:', DSCEngineAddress);

    try {
        const currentBlock = await client.getBlockNumber();
        console.log('Current block number:', currentBlock);

        // Try a more recent starting block - adjust this based on your contract deployment
        const startBlock = BigInt(Math.max(0, Number(currentBlock) - 10000)); // Last 10k blocks
        const endBlock = currentBlock;
        const batchSize = BigInt(1000); // Increase batch size

        console.log(`Searching from block ${startBlock} to ${endBlock}`);

        let allLogs: CollateralDepositedLog[] = [];
        let totalBatches = 0;

        // Fetch logs in batches
        for (let from = startBlock; from <= endBlock; from += batchSize + BigInt(1)) {
            const to = from + batchSize > endBlock ? endBlock : from + batchSize;
            totalBatches++;

            console.log(`Fetching batch ${totalBatches}: blocks ${from} to ${to}`);

            try {
                const logs = await client.getLogs({
                    address: DSCEngineAddress,
                    event: {
                        type: 'event',
                        name: 'CollateralDeposited',
                        inputs: [
                            { name: 'user', type: 'address', indexed: true },
                            { name: 'token', type: 'address', indexed: true },
                            { name: 'amount', type: 'uint256', indexed: false },
                        ],
                    },
                    fromBlock: from,
                    toBlock: to,
                });

                console.log(`Found ${logs.length} logs in batch ${totalBatches}`);

                // Cast logs to CollateralDepositedLog[]
                allLogs = allLogs.concat(logs as CollateralDepositedLog[]);

            } catch (error) {
                console.error(`Error fetching logs for blocks ${from}-${to}:`, error);
                // Continue with next batch
            }
        }

        console.log(`Total logs found: ${allLogs.length}`);

        if (allLogs.length === 0) {
            console.log('No CollateralDeposited events found. Possible issues:');
            console.log('1. Contract not deployed or no deposits made');
            console.log('2. Wrong contract address');
            console.log('3. Event name mismatch in ABI');
            console.log('4. Searching wrong block range');

            // Try to verify contract exists
            try {
                const code = await client.getBytecode({ address: DSCEngineAddress });
                console.log('Contract bytecode exists:', !!code);
            } catch (error) {
                console.log('Error checking contract bytecode:', error);
            }

            return '0';
        }

        // Log some sample events for debugging
        console.log('Sample events:', allLogs.slice(0, 3).map(log => ({
            user: log.args.user,
            token: log.args.token,
            amount: log.args.amount.toString()
        })));

        // Extract unique user addresses
        const uniqueAddresses = Array.from(
            new Set(allLogs.map((log) => log.args.user))
        );

        console.log(`Found ${uniqueAddresses.length} unique users`);

        // Accumulate collateral values for each unique user
        let totalCollateral = BigInt(0);

        for (const user of uniqueAddresses) {
            try {
                console.log(`Getting collateral for user: ${user}`);

                const value = await client.readContract({
                    address: DSCEngineAddress,
                    abi: DSCEngineABI,
                    functionName: 'getAccountCollateralValue',
                    args: [user],
                }) as bigint; // Type assertion since we know this function returns bigint

                console.log(`User ${user} collateral:`, value.toString());

                totalCollateral += value;
            } catch (error) {
                console.error(`Error getting collateral for user ${user}:`, error);
            }
        }

        console.log(`Total collateral (raw): ${totalCollateral.toString()}`);

        // Format and return collateral in human-readable format
        const formatted = formatUnits(totalCollateral, 18);
        console.log(`Total collateral (formatted): ${formatted}`);

        return formatted;

    } catch (error) {
        console.error('Error in getTotalProtocolCollateral:', error);
        return '0';
    }
};

// Alternative function to test event fetching without the complex logic
export const debugEventFetching = async () => {
    console.log('=== DEBUG: Testing basic event fetching ===');

    try {
        const currentBlock = await client.getBlockNumber();
        console.log('Current block:', currentBlock);

        // Test with a smaller, more recent range
        const fromBlock = BigInt(Math.max(0, Number(currentBlock) - 1000));
        const toBlock = currentBlock;

        console.log(`Testing range: ${fromBlock} to ${toBlock}`);

        const logs = await client.getLogs({
            address: DSCEngineAddress,
            fromBlock,
            toBlock,
            // Try without specifying the event first to see all events
        });

        console.log(`Found ${logs.length} total events from contract`);

        // Now try with the specific event
        const collateralLogs = await client.getLogs({
            address: DSCEngineAddress,
            event: {
                type: 'event',
                name: 'CollateralDeposited',
                inputs: [
                    { name: 'user', type: 'address', indexed: true },
                    { name: 'token', type: 'address', indexed: true },
                    { name: 'amount', type: 'uint256', indexed: false },
                ],
            },
            fromBlock,
            toBlock,
        });

        console.log(`Found ${collateralLogs.length} CollateralDeposited events`);

        return {
            totalEvents: logs.length,
            collateralEvents: collateralLogs.length,
            sampleEvents: logs.slice(0, 5)
        };

    } catch (error) {
        console.error('Debug error:', error);
        return null;
    }
};