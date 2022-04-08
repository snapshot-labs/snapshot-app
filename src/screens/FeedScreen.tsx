import React, { useEffect, useState } from "react";
import { Platform, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import get from "lodash/get";
import apolloClient from "helpers/apolloClient";
import { FOLLOWS_QUERY, USER_VOTES_QUERY } from "helpers/queries";
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
import { defaultHeaders, getSubscriptions } from "helpers/apiUtils";
import isEmpty from "lodash/isEmpty";
import reduce from "lodash/reduce";
import TimelineFeed from "components/timeline/TimelineFeed";
import * as Linking from "expo-linking";
import includes from "lodash/includes";
import { PROPOSAL_SCREEN, SPACE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { ethers } from "ethers";
import RNPusherPushNotifications from "react-native-pusher-push-notifications";
import Config from "react-native-config";
import Toast from "react-native-toast-message";
import Device from "helpers/device";
import { useToastShowConfig } from "constants/toast";
import { CUSTOM_WALLET_NAME } from "constants/wallets";

async function getFollows(
  accountId: string | null | undefined,
  authDispatch: ContextDispatch,
  setIsInitial: (isInitial: boolean) => void
) {
  try {
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
  } catch (e) {
    authDispatch({
      type: AUTH_ACTIONS.SET_FOLLOWED_SPACES,
      payload: [],
    });
  }
  setIsInitial(false);
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

async function getProposals(address: string, authDispatch: ContextDispatch) {
  try {
    const query = {
      query: USER_VOTES_QUERY,
      variables: {
        voter: address,
      },
    };

    const result = await apolloClient.query(query);
    const proposalVotes = get(result, "data.votes");
    const votedProposals = reduce(
      proposalVotes,
      (proposals: any, voteProposal) => {
        proposals[voteProposal?.proposal.id] = voteProposal;
        return proposals;
      },
      {}
    );
    authDispatch({
      type: AUTH_ACTIONS.SET_VOTED_PROPOSALS,
      payload: votedProposals,
    });
  } catch (e) {}
}

function FeedScreen() {
  const { colors, connectedAddress, savedWallets } = useAuthState();
  const { spaces } = useExploreState();
  const authDispatch = useAuthDispatch();
  const exploreDispatch = useExploreDispatch();
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const toastShowConfig = useToastShowConfig();

  const notificationsInit = (): void => {
    if (
      savedWallets[connectedAddress]?.name !== CUSTOM_WALLET_NAME &&
      !isEmpty(connectedAddress)
    ) {
      const checksumAddress = ethers.utils.getAddress(connectedAddress ?? "");

      RNPusherPushNotifications.setInstanceId(Config.PUSHER_APP_ID);
      RNPusherPushNotifications.on("notification", handleNotification);

      if (Device.isIos()) {
        RNPusherPushNotifications.setSubscriptions(
          [connectedAddress],
          (statusCode, response) => {
            console.log(statusCode, response);
            Toast.show({
              type: "customSuccess",
              text1: "SET SUB - " + JSON.stringify(response),
              ...toastShowConfig,
            });
          },
          () => {
            console.log("Success");
          }
        );
      }

      subscribe(checksumAddress);
    }
  };

  const subscribe = (interest: string): void => {
    console.log(`Subscribing to "${interest}"`);
    RNPusherPushNotifications.subscribe(
      interest,
      (statusCode, response) => {
        console.error(statusCode, response, connectedAddress);
      },
      () => {
        console.log(`CALLBACK: Subscribed to ${connectedAddress}`);
      }
    );
  };

  const handleNotification = (notification: any): void => {
    try {
      const spaceId = get(notification, "userInfo.data.spaceId", undefined);
      const proposalId = get(
        notification,
        "userInfo.data.proposalId",
        undefined
      );
      if (spaceId !== undefined && proposalId !== undefined) {
        navigation.replace(PROPOSAL_SCREEN, {
          proposalId,
          spaceId,
        });
      }
    } catch (e) {}
  };

  function navigateToScreen(url: string) {
    if (includes(url, "snapshot.org")) {
      const splitUrl = url.split("#");
      if (splitUrl?.length === 2) {
        if (includes(splitUrl[1], "proposal")) {
          const splitUrlProposal = splitUrl[1].split("/");
          if (splitUrlProposal.length >= 4) {
            const spaceId = splitUrlProposal[1];
            const proposalId = splitUrlProposal[3];
            navigation.replace(PROPOSAL_SCREEN, {
              proposalId,
              spaceId,
            });
          }
        } else {
          const splitUrlSpace = splitUrl[1].split("/");
          const spaceId = splitUrlSpace[1]?.replace(/\//g, "");
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
  }

  useEffect(() => {
    Linking.getInitialURL().then((url: string | null) => {
      navigateToScreen(url ?? "");
    });
    Linking.addEventListener("url", (event) => {
      navigateToScreen(event?.url);
    });
    getExplore(exploreDispatch);
    getSubscriptions(connectedAddress ?? "", authDispatch);
    getFollows(connectedAddress, authDispatch, setIsInitial);
    notificationsInit();
  }, []);

  useEffect(() => {
    if (!isInitial && !isEmpty(connectedAddress)) {
      getFollows(connectedAddress, authDispatch, setIsInitial);
      getSubscriptions(connectedAddress, authDispatch);
      getProposals(connectedAddress, authDispatch);
    }
  }, [connectedAddress]);

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <TimelineFeed feedScreenIsInitial={isInitial} />
    </View>
  );
}

export default FeedScreen;
