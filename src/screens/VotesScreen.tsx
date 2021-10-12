import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Platform,
} from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import colors from "../constants/colors";
import common from "../styles/common";
import i18n from "i18n-js";
import VoteRow from "../components/proposal/VoteRow";
import ReceiptModal from "../components/proposal/ReceiptModal";
import { useExploreState } from "../context/exploreContext";
import BackButton from "../components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState } from "../context/authContext";
import { Space } from "../types/explore";
import { Proposal } from "../types/proposal";

const styles = StyleSheet.create({
  indicatorStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    backgroundColor: colors.darkGray,
    height: 5,
    top: 42,
  },
  labelStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    textTransform: "none",
    fontSize: 18,
  },
  headerTitle: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginTop: Platform.OS === "ios" ? 6 : 0,
  },
});

const allVotesKey = "SHOW_ALL_VOTES_KEY_123";

const renderScene = (
  routes: any[],
  votes: any[],
  space: Space,
  profiles: any,
  setShowReceiptModal: (showModal: boolean) => void,
  setCurrentAuthorIpfsHash: (authorHash: string) => void,
  votesMap: any
) => {
  const sceneMap = routes.reduce((allRoutes, route) => {
    const allData =
      route.key === allVotesKey ? votes : votesMap[route.key] ?? [];
    allRoutes[route.key] = () => (
      <FlatList
        data={allData}
        renderItem={(data) => (
          <VoteRow
            vote={data.item}
            space={space}
            setShowReceiptModal={setShowReceiptModal}
            setCurrentAuthorIpfsHash={setCurrentAuthorIpfsHash}
            profiles={profiles}
          />
        )}
      />
    );

    return allRoutes;
  }, {});
  return SceneMap(sceneMap);
};

function parseVotes(votes: any[], connectedAddress: string) {
  const votesMap: { [choice: string]: any[] } = {};

  votes.forEach((vote) => {
    if (Array.isArray(vote.choice)) {
      vote.choice.forEach((choice: number) => {
        if (votesMap[choice] !== undefined) {
          if (vote.voter === connectedAddress) {
            votesMap[choice].unshift(vote);
          }
          votesMap[choice].push(vote);
        } else {
          votesMap[choice] = [vote];
        }
      });
    } else {
      if (votesMap[vote.choice] !== undefined) {
        if (vote.voter == connectedAddress) {
          votesMap[vote.choice].unshift(vote);
        } else {
          votesMap[vote.choice].push(vote);
        }
      } else {
        votesMap[vote.choice] = [vote];
      }
    }
  });

  return votesMap;
}

type VotesScreenProps = {
  route: {
    params: {
      space: Space;
      votes: any[];
      proposal: Proposal;
    };
  };
};

function VotesScreen({ route }: VotesScreenProps) {
  const { connectedAddress } = useAuthState();
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const space = route.params.space;
  const proposal = route.params.proposal;
  const votes: any[] = route.params.votes;
  const choices = route.params?.proposal?.choices ?? [];
  const { profiles } = useExploreState();
  const [index, setIndex] = React.useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentAuthorIpfsHash, setCurrentAuthorIpfsHash] = useState("");
  const [routes] = React.useState(
    [{ key: allVotesKey, title: i18n.t("all") }].concat(
      choices.map((choice: string, i: number) => ({
        key: `${i + 1}`,
        title: choice,
      }))
    )
  );
  const votesMap = parseVotes(votes, connectedAddress ?? "");

  const sceneMap = useMemo(
    () =>
      renderScene(
        routes,
        votes,
        space,
        profiles,
        setShowReceiptModal,
        setCurrentAuthorIpfsHash,
        votesMap
      ),
    [route]
  );

  return (
    <View style={common.screen}>
      <View
        style={{
          paddingTop: insets.top,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingLeft: 16,
        }}
      >
        <Text style={styles.headerTitle}>{i18n.t("votes")}</Text>
        <BackButton backIcon="times" containerStyle={{ paddingBottom: 0 }} />
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        sceneContainerStyle={{
          height: 50,
        }}
        renderTabBar={(props) => {
          return (
            <TabBar
              {...props}
              labelStyle={styles.labelStyle}
              indicatorStyle={styles.indicatorStyle}
              activeColor={colors.textColor}
              style={{
                shadowColor: "transparent",
                borderTopWidth: 0,
                shadowOpacity: 0,
                backgroundColor: colors.white,
                paddingTop: 0,
                marginTop: 16,
                height: 45,
                elevation: 0,
                zIndex: 200,
                borderBottomColor: colors.borderColor,
                borderBottomWidth: 1,
              }}
              inactiveColor={colors.textColor}
            />
          );
        }}
      />
      <ReceiptModal
        isVisible={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
        }}
        authorIpfsHash={currentAuthorIpfsHash}
      />
    </View>
  );
}

export default VotesScreen;
