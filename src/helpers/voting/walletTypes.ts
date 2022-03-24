export interface WalletFollow {
  from?: string;
  wallet: string;
  timestamp?: number;
}

export interface WalletUnfollow {
  from?: string;
  wallet: string;
  timestamp?: number;
}

export const walletFollowTypes = {
  WalletFollow: [
    { name: "from", type: "address" },
    { name: "wallet", type: "string" },
  ],
};

export const walletUnfollowTypes = {
  WalletUnfollow: [
    { name: "from", type: "address" },
    { name: "wallet", type: "string" },
  ],
};
