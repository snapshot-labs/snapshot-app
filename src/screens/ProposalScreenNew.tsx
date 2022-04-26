import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  BackHandler,
} from "react-native";
import { ActivityIndicator } from 'react-native-paper';
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import { Proposal } from "types/proposal";
import isEmpty from "lodash/isEmpty";
import { useNavigation } from "@react-navigation/core";
import { Space } from "types/explore";
import apolloClient from "helpers/apolloClient";
import { PROPOSAL_VOTES_QUERY } from "helpers/queries";
import get from "lodash/get";
import common from "styles/common";
import BackButton from "components/BackButton";
import i18n from "i18n-js";
import MarkdownBody from "components/proposal/MarkdownBody";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import { getVotingPower } from "helpers/proposalUtils";
import UserVotingPower from "components/proposal/UserVotingPower";
import ProposalInfoBlock from "components/proposal/ProposalInfoBlock";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";
import ProposalVoteButton from "components/proposal/ProposalVoteButton";
import ProposalResultsVotersSection from "components/proposal/ProposalResultsVotersSection";
import { STATES } from "constants/proposal";
import { useScrollManager } from "../hooks/useScrollManager";
import { TabRoute } from "components/tabBar/TabView";
import Scene from "components/tabBar/Scene";
import TabView from "components/tabBar/TabView";
import Device from "helpers/device";
import AnimatedTabBar from "components/tabBar/AnimatedTabBar";
import TabBarComponent from "components/tabBar/TabBar";
import AnimatedHeader from "components/tabBar/AnimatedHeader";
import ProposalScreenHeader from "components/proposal/ProposalScreenHeader";

const baseHeaderHeight = Device.isIos() ? 280 : 240;
const deviceHeight = Device.getDeviceHeight();

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
        id: proposal?.id ?? proposalId,
        voteLimit: proposal.state === STATES.closed ? 5 : 10000,
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
      };
      setProposal(updatedProposal);
      setVotes(votes);
      setLoaded(true);
      setProposalFullyLoading(false);
    }
  } catch (e) {
    setProposalError(true);
  }
}

async function getUserVotingPower(
  connectedAddress: string,
  proposal: Proposal,
  setVotingPower: (votingPower: number) => void,
  setLoadingPower: (loadingPower: boolean) => void
) {
  setLoadingPower(true);
  try {
    const votingPower = await getVotingPower(connectedAddress, proposal);
    setVotingPower(votingPower);
  } catch (e) {
  } finally {
    setLoadingPower(false);
  }
}

function ProposalScreen({ route }: ProposalScreenProps) {
  const { colors, connectedAddress } = useAuthState();
  const [proposal, setProposal] = useState<Proposal | any>(
    route.params.proposal ? route.params.proposal : {}
  );
  const [loaded, setLoaded] = useState(false);
  const [proposalFullyLoading, setProposalFullyLoading] = useState(
    isEmpty(proposal)
  );
  const [votes, setVotes] = useState<any[]>([]);
  const navigation: any = useNavigation();
  const [loadingPower, setLoadingPower] = useState<boolean>(false);
  const [castedVote, setCastedVote] = useState<number>(0);
  const [proposalError, setProposalError] = useState<boolean>(false);
  const { spaces } = useExploreState();
  const space: any = useMemo(
    () => getSpace(spaces, proposal, route.params.spaceId),
    [spaces, proposal]
  );
  const [votingPower, setVotingPower] = useState(0);
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalShowRef = useBottomSheetModalShowRef();
  const tabs = [
    { key: "about", title: i18n.t("about") },
    { key: "results", title: i18n.t("results") },
    { key: "info", title: i18n.t("info") },
  ];
  const proposalTitleLength = proposal?.title?.length > 60 ? 30 : 0;
  const headerHeight = baseHeaderHeight + proposalTitleLength;
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "about") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "body" }]}
            renderItem={() => {
              return (
                <View
                  style={[common.containerHorizontalPadding, { marginTop: 22 }]}
                >
                  <MarkdownBody body={proposal.body} />
                </View>
              );
            }}
            ListFooterComponent={
              <View style={{ width: 100, height: deviceHeight * 0.9 }} />
            }
            {...sceneProps}
          />
        );
      } else if (tab.key === "results") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "results" }]}
            renderItem={() => {
              return (
                <ProposalResultsVotersSection
                  proposal={proposal}
                  space={space}
                  votes={votes}
                  votingPower={votingPower}
                  loading={!loaded}
                  castedVote={castedVote}
                />
              );
            }}
            ListFooterComponent={
              <View style={{ width: 100, height: deviceHeight * 0.9 }} />
            }
            {...sceneProps}
          />
        );
      } else if (tab.key === "info") {
        return (
          <Scene
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            data={[{ key: "info" }]}
            renderItem={() => {
              return (
                <View
                  style={[
                    common.containerHorizontalPadding,
                    { marginTop: 28, paddingBottom: 28 },
                  ]}
                >
                  <ProposalInfoBlock proposal={proposal} />
                </View>
              );
            }}
            ListFooterComponent={
              <View style={{ width: 100, height: deviceHeight * 0.9 }} />
            }
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY]
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
    const backAction = () => {
      if (bottomSheetModalShowRef.current) {
        bottomSheetModalRef.current?.close();
      } else {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
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
    if (loaded) {
      getUserVotingPower(
        connectedAddress,
        proposal,
        setVotingPower,
        setLoadingPower
      );
    }
  }, [loaded]);

  return (
    <>
      <IPhoneTopSafeAreaViewBackground />
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
              zIndex: 99,
            },
          ]}
        >
          <BackButton />
          {!loadingPower && (
            <View style={common.containerHorizontalPadding}>
              <UserVotingPower
                address={connectedAddress}
                score={votingPower}
                symbol={proposal?.space?.symbol ?? ""}
              />
            </View>
          )}
        </View>
        {proposalFullyLoading ? (
          <View
            style={[
              common.containerHorizontalPadding,
              common.containerVerticalPadding,
            ]}
          >
            <ActivityIndicator size="large" color={colors.textColor} />
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
          <>
            <AnimatedHeader scrollY={scrollY} headerHeight={headerHeight}>
              <ProposalScreenHeader space={space} proposal={proposal} />
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
          </>
        )}

        {proposal?.state === "active" && (
          <ProposalVoteButton
            proposal={proposal}
            space={space}
            getProposal={async () => {
              await getProposal(
                proposal,
                setProposal,
                setLoaded,
                setVotes,
                setProposalFullyLoading,
                setProposalError
              );
              setCastedVote(castedVote + 1);
            }}
          />
        )}
      </SafeAreaView>
    </>
  );
}

export default ProposalScreen;
