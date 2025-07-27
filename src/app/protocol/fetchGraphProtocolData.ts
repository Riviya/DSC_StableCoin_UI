import { request, gql } from 'graphql-request';

const endpoint = 'https://api.studio.thegraph.com/query/117195/dsc-protocol-subgraph/v0.0.1';

// --- GraphQL Query to fetch multiple months by ID ---
const getMonthlyStatsQuery = (monthIds: string[]) => gql`
  {
    protocolStats(id: "1") {
      totalCollateral
      totalBurnVolume
      totalMintVolume
      totalNetMinted
    }
    ${monthIds.map((monthId, index) => `
      month${index}: monthlyStats(id: "${monthId}") {
        id
        mintVolume
        burnVolume
        netMintVolume
        timestamp
      }
    `).join('')}
  }
`;

// Alternative: Single query for current month (like your original)
const query = gql`
  {
    protocolStats(id: "1") {
      totalCollateral
      totalBurnVolume
      totalMintVolume
      totalNetMinted
    }
    monthlyStats(id: "2025-07") {
      mintVolume
      burnVolume
      netMintVolume
      timestamp
    }
  }
`;

// --- Type Definitions ---
type ProtocolStats = {
  totalCollateral: string;
  totalBurnVolume: string;
  totalMintVolume: string;
  totalNetMinted: string;
};

type MonthlyStats = {
  id?: string;
  mintVolume: string;
  burnVolume: string;
  netMintVolume: string;
  timestamp: string;
};

type GraphQLResponse = {
  protocolStats: ProtocolStats;
  monthlyStats: MonthlyStats | null;
};

type MultiMonthResponse = {
  protocolStats: ProtocolStats;
  [key: string]: MonthlyStats | ProtocolStats; // For dynamic month keys like month0, month1, etc.
};

type ChartDataPoint = {
  name: string;
  value: number;
  date: string;
};

// --- Data Fetching Function ---
export const fetchGraphProtocolData = async (): Promise<GraphQLResponse | null> => {
  try {
    const data: GraphQLResponse = await request(endpoint, query);
    return data;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    return null;
  }
};

// --- Helper function to generate month IDs ---
const generateMonthIds = (months: number = 7): string[] => {
  const monthIds: string[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthIds.push(monthId);
  }

  return monthIds;
};

// --- Helper function to convert month ID to abbreviated name ---
const getMonthNameFromId = (monthId: string): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [_, monthStr] = monthId.split('-');
  const monthNum = parseInt(monthStr);
  return months[monthNum - 1] || 'Unknown';
};

// --- Data Fetching Function for Multiple Months ---
export const fetchMultipleMonthsData = async (monthIds: string[]): Promise<MultiMonthResponse | null> => {
  try {
    const query = getMonthlyStatsQuery(monthIds);
    const data: MultiMonthResponse = await request(endpoint, query);
    return data;
  } catch (error) {
    console.error('GraphQL fetch error:', error);
    return null;
  }
};

// --- Function to transform multi-month GraphQL data to chart format ---
export const transformMultiMonthToChartData = (
  data: MultiMonthResponse,
  monthIds: string[],
  dataType: 'mintVolume' | 'burnVolume' | 'netMintVolume' = 'netMintVolume'
): ChartDataPoint[] => {
  const chartData: ChartDataPoint[] = [];

  monthIds.forEach((monthId, index) => {
    const monthData = data[`month${index}`] as MonthlyStats;
    if (monthData) {
      chartData.push({
        name: getMonthNameFromId(monthId),
        value: parseInt(monthData[dataType]) / 1e18, // Convert from wei to tokens
        date: monthId
      });
    }
  });

  return chartData;
};

// --- Main function to get chart-ready data ---
export const getSupplyChartData = async (
  dataType: 'mintVolume' | 'burnVolume' | 'netMintVolume' = 'netMintVolume',
  months: number = 7
): Promise<ChartDataPoint[]> => {
  const monthIds = generateMonthIds(months);
  const data = await fetchMultipleMonthsData(monthIds);

  if (!data) {
    console.warn('No data available, using empty array');
    return [];
  }

  return transformMultiMonthToChartData(data, monthIds, dataType);
};

// --- Usage example ---
export const useChartData = async () => {
  // Replace your SAMPLE_SUPPLY_DATA with this:
  const supplyData = await getSupplyChartData('netMintVolume');

  // Or get different metrics:
  const mintData = await getSupplyChartData('mintVolume');
  const burnData = await getSupplyChartData('burnVolume');

  return { supplyData, mintData, burnData };
};