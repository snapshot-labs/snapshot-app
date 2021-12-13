import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MarkdownBody from "components/proposal/MarkdownBody";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Proposal } from "types/proposal";
import i18n from "i18n-js";
import common from "styles/common";
import { useExploreState } from "context/exploreContext";
import { Space } from "types/explore";
import { PROPOSAL_VOTES_QUERY } from "helpers/queries";
import apolloClient from "helpers/apolloClient";
import StateBadge from "components/StateBadge";
import BlockInformation from "components/proposal/BlockInformation";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import BlockVotes from "components/proposal/BlockVotes";
import { getResults } from "helpers/snapshot";
import BackButton from "components/BackButton";
import BlockResults from "components/proposal/BlockResults";
import { Fade, Placeholder, PlaceholderLine } from "rn-placeholder";
import ProposalMenu from "components/proposal/ProposalMenu";
import { useAuthState } from "context/authContext";
import ProposalBottomSheet from "components/proposal/ProposalBottomSheet";
import SpaceAvatar from "components/SpaceAvatar";
import { SPACE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";
import ProposalVoteBottomSheet from "components/proposal/ProposalVoteBottomSheet";

interface ProposalScreenProps {
  route: {
    params: {
      proposal: Proposal;
      fromFeed: boolean;
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
  const { colors } = useAuthState();
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
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const [proposalError, setProposalError] = useState<boolean>(false);
  const { spaces } = useExploreState();
  const space: any = useMemo(
    () => getSpace(spaces, proposal, route.params.spaceId),
    [spaces, proposal]
  );
  const insets = useSafeAreaInsets();
  const bottomSheetRef: any = useRef();
  const [showProposalBottomSheet, setShowProposalBottomSheet] = useState(false);

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
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          common.justifySpaceBetween,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton />
        {!proposalFullyLoading && (
          <ProposalMenu
            showBottomSheetModal={() => {
              if (bottomSheetRef.current) {
                bottomSheetRef.current.snapToIndex(1);
              } else {
                setShowProposalBottomSheet(!showProposalBottomSheet);
              }
            }}
          />
        )}
      </View>
      {proposalFullyLoading ? (
        <View
          style={[
            common.containerHorizontalPadding,
            common.containerVerticalPadding,
          ]}
        >
          <Placeholder
            style={{ justifyContent: "center", alignItems: "center" }}
            Animation={Fade}
          >
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
            <PlaceholderLine width={100} />
          </Placeholder>
        </View>
      ) : proposalError ? (
        <View
          style={[
            common.justifyCenter,
            common.alignItemsCenter,
            { marginTop: 50 },
          ]}
        >
          <Text style={[common.h4, { color: colors.darkGray }]}>
            {i18n.t("unableToFindProposal")}
          </Text>
        </View>
      ) : (
        <ScrollView scrollEnabled={scrollEnabled}>
          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(SPACE_SCREEN, { space, showHeader: true });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 16,
                }}
              >
                <SpaceAvatar symbolIndex="space" size={28} space={space} />
                <Text
                  style={[
                    common.h3,
                    {
                      color: colors.textColor,
                      marginLeft: 8,
                      marginTop: Platform.OS === "ios" ? 6 : 0,
                    },
                  ]}
                >
                  {proposal?.space?.name}
                </Text>
              </View>
            </TouchableOpacity>
            <Text
              style={[
                common.h1,
                { marginBottom: 8, marginTop: 16, color: colors.textColor },
              ]}
            >
              {proposal.title}
            </Text>
            <View style={{ alignSelf: "flex-start", marginBottom: 24 }}>
              <StateBadge state={proposal.state} />
            </View>
            <MarkdownBody body={proposal.body} />
          </View>
          <View style={{ width: 10, height: 30 }} />
          <BlockVotes
            proposal={proposal}
            votes={votes}
            space={space}
            resultsLoaded={resultsLoaded}
          />
          <View style={{ width: 10, height: 10 }} />
          <BlockResults resultsLoaded={resultsLoaded} proposal={proposal} />
          <View style={{ width: 10, height: 10 }} />
          <BlockInformation proposal={proposal} space={space} />
          <View style={{ width: 10, height: 75 }} />
        </ScrollView>
      )}
      {proposal?.state === "active" && (
        <ProposalVoteBottomSheet
          proposal={proposal}
          resultsLoaded={resultsLoaded}
          setScrollEnabled={setScrollEnabled}
          space={space}
          getProposal={async () => {
            const proposalResponse = await getProposal(
              proposal,
              setProposal,
              setLoaded,
              setVotes,
              setProposalFullyLoading,
              setProposalError
            );

            getResultsObj(
              space,
              proposalResponse?.proposal,
              proposalResponse?.votes,
              setVotes,
              setResults,
              setResultsLoaded
            );
          }}
        />
      )}
      {showProposalBottomSheet && (
        <ProposalBottomSheet
          proposal={proposal}
          space={space}
          bottomSheetRef={bottomSheetRef}
          onClose={() => {
            if (bottomSheetRef.current) {
              bottomSheetRef.current.close();
            } else {
              setShowProposalBottomSheet(false);
            }
          }}
        />
      )}
    </View>
  );
}

export default ProposalScreen;
