import React, { useCallback, useEffect, useState } from "react";
import { View, Text, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native-paper";
import { useAuthDispatch, useAuthState } from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import { ethers } from "ethers";
import { setProfiles } from "helpers/profile";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "context/exploreContext";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";
import VotedOnProposalPreview from "components/user/VotedOnProposalPreview";
import { USER_VOTES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import LogoutButton from "components/profile/LogoutButton";
import { getFollows } from "helpers/apiUtils";
import AccountsButton from "components/profile/AccountsButton";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";
import { useScrollManager } from "../hooks/useScrollManager";
import { TabRoute } from "components/tabBar/TabView";
import Scene from "components/tabBar/Scene";
import Device from "helpers/device";
import AnimatedHeader from "components/tabBar/AnimatedHeader";
import TabView from "components/tabBar/TabView";
import AnimatedTabBar from "components/tabBar/AnimatedTabBar";
import TabBarComponent from "components/tabBar/TabBar";
import ProfileScreenHeader from "components/profile/ProfileScreenHeader";
import { getSnapshotProfileAbout, getSnapshotUser } from "helpers/address";
import UserAbout from "components/user/UserAbout";

const headerHeight = Device.isIos() ? 390 : 300;

async function getVotedProposals(
  address: string,
  setVotedProposals: any,
  setLoadingVotedProposals: (loading: boolean) => void
) {
  setLoadingVotedProposals(true);
  try {
    const query = {
      query: USER_VOTES_QUERY,
      variables: {
        voter: address,
      },
    };

    const result = await apolloClient.query(query);
    const proposalVotes = get(result, "data.votes", []);

    setVotedProposals(proposalVotes);
  } catch (e) {
    setVotedProposals([]);
  } finally {
    setLoadingVotedProposals(false);
  }
}

function ProfileScreen() {
  const { colors, connectedAddress, savedWallets, followedSpaces } =
    useAuthState();
  const { profiles, snapshotUsers } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const authDispatch = useAuthDispatch();
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [loadingVotedProposals, setLoadingVotedProposals] = useState(false);
  const [votedProposals, setVotedProposals] = useState([]);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalShowRef = useBottomSheetModalShowRef();
  const tabs = [
    { key: "about", title: i18n.t("about") },
    { key: "activity", title: i18n.t("activity") },
  ];
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const about = getSnapshotProfileAbout(connectedAddress, snapshotUsers);

  useEffect(() => {
    getSnapshotUser(connectedAddress).then((user) => {
      if (user) {
        exploreDispatch({
          type: EXPLORE_ACTIONS.SET_SNAPSHOT_USERS,
          payload: {
            [connectedAddress.toLowerCase()]: user,
          },
        });
      }
    });
  }, [connectedAddress]);

  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "about") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={
              followedSpaces.length > 0 || about
                ? [{ key: "joinedSpaces" }]
                : []
            }
            listOffset={followedSpaces.length > 0 ? 190 : undefined}
            renderItem={() => {
              return (
                <View>
                  <JoinedSpacesScrollView
                    useLoader={loadingFollows}
                    followedSpaces={followedSpaces}
                  />
                  <UserAbout about={about} />
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={{ marginTop: 16, paddingHorizontal: 14 }}>
                {followedSpaces.length === 0 && (
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
                    {i18n.t("noSpacesJoined")}
                  </Text>
                )}
              </View>
            }
            {...sceneProps}
          />
        );
      } else if (tab.key === "activity") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={votedProposals}
            renderItem={(data: any) => {
              return (
                <VotedOnProposalPreview
                  proposal={data.item?.proposal}
                  space={data.item?.proposal?.space}
                  voter={data.item}
                />
              );
            }}
            ListEmptyComponent={
              loadingVotedProposals ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
                    {i18n.t("userHasNotVotedOnAnyProposal")}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              loadingVotedProposals ? (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 24,
                    padding: 24,
                  }}
                >
                  <ActivityIndicator color={colors.textColor} size="small" />
                </View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 100,
                    backgroundColor: colors.bgDefault,
                  }}
                />
              )
            }
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY, followedSpaces]
  );

  useEffect(() => {
    const backAction = () => {
      if (bottomSheetModalShowRef.current) {
        bottomSheetModalRef.current?.close();
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray: string[] = Object.keys(savedWallets);
    const filteredArray = addressArray.filter((address) => {
      return (
        !profilesArray.includes(address.toLowerCase()) &&
        ethers.utils.isAddress(address)
      );
    });

    if (filteredArray.length > 0) {
      setProfiles(filteredArray, exploreDispatch);
    }
    getVotedProposals(
      connectedAddress,
      setVotedProposals,
      setLoadingVotedProposals
    );
    getFollows(connectedAddress, authDispatch, setLoadingFollows);
  }, [connectedAddress]);

  return (
    <>
      <IPhoneTopSafeAreaViewBackground />
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View
          style={[
            common.containerHorizontalPadding,
            common.row,
            common.justifySpaceBetween,
            common.screenTitleContainer,
            { zIndex: 99, backgroundColor: colors.bgDefault },
          ]}
        >
          <Text style={[common.h1, { color: colors.textColor }]}>
            {i18n.t("profile")}
          </Text>
          <View style={common.row}>
            <AccountsButton />
            <View style={{ width: 6, height: 1 }} />
            <LogoutButton />
          </View>
        </View>
        <AnimatedHeader scrollY={scrollY} headerHeight={headerHeight}>
          <ProfileScreenHeader />
        </AnimatedHeader>
        <TabView
          index={index}
          setIndex={setIndex}
          width={Device.getDeviceWidth()}
          routes={tabs}
          renderTabBar={(p) => (
            <AnimatedTabBar scrollY={scrollY} headerHeight={headerHeight}>
              <TabBarComponent {...p} />
            </AnimatedTabBar>
          )}
          renderScene={renderScene}
        />
      </SafeAreaView>
    </>
  );
}

export default ProfileScreen;
