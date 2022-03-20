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
  Follow: [
    { name: "from", type: "address" },
    { name: "wallet", type: "string" },
  ],
};

export const walletUnfollowTypes = {
  Unfollow: [
    { name: "from", type: "address" },
    { name: "wallet", type: "string" },
  ],
};
