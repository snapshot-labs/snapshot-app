import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import get from "lodash/get";
import apolloClient from "helpers/apolloClient";
import { FOLLOWS_QUERY } from "helpers/queries";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import common from "styles/common";
import { EXPLORE_ACTIONS, useExploreDispatch } from "context/exploreContext";
import { ContextDispatch } from "types/context";
import { defaultHeaders } from "helpers/apiUtils";
import TimelineFeed from "components/timeline/TimelineFeed";

async function getFollows(
  accountId: string | null | undefined,
  authDispatch: ContextDispatch
) {
  if (accountId) {
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
}

async function getExplore(exploreDispatch: ContextDispatch) {
  try {
    const options: { [key: string]: any } = {
      method: "get",
      headers: {
        ...defaultHeaders,
      },
    };
    const response = await fetch(
      "https://hub.snapshot.org/api/explore",
      options
    );
    const explore = await response.json();
    exploreDispatch({
      type: EXPLORE_ACTIONS.SET_EXPLORE,
      payload: explore,
    });
  } catch (e) {}
}

function FeedScreen() {
  const { colors, connectedAddress } = useAuthState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const insets = useSafeAreaInsets();
  const [isInitial, setIsInitial] = useState<boolean>(true);

  useEffect(() => {
    getExplore(exploreDispatch);
    getFollows(connectedAddress, authDispatch);
    setIsInitial(false);
  }, []);

  useEffect(() => {
    if (!isInitial) {
      getFollows(connectedAddress, authDispatch);
    }
  }, [connectedAddress]);

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <TimelineFeed />
    </View>
  );
}

export default FeedScreen;
