import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import apolloClient from "../util/apolloClient";
import { FOLLOWS_QUERY } from "../util/queries";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import get from "lodash/get";
import { defaultHeaders } from "../util/apiUtils";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "../context/exploreContext";
import common from "../styles/common";
import SpacePreview from "../components/SpacePreview";

async function getFollows(accountId, authDispatch) {
  const query = {
    query: FOLLOWS_QUERY,
    variables: {
      follower_in: accountId,
    },
  };
  const result = await apolloClient.query(query);
  const followedSpaces = get(result, "data.follows", []);
  authDispatch({
    type: AUTH_ACTIONS.SET_FOLLOWED_SPACES,
    payload: followedSpaces,
  });
}

async function getExplore(exploreDispatch) {
  const options: { [key: string]: any } = {
    method: "get",
    headers: {
      ...defaultHeaders,
    },
  };
  const response = await fetch("https://hub.snapshot.org/api/explore", options);
  const explore = await response.json();
  exploreDispatch({
    type: EXPLORE_ACTIONS.SET_EXPLORE,
    payload: explore,
  });
}

function HomeScreen() {
  const { followedSpaces } = useAuthState();
  const { spaces } = useExploreState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const connector = useWalletConnect();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getExplore(exploreDispatch);
    getFollows(connector.accounts[0], authDispatch);
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <FlatList
        data={followedSpaces}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
            <Text style={common.headerTitle}>Dashboard</Text>
            <Text style={[common.subTitle, { marginTop: 16 }]}>My Spaces</Text>
          </View>
        }
        renderItem={(data) => {
          const currentSpace = data.item.space.id;
          const spaceData = Object.assign(
            get(spaces, currentSpace, {}),
            data.item.space
          );

          console.log({ spaceData });

          return <SpacePreview space={spaceData} />;
        }}
        onEndReachedThreshold={0.45}
        onEndReached={() => {}}
      />
    </View>
  );
}

export default HomeScreen;
