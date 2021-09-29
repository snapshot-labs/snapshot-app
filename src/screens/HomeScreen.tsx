import React, { useEffect, useState } from "react";
import { FlatList, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Fade,
  Placeholder,
  PlaceholderLine,
  PlaceholderMedia,
} from "rn-placeholder";
import get from "lodash/get";
import i18n from "i18n-js";
import apolloClient from "../util/apolloClient";
import { FOLLOWS_QUERY } from "../util/queries";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import { defaultHeaders } from "../util/apiUtils";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "../context/exploreContext";
import common from "../styles/common";
import SpacePreview from "../components/SpacePreview";
import { ContextDispatch } from "../types/context";
import DashboardHeader from "../components/dashboard/DashboardHeader";

const loadingElements = [1, 2, 3, 4];

async function getFollows(
  accountId: string | null,
  authDispatch: ContextDispatch,
  setLoading: (loading: boolean) => void
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
  setLoading(false);
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

async function getStrategies(exploreDispatch: ContextDispatch) {
  try {
    const options: { [key: string]: any } = {
      method: "get",
      headers: {
        ...defaultHeaders,
      },
    };
    const response = await fetch(
      "https://score.snapshot.org/api/strategies",
      options
    );
    const fullStrategies = await response.json();
    exploreDispatch({
      type: EXPLORE_ACTIONS.SET_FULL_STRATEGIES,
      payload: fullStrategies,
    });
  } catch (e) {}
}

function HomeScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const { followedSpaces, connectedAddress } = useAuthState();
  const { spaces } = useExploreState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getExplore(exploreDispatch);
    getFollows(connectedAddress, authDispatch, setLoading);
    getStrategies(exploreDispatch);
  }, []);

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      {loading ? (
        <>
          <DashboardHeader />
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            {loadingElements.map((loadingId) => (
              <Placeholder
                key={`${loadingId}`}
                Animation={Fade}
                Left={(props) => (
                  <PlaceholderMedia
                    isRound={true}
                    style={props.style}
                    size={50}
                  />
                )}
                style={{ justifyContent: "center", marginTop: 16 }}
              >
                <View style={{ marginTop: 6 }}>
                  <PlaceholderLine width={80} />
                  <PlaceholderLine width={80} />
                </View>
              </Placeholder>
            ))}
          </View>
        </>
      ) : (
        <FlatList
          data={followedSpaces}
          ListHeaderComponent={<DashboardHeader />}
          renderItem={(data) => {
            const currentSpace = data.item.space.id;
            const spaceData = Object.assign(
              get(spaces, currentSpace, {}),
              data.item.space
            );
            return <SpacePreview space={spaceData} />;
          }}
          onEndReachedThreshold={0.45}
          ListEmptyComponent={
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              <Text style={common.subTitle}>{i18n.t("noSpacesJoinedYet")}</Text>
            </View>
          }
          onEndReached={() => {}}
        />
      )}
    </View>
  );
}

export default HomeScreen;
