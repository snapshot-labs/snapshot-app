import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import { Proposal } from "types/proposal";
import isEmpty from "lodash/isEmpty";
import { useNavigation } from "@react-navigation/core";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUsername } from "helpers/profile";
import { Space } from "types/explore";
import apolloClient from "helpers/apolloClient";
import { PROPOSAL_VOTES_QUERY } from "helpers/queries";
import get from "lodash/get";
import common from "styles/common";
import BackButton from "components/BackButton";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import i18n from "i18n-js";
import MarkdownBody from "components/proposal/MarkdownBody";
import BlockResults from "components/proposal/BlockResults";
import BlockVotes from "components/proposal/BlockVotes";
import BlockInformation from "components/proposal/BlockInformation";
import { getResults } from "helpers/snapshot";
import { SPACE_SCREEN, USER_PROFILE } from "constants/navigation";
import SpaceAvatar from "components/SpaceAvatar";

const styles = StyleSheet.create({
  proposalTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 28,
    lineHeight: 28,
  },
  proposalHeader: {
    paddingHorizontal: 14,
  },
  authorTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
  },
});

interface ProposalScreenProps {
  route: {
    params: {
      proposal: Proposal;
      spaceId?: string;
      proposalId?: string;
    };
  };
}

function getSpace(
  spaces: { [spaceId: string]: Space },
  proposal: Proposal,
  routeSpaceId?: string
): Space | {} {
  if (proposal?.space || routeSpaceId) {
    const spaceId = proposal?.space?.id ?? routeSpaceId;
    const space = spaces[spaceId] ?? {};
    return {
      id: spaceId,
      ...space,
    };
  }

  return {};
}

async function getProposal(
  proposal: Proposal,
  setProposal: (proposal: Proposal) => void,
  setLoaded: (loaded: boolean) => void,
  setVotes: (votes: any) => void,
  setProposalFullyLoading: (loading: boolean) => void,
  setProposalError: (proposalError: boolean) => void,
  proposalId?: string
) {
  try {
    const result = await apolloClient.query({
      query: PROPOSAL_VOTES_QUERY,
      variables: {
        id: proposal.id ?? proposalId,
      },
    });
    if (isEmpty(result?.data.proposal)) {
      setProposalError(true);
      setLoaded(true);
      setProposalFullyLoading(false);
    } else {
      const votes = get(result, "data.votes", []);
      const updatedProposal = {
        ...proposal,
        ...get(result, "data.proposal", {}),
        votes: votes,
      };
      setProposal(updatedProposal);
      setVotes(votes);
      setLoaded(true);
      setProposalFullyLoading(false);
      return { proposal: updatedProposal, votes };
    }
  } catch (e) {
    setProposalError(true);
  }
}

async function getResultsObj(
  space: Space,
  proposal: Proposal,
  votes: any[],
  setVotes: (votes: any[]) => void,
  setResults: (results: any) => void,
  setResultsLoaded: (resultsLoaded: boolean) => void
) {
  const response = await getResults(space, proposal, votes);
  if (response.votes) {
    setVotes(response.votes);
    setResults(response.results);
  }
  setResultsLoaded(true);
}

function ProposalScreen({ route }: ProposalScreenProps) {
  const { colors, connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const [proposal, setProposal] = useState<Proposal>(
    route.params.proposal ?? {}
  );
  const [loaded, setLoaded] = useState(false);
  const [proposalFullyLoading, setProposalFullyLoading] = useState(
    isEmpty(proposal)
  );
  const [votes, setVotes] = useState<any[]>([]);
  const navigation: any = useNavigation();
  const [results, setResults] = useState({});
  const [resultsLoaded, setResultsLoaded] = useState<boolean>(false);
  const [proposalError, setProposalError] = useState<boolean>(false);
  const { spaces } = useExploreState();
  const space: any = useMemo(
    () => getSpace(spaces, proposal, route.params.spaceId),
    [spaces, proposal]
  );
  const insets = useSafeAreaInsets();
  const bottomSheetRef: any = useRef();
  const [showProposalBottomSheet, setShowProposalBottomSheet] = useState(false);
  const authorProfile = profiles[proposal.author];
  const authorName = getUsername(
    proposal.author,
    authorProfile,
    connectedAddress ?? ""
  );

  useEffect(() => {
    getProposal(
      proposal,
      setProposal,
      setLoaded,
      setVotes,
      setProposalFullyLoading,
      setProposalError,
      route.params.proposalId
    );
  }, []);

  useEffect(() => {
    if (loaded) {
      getResultsObj(
        space,
        proposal,
        votes,
        setVotes,
        setResults,
        setResultsLoaded
      );
    }
  }, [loaded]);

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          {
            borderBottomColor: "transparent",
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <BackButton />
      </View>
      <Tabs.Container
        renderHeader={() => {
          return (
            <View style={styles.proposalHeader}>
              <Text style={[styles.proposalTitle, { color: colors.textColor }]}>
                {proposal.title}
              </Text>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate(SPACE_SCREEN, {
                        space,
                        showHeader: true,
                      });
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 24,
                        marginBottom: 24,
                      }}
                    >
                      <SpaceAvatar
                        symbolIndex="space"
                        size={18}
                        space={space}
                      />
                      <Text
                        style={[
                          styles.authorTitle,
                          {
                            color: colors.textColor,
                            marginLeft: 8,
                          },
                        ]}
                      >
                        {proposal?.space?.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.authorTitle,
                      { color: colors.secondaryGray },
                    ]}
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
                          color: colors.textColor,
                        },
                      ]}
                    >
                      {" "}
                      {authorName}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        headerContainerStyle={{
          shadowOpacity: 0,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
          elevation: 0,
        }}
        renderTabBar={(props) => {
          return (
            <MaterialTabBar
              {...props}
              contentContainerStyle={{ backgroundColor: colors.bgDefault }}
              tabStyle={{ backgroundColor: colors.bgDefault }}
              labelStyle={{
                fontFamily: "Calibre-Medium",
                color: colors.textColor,
                textTransform: "none",
                fontSize: 18,
              }}
              indicatorStyle={{
                backgroundColor: colors.indicatorColor,
                height: 3,
                borderBottomWidth: 0,
              }}
              inactiveColor={colors.darkGray}
              activeColor={colors.textColor}
              getLabelText={(name: any) => {
                return i18n.t(name);
              }}
            >
              {props.children}
            </MaterialTabBar>
          );
        }}
      >
        <Tabs.Tab name="about">
          <Tabs.ScrollView>
            <MarkdownBody body={proposal.body} />
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="results">
          <Tabs.ScrollView>
            <BlockResults
              resultsLoaded={resultsLoaded}
              proposal={proposal}
              results={results}
            />
            <View style={{ width: 10, height: 10 }} />
            <BlockVotes
              proposal={proposal}
              votes={votes}
              space={space}
              resultsLoaded={resultsLoaded}
            />
          </Tabs.ScrollView>
        </Tabs.Tab>
        <Tabs.Tab name="info">
          <Tabs.ScrollView>
            <BlockInformation proposal={proposal} space={space} />
          </Tabs.ScrollView>
        </Tabs.Tab>
      </Tabs.Container>
    </SafeAreaView>
  );
}

export default ProposalScreen;
