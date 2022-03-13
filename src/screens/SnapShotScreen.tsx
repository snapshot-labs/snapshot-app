import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Proposal } from "types/proposal";
import moment from "moment-timezone";
import { PROPOSALS_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import get from "lodash/get";
import { useAuthState } from "context/authContext";
import { getStateFilters } from "constants/proposal";
import CardStack, { Card } from "react-native-card-stack-swiper";
import common from "styles/common";
import { SPACE_SCREEN, USER_PROFILE } from "constants/navigation";
import SpaceAvatar from "components/SpaceAvatar";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import { getUsername } from "helpers/profile";
import { useExploreState } from "context/exploreContext";
import Device from "helpers/device";
import BlockCastVote from "components/proposal/BlockCastVote";
import uniqBy from "lodash/uniqBy";

const { width, height } = Dimensions.get("screen");

const stateFilters = getStateFilters();
const LOAD_BY = 100;

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 5,
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    width,
    height,
  },
  authorTitle: {
    marginTop: Device.isIos() ? 6 : 0,
    marginBottom: Device.isIos() ? 4 : 0,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
  },
});

async function getProposals(
  followedSpaces: any,
  proposals: Proposal[],
  setProposals: (proposals: Proposal[]) => void
) {
  const sevenDaysAgo = parseInt(
    (moment().subtract(7, "days").valueOf() / 1e3).toFixed()
  );
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: 0,
      space_in: followedSpaces.map((follow: any) => follow.space.id),
      start_gt: sevenDaysAgo,
      end_gt: sevenDaysAgo,
      state: stateFilters[1].key,
    },
  };
  try {
    const result = await apolloClient.query(query);
    setProposals(uniqBy(get(result, "data.proposals", []), "id"));
  } catch (e) {
    console.log(e);
  }
}

function SnapShotScreen() {
  const { followedSpaces, colors, connectedAddress } = useAuthState();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { profiles, spaces } = useExploreState();
  const swiperRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    getProposals(followedSpaces, proposals, setProposals);
  }, [connectedAddress]);

  return (
    <SafeAreaView
      style={[
        common.screen,
        {
          backgroundColor: colors.bgDefault,
        },
      ]}
    >
      <CardStack
        style={styles.content}
        ref={swiperRef}
        renderNoMoreCards={() => {
          return (
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
                  fontSize: 16,
                  color: colors.textColor,
                }}
              >
                You have viewed all the latest proposals
              </Text>
            </View>
          );
        }}
      >
        {proposals.map((proposal, index: number) => {
          const authorProfile = profiles[proposal.author];
          const authorName = getUsername(
            proposal.author,
            authorProfile,
            connectedAddress ?? ""
          );

          return (
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: colors.bgDefault,
                  borderColor: colors.borderColor,
                },
              ]}
              key={`${index}`}
            >
              <ScrollView style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 16 }}>
                  <Text
                    style={[
                      common.h1,
                      {
                        marginBottom: 8,
                        marginTop: 16,
                        color: colors.textColor,
                      },
                    ]}
                  >
                    {proposal.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate(SPACE_SCREEN, {
                          space: proposal.space,
                          showHeader: true,
                        });
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <SpaceAvatar
                          symbolIndex="space"
                          size={28}
                          space={proposal.space}
                        />
                        <Text
                          style={[
                            styles.authorTitle,
                            {
                              color: colors.bgGray,
                              marginLeft: 8,
                            },
                          ]}
                        >
                          {proposal?.space?.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <Text
                      style={[styles.authorTitle, { color: colors.bgGray }]}
                    >
                      {" "}
                      {i18n.t("by")}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.push(USER_PROFILE, {
                          address: proposal?.author,
                        });
                      }}
                    >
                      <Text
                        style={[
                          styles.authorTitle,
                          {
                            color: colors.bgGray,
                          },
                        ]}
                      >
                        {" "}
                        {authorName}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, height: "100%" }}>
                    <BlockCastVote
                      proposal={proposal}
                      space={spaces[proposal.space.id]}
                      getProposal={() => {}}
                      voteButtonStyle={{ marginTop: 20, paddingHorizontal: 16 }}
                    />
                  </View>
                </View>
                <View style={{ width: 10, height: 30 }} />
              </ScrollView>
            </Card>
          );
        })}
      </CardStack>
    </SafeAreaView>
  );
}

export default SnapShotScreen;
