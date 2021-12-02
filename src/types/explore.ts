export type NetworkType = {
  chainId: number;
  explorer: string;
  key: string;
  multicall: string;
  name: string;
  network: string;
  rpc: string[];
  spaces: number;
  ws: string[];
};

export type Space = {
  followers: number;
  name: string;
  network: string;
  skin: string;
  avatar?: string;
  id?: string;
  private?: boolean;
  strategies: any;
  symbol?: string;
  validation?: any;
  filters?: any;
  terms?: string;
  plugins?: any;
  admins?: any;
  members?: any;
  categories: string[];
  voting: {
    delay: number,
    period: number
  }
};

type StrategyExample = {
  addresses: string[];
  name: string;
  network: string;
  snapshot: number;
  strategy: {
    name: string;
    params: {
      decimals: number;
      ghstQuickAddress: string;
      ghstUsdcAddress: string;
      stakingAddress: string;
      symbol: string;
      tokenAddress: string;
    };
  };
};

export type Strategy = {
  about: string;
  author: string;
  key: string;
  version: string;
  examples: StrategyExample[];
  spaces: number;
};
