import React, { useEffect } from "react";
import { View } from "react-native";
import apolloClient from "../util/apolloClient";
import { FOLLOWS_QUERY } from "../util/queries";
import { useWalletConnect } from "@walletconnect/react-native-dapp";

async function getFollows(accountId) {
  const query = {
    query: FOLLOWS_QUERY,
    variables: {
      follower_in: accountId,
    },
  };
  const result = await apolloClient.query(query);
  let followedSpaces = [];
  if (result && result.data && result.data.follows) {
    followedSpaces = result.data.follows.map((follow) => follow.space.id);
  }
}

function HomeScreen() {
  const connector = useWalletConnect();

  useEffect(() => {
    getFollows(connector.accounts[0]);
  }, []);
  return <View></View>;
}

export default HomeScreen;
