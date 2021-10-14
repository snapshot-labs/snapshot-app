import { Linking, Platform } from "react-native";
import WalletConnect from "@walletconnect/client";
import SendIntentAndroid from "react-native-send-intent";
import {
  formatWalletServiceUrl,
  WalletService,
} from "@walletconnect/react-native-dapp";

export function setWalletConnectListeners(
  wcConnector: WalletConnect,
  androidAppUrl: string,
  walletService: WalletService
) {
  wcConnector.off("call_request_sent");
  wcConnector.on("call_request_sent", async (error) => {
    if (Platform.OS === "android") {
      if (androidAppUrl) {
        const createdUri = `wc:${wcConnector.handshakeTopic}@1`;
        SendIntentAndroid.openAppWithData(androidAppUrl, createdUri);
      }
    } else {
      const url = formatWalletServiceUrl(walletService);
      return (await Linking.canOpenURL(url)) && Linking.openURL(url);
    }
  });
}

export const initialWalletConnectValues = {
  bridge: "https://bridge.walletconnect.org",
  clientMeta: {
    description: "Snapshot Mobile App",
    url: "https://snapshot.org",
    icons: [
      "https://raw.githubusercontent.com/snapshot-labs/brand/master/avatar/avatar.png",
    ],
    name: "snapshot",
  },
  redirectUrl: "org.snapshot",
};

function formatProviderUrl(walletService: {
  mobile: { universal: string; native: string };
}) {
  const { mobile } = walletService;
  const { universal: universalLink, native: deepLink } = mobile;
  if (Platform.OS === "android") {
    return `${deepLink}`;
  }
  return `${universalLink}`;
}

export async function connectToWalletService(
  walletService: WalletService,
  uri: string
) {
  if (typeof uri !== "string" || !uri.length) {
    return Promise.reject(new Error("Invalid uri."));
  }
  const maybeRedirectUrl = `&redirectUrl=${encodeURIComponent(
    initialWalletConnectValues.redirectUrl
  )}`;
  const connectionUrl = `${formatWalletServiceUrl(
    walletService
  )}/wc?uri=${encodeURIComponent(uri)}${maybeRedirectUrl}`;
  if (await Linking.canOpenURL(connectionUrl)) {
    return await Linking.openURL(connectionUrl);
  }
  return Promise.reject(new Error("Unable to open url."));
}
