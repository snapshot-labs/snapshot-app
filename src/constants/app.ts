import { MAINNET, RINKEBY } from "constants/networks";

export default {
  IPFS_OVERRIDE_PARAM: "mm_override",
  IPFS_DEFAULT_GATEWAY_URL: "https://cloudflare-ipfs.com/ipfs/",
  IPNS_DEFAULT_GATEWAY_URL: "https://cloudflare-ipfs.com/ipns/",
  SWARM_DEFAULT_GATEWAY_URL: "https://swarm-gateways.net/bzz:/",
  supportedTLDs: ["eth", "xyz", "test"],
  MAX_PUSH_NOTIFICATION_PROMPT_TIMES: 2,
  CONNEXT: {
    HUB_EXCHANGE_CEILING_TOKEN: 69,
    MIN_DEPOSIT_ETH: 0.03,
    MAX_DEPOSIT_TOKEN: 30,
    BLOCKED_DEPOSIT_DURATION_MINUTES: 5,
    CONTRACTS: {
      4: "0x0Fa90eC3AC3245112c6955d8F9DD74Ec9D599996",
      1: "0xdfa6edAe2EC0cF1d4A60542422724A48195A5071",
    },
    SUPPORTED_NETWORKS: [MAINNET, RINKEBY],
  },
  MM_UNIVERSAL_LINK_HOST: "snapshot.app",
  MAX_SAFE_CHAIN_ID: 4503599627370476,
  URLS: {
    TERMS_AND_CONDITIONS: "https://consensys.net/terms-of-use/",
  },
  ERRORS: {
    INFURA_BLOCKED_MESSAGE:
      "EthQuery - RPC Error - This service is not available in your country",
  },
  GAS_OPTIONS: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
  },
  GAS_TIMES: {
    UNKNOWN: "unknown",
    MAYBE: "maybe",
    LIKELY: "likely",
    VERY_LIKELY: "very_likely",
    AT_LEAST: "at_least",
    LESS_THAN: "less_than",
    RANGE: "range",
  },
  ANONYMOUS_ADDRESS: "Anonymous",
};
