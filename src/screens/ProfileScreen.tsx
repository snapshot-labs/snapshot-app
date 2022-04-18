import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthDispatch, useAuthState } from "context/authContext";
import common from "styles/common";
import i18n from "i18n-js";
import ActiveAccount from "components/ActiveAccount";
import { ethers } from "ethers";
import { setProfiles } from "helpers/profile";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { Tabs } from "react-native-collapsible-tab-view";
import JoinedSpacesScrollView from "components/timeline/JoinedSpacesScrollView";
import VotedOnProposalPreview from "components/user/VotedOnProposalPreview";
import { USER_VOTES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import BaseTabBar from "components/tabBar/BaseTabBar";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import LogoutButton from "components/profile/LogoutButton";
import { getFollows } from "helpers/apiUtils";
import Button from "components/Button";
import IconFont from "components/IconFont";
import { SETTINGS_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import AccountsButton from "components/profile/AccountsButton";
import FollowSection from "components/user/FollowSection";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";

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
  const { colors, connectedAddress, savedWallets } = useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const authDispatch = useAuthDispatch();
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [loadingVotedProposals, setLoadingVotedProposals] = useState(false);
  const [votedProposals, setVotedProposals] = useState([]);
  const navigation: any = useNavigation();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalShowRef = useBottomSheetModalShowRef();

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
        <Tabs.Container
          headerContainerStyle={[
            common.tabBarContainer,
            { borderBottomColor: colors.borderColor },
          ]}
          renderHeader={() => {
            return (
              <View
                style={[
                  common.justifyCenter,
                  common.alignItemsCenter,
                  { backgroundColor: colors.bgDefault },
                ]}
              >
                <ActiveAccount address={connectedAddress} />
                <FollowSection
                  followAddress={connectedAddress}
                  votesCount={votedProposals.length}
                />
                <View style={{ marginTop: 16 }}>
                  <Button
                    onPress={() => {
                      navigation.navigate(SETTINGS_SCREEN);
                    }}
                    title={i18n.t("settings")}
                    buttonTitleStyle={{
                      textTransform: "uppercase",
                      fontSize: 14,
                    }}
                    Icon={() => (
                      <IconFont
                        name={"gear"}
                        size={22}
                        color={colors.textColor}
                      />
                    )}
                    buttonContainerStyle={{
                      width: 173,
                      paddingVertical: 9,
                    }}
                  />
                </View>
              </View>
            );
          }}
          renderTabBar={(props) => {
            return <BaseTabBar {...props} />;
          }}
        >
          <Tabs.Tab name="about">
            <Tabs.ScrollView>
              <JoinedSpacesScrollView useLoader={loadingFollows} />
            </Tabs.ScrollView>
          </Tabs.Tab>
          <Tabs.Tab name="activity">
            <Tabs.FlatList
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
                    <Text
                      style={[common.subTitle, { color: colors.textColor }]}
                    >
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
                    <ActivityIndicator color={colors.textColor} size="large" />
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
            />
          </Tabs.Tab>
        </Tabs.Container>
      </SafeAreaView>
    </>
  );
}

export default ProfileScreen;
