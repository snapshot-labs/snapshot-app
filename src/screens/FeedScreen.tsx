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
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "context/exploreContext";
import { ContextDispatch } from "types/context";
import { defaultHeaders } from "helpers/apiUtils";
import isEmpty from "lodash/isEmpty";
import TimelineFeed from "components/timeline/TimelineFeed";
import * as Linking from "expo-linking";
import includes from "lodash/includes";
import { SPACE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";

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
  const { spaces } = useExploreState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const [isInitial, setIsInitial] = useState<boolean>(true);

  function navigateToSpaceScreen(url: string) {
    if (includes(url, "snapshot.org")) {
      const splitUrl = url.split("#");
      if (splitUrl?.length === 2) {
        const spaceId = splitUrl[1]?.replace(/\//g, "");
        const spaceDetails = spaces[spaceId] ?? {};
        if (!isEmpty(spaceId)) {
          navigation.navigate(SPACE_SCREEN, {
            space: {
              id: spaceId,
              ...spaceDetails,
            },
          });
        }
      }
    }
  }

  useEffect(() => {
    Linking.getInitialURL().then((url: string | null) => {
      navigateToSpaceScreen(url ?? "");
    });
    Linking.addEventListener("url", (event) => {
      navigateToSpaceScreen(event?.url);
    });
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
