import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Proposal } from "types/proposal";
import { PROPOSALS_QUERY, USER_VOTES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import { useAuthState } from "context/authContext";
import { getStateFilters } from "constants/proposal";
import common from "styles/common";
import Button from "components/Button";
import uniqBy from "lodash/uniqBy";
import ProposalCard from "components/snapshot/ProposalCard";
import isEmpty from "lodash/isEmpty";
import i18n from "i18n-js";
import IconFont from "components/IconFont";
import { useNavigation } from "@react-navigation/native";
import differenceBy from "lodash/differenceBy";
import { ethers } from "ethers";
import { VOTE_SCREEN } from "constants/navigation";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
  useBottomSheetModalRef,
} from "context/bottomSheetModalContext";
import CastVoteModal from "components/snapshot/CastVoteModal";

const stateFilters = getStateFilters();
const LOAD_BY = 100;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  proposalsLeftContainer: {
    backgroundColor: "rgba(249, 187, 96, 0.3)",
    padding: 9,
    borderRadius: 8,
    marginLeft: 16,
  },
  proposalsLeftText: {
    fontFamily: "Calibre-Semibold",
    color: "rgba(247, 164, 38, 1)",
  },
  authorTitle: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
  closeButtonContainer: {
    marginLeft: "auto",
    marginRight: 16,
    padding: 4,
    height: 35,
    width: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    paddingBottom: 49,
    paddingTop: 16,
    borderTopWidth: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
});

async function getProposals(
  followedSpaces: any,
  setProposals: (proposals: Proposal[]) => void,
  setCurrentProposal: (proposal: any) => void,
  connectedAddress: string,
  setLoading: (loading: boolean) => void
) {
  setLoading(true);
  const checksumAddress = ethers.utils.getAddress(connectedAddress);
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: 0,
      space_in: followedSpaces.map((follow: any) => follow.space.id),
      state: stateFilters[1].key,
    },
  };
  const userVotesQuery = {
    query: USER_VOTES_QUERY,
    variables: {
      voter: checksumAddress,
    },
  };

  try {
    const result = await apolloClient.query(query);
    const proposals: any = uniqBy(get(result, "data.proposals", []), "id");
    const userVotesResult = await apolloClient.query(userVotesQuery);
    const proposalVotes = get(userVotesResult, "data.votes", []).map(
      (votedProposal) => {
        return votedProposal.proposal;
      }
    );
    const filteredProposals: any = differenceBy(proposals, proposalVotes, "id");

    const currentProposal = filteredProposals.shift();
    setProposals(filteredProposals);
    setCurrentProposal(currentProposal);
  } catch (e) {
    console.log(e);
  }
  setLoading(false);
}

function SnapShotScreen() {
  const { followedSpaces, colors, connectedAddress } = useAuthState();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<Proposal | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();
  const proposalsBackdrop =
    proposals.length >= 3
      ? new Array(3).fill(1)
      : new Array(proposals.length).fill(1);
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();

  useEffect(() => {
    if (followedSpaces.length > 0) {
      getProposals(
        followedSpaces,
        setProposals,
        setCurrentProposal,
        connectedAddress,
        setLoading
      );
    } else {
      setProposals([]);
      setCurrentProposal(undefined);
      setLoading(false);
    }
  }, [followedSpaces, connectedAddress]);

  return (
    <SafeAreaView
      style={[
        common.screen,
        {
          backgroundColor: colors.bgDefault,
        },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <View style={styles.proposalsLeftContainer}>
          <Text style={styles.proposalsLeftText}>
            {i18n.t("proposalsLeft", { count: proposals.length })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Feed");
          }}
          style={{ marginLeft: "auto" }}
        >
          <View
            style={[
              styles.closeButtonContainer,
              {
                borderColor: colors.borderColor,
              },
            ]}
          >
            <IconFont name={"close"} size={18} color={colors.textColor} />
          </View>
        </TouchableOpacity>
      </View>
      {isEmpty(currentProposal) ? (
        loading ? (
          <View
            style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
          >
            <ActivityIndicator color={colors.textColor} size="large" />
          </View>
        ) : (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 60,
            }}
          >
            <Text
              style={{
                fontFamily: "Calibre-Medium",
                fontSize: 22,
                color: colors.textColor,
                marginBottom: 24,
              }}
            >
              {followedSpaces.length > 0
                ? i18n.t("youHaveViewedAllTheLatestProposals")
                : i18n.t("youNeedToJoinSpace")}
            </Text>
            {followedSpaces.length > 0 && (
              <Button
                primary
                onPress={() => {
                  getProposals(
                    followedSpaces,
                    setProposals,
                    setCurrentProposal,
                    connectedAddress,
                    setLoading
                  );
                }}
                title={"View latest proposals again"}
              />
            )}
          </View>
        )
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ marginTop: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View>
                {proposalsBackdrop.map((c, i) => (
                  <View
                    key={i}
                    style={{
                      borderWidth: 1,
                      borderRadius: 16,
                      padding: 18,
                      position: "absolute",
                      marginTop: (i + 1) * -6,
                      width: `${100 - (i + 1) * 6}%`,
                      zIndex: -1 * (i + 1),
                      alignSelf: "center",
                      backgroundColor: colors.bgDefault,
                      borderColor: colors.borderColor,
                    }}
                  />
                ))}
                <View
                  style={{
                    zIndex: 10,
                    backgroundColor: colors.bgDefault,
                    borderRadius: 16,
                    paddingBottom: 150,
                  }}
                >
                  <ProposalCard proposal={currentProposal} />
                </View>
              </View>
            </ScrollView>
          </View>
          <View
            style={[
              styles.actionButtonsContainer,
              {
                borderTopColor: colors.borderColor,
                backgroundColor: colors.bgDefault,
              },
            ]}
          >
            <Button
              title={"Skip"}
              onPress={() => {
                const newCurrentProposal: Proposal | undefined =
                  proposals.shift();
                setCurrentProposal(newCurrentProposal);
              }}
              Icon={() => (
                <IconFont
                  name={"close"}
                  size={20}
                  color={colors.darkGray}
                  style={{ marginRight: 4 }}
                />
              )}
              buttonContainerStyle={{ width: 115 }}
            />
            <View style={{ width: 10, height: 10 }} />
            <Button
              title={i18n.t("vote")}
              onPress={() => {
                bottomSheetModalDispatch({
                  type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
                  payload: {
                    bottomSheetViewComponentProps: {
                      style: {
                        zIndex: 1000,
                      },
                    },
                    ModalContent: () => {
                      return (
                        <CastVoteModal
                          proposal={currentProposal}
                          space={currentProposal.space}
                          getProposal={() => {
                            const newCurrentProposal: Proposal | undefined =
                              proposals.shift();
                            setCurrentProposal(newCurrentProposal);
                          }}
                          navigation={navigation}
                        />
                      );
                    },
                    options: [],
                    snapPoints: [10, 500],
                    show: true,
                    icons: [],
                    initialIndex: 1,
                    destructiveButtonIndex: -1,
                  },
                });
              }}
              primary
              Icon={() => (
                <IconFont
                  name={"signature"}
                  size={20}
                  color={colors.white}
                  style={{ marginRight: 4 }}
                />
              )}
              buttonContainerStyle={{ width: 115 }}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default SnapShotScreen;
