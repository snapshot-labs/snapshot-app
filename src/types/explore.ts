type Networks = {
  [key: string]: number;
};

export type Space = {
  followers: number;
  name: string;
  network: string;
  skin: string;
  avatar?: string;
  id?: string;
  private?: boolean;
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
