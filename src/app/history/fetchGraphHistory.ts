import { gql, request } from 'graphql-request';
import { getEthPrice } from '../hooks/getEthPriceUSD'

const endpoint =
  'https://api.studio.thegraph.com/query/117195/dsc-protocol-subgraph/v0.0.1';

const getLatestTransactionsQuery = gql`
  {
    mints(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      amount
      timestamp
      transactionHash
      user {
        id
      }
    }

    burns(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      amount
      timestamp
      transactionHash
      user {
        id
      }
    }

    collateralDeposits(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      token
      amount
      timestamp
      transactionHash
      user {
        id
      }
    }

    collateralRedemptions(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
      token
      amount
      timestamp
      transactionHash
      user {
        id
      }
    }
  }
`;

type RawInteraction = {
  id: string;
  amount: string;
  token?: string;
  timestamp: string;
  transactionHash: string;
  user: {
    id: string;
  };
};

type GraphResponse = {
  mints: RawInteraction[];
  burns: RawInteraction[];
  collateralDeposits: RawInteraction[];
  collateralRedemptions: RawInteraction[];
};

export type Transaction = {
  hash: string;
  type: 'MINT' | 'BURN' | 'DEPOSIT' | 'REDEEM';
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'confirmed' | 'pending';
  tokenSymbol: string;
  usdValue: number;
  gasUsed: string;
  gasPrice: string;
};

export const fetchLatestProtocolTransactions = async (): Promise<Transaction[]> => {
  try {
    const data: GraphResponse = await request(endpoint, getLatestTransactionsQuery);

    const TOKEN_ADDRESS_TO_SYMBOL: Record<string, string> = {
      '0xdd13E55209Fd76AfE204dBda4007C227904f0a81': 'ETH',

    };




    const mapToTx = (
      txs: RawInteraction[],
      type: Transaction['type'],
      ethPriceUSD?: number | null
    ): Transaction[] => {
      return txs.map((tx) => {
        const amountETH = parseFloat(tx.amount || '0') / 1e18;
        const tokenAddress = tx.token?.toLowerCase();
        const tokenSymbol = tokenAddress
          ? TOKEN_ADDRESS_TO_SYMBOL[tokenAddress] || 'ETH'
          : 'DSC';

        return {
          hash: tx.transactionHash,
          type,
          from: tx.user.id,
          to: 'Protocol',
          value: amountETH.toFixed(4),
          timestamp: parseInt(tx.timestamp) * 1000,
          status: 'confirmed',
          tokenSymbol,
          usdValue:
            tokenSymbol === 'DSC'
              ? parseFloat(amountETH.toFixed(2)) // DSC is always $1 per token
              : ethPriceUSD
                ? parseFloat((amountETH * ethPriceUSD).toFixed(2))
                : 0,
          gasUsed: '0',
          gasPrice: '0',
        };
      });
    };



    const ethPriceUSD = await getEthPrice();

    const allTxs = [
      ...mapToTx(data.mints, 'MINT', ethPriceUSD),
      ...mapToTx(data.burns, 'BURN', ethPriceUSD),
      ...mapToTx(data.collateralDeposits, 'DEPOSIT', ethPriceUSD),
      ...mapToTx(data.collateralRedemptions, 'REDEEM', ethPriceUSD),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return allTxs.sort((a, b) => b.timestamp - a.timestamp); // newest first
  } catch (err) {
    console.error('Error fetching latest transactions:', err);
    return [];
  }
};
