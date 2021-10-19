import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  SceneMap,
  TabBar,
  TabBarIndicator,
  TabView,
} from "react-native-tab-view";
import colors from "../constants/colors";
import common from "../styles/common";
import i18n from "i18n-js";
import ReceiptModal from "../components/proposal/ReceiptModal";
import { useExploreState } from "../context/exploreContext";
import BackButton from "../components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthState } from "../context/authContext";
import { Space } from "../types/explore";
import { Proposal } from "../types/proposal";
import VoteList from "../components/proposal/VotesList";

const { width: deviceWidth } = Dimensions.get("screen");

const styles = StyleSheet.create({
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
  votesMap: any,
  proposal: Proposal
) => {
  const sceneMap = routes.reduce((allRoutes, route) => {
    const allData =
      route.key === allVotesKey ? votes : votesMap[route.key] ?? [];
    allRoutes[route.key] = () => (
      <VoteList
        allData={allData}
        setShowReceiptModal={setShowReceiptModal}
        setCurrentAuthorIpfsHash={setCurrentAuthorIpfsHash}
        space={space}
        profiles={profiles}
        proposal={proposal}
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
      choicesTextWidth: { title: string; width: number }[];
    };
  };
};

function VotesScreen({ route }: VotesScreenProps) {
  const { connectedAddress } = useAuthState();
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const space = route.params.space;
  const proposal: any = route.params.proposal;
  const votes: any[] = route.params.votes;
  const choicesTextWidth: { title: string; width: number }[] =
    route.params.choicesTextWidth;
  const choices = proposal.choices ?? [];
  const { profiles } = useExploreState();
  const [index, setIndex] = React.useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentAuthorIpfsHash, setCurrentAuthorIpfsHash] = useState("");
  const allVotes = [{ key: allVotesKey, title: i18n.t("all") }];
  const scrollViewRef: any = useRef();
  const [routes] = React.useState(
    proposal.type === "quadratic" ||
      proposal.type === "ranked-choice" ||
      proposal.type === "weighted"
      ? allVotes
      : allVotes.concat(
          choices.map((choice: string, i: number) => ({
            key: `${i + 1}`,
            title: choice,
          }))
        )
  );
  const votesMap = parseVotes(votes, connectedAddress ?? "");
  const [layoutList, setLayoutList] = useState<any>([]);
  const sceneMap = useMemo(
    () =>
      renderScene(
        routes,
        votes,
        space,
        profiles,
        setShowReceiptModal,
        setCurrentAuthorIpfsHash,
        votesMap,
        proposal
      ),
    [route]
  );

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      <View style={[common.headerContainer, common.justifySpaceBetween]}>
        <Text style={common.screenHeaderTitle}>{i18n.t("votes")}</Text>
        <BackButton backIcon="close" containerStyle={{ paddingBottom: 0 }} />
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={(index) => {
          setIndex(index);
          if (scrollViewRef?.current?.scrollTo) {
            let x = 0;
            for (let i = 0; i < index; i++) {
              const choicesTextSize = choicesTextWidth[i];
              x += choicesTextSize.width + 24;
            }

            if (index !== 0) {
              x -= 12;
            }
            scrollViewRef?.current?.scrollTo({ x });
          }
        }}
        initialLayout={{ width: layout.width }}
        sceneContainerStyle={{
          height: 50,
        }}
        renderTabBar={(props) => {
          const tabWidth = deviceWidth / (choices.length + 1);
          const totalTabWidth = choicesTextWidth.reduce(
            (width: number, tab: any) => {
              width += tab.width + 24;
              return width;
            },
            0
          );
          const viewContainerWidth =
            totalTabWidth <= deviceWidth ? deviceWidth : totalTabWidth + 300;

          const tabStyle: { width: string } = {
            width: "auto",
          };
          let viewProps = {};
          let ScrollViewComponent = View;
          if (totalTabWidth >= deviceWidth) {
            ScrollViewComponent = ScrollView;
            viewProps = {
              horizontal: true,
              showsHorizontalScrollIndicator: false,
            };
          }
          return (
            <View
              style={{
                width: "100%",
              }}
            >
              <ScrollViewComponent {...viewProps} ref={scrollViewRef}>
                <View style={{ paddingBottom: 10 }}>
                  <View
                    style={{
                      width: viewContainerWidth,
                      borderBottomColor: colors.borderColor,
                      borderBottomWidth: 1,
                    }}
                  >
                    <TabBar
                      {...props}
                      labelStyle={styles.labelStyle}
                      indicatorStyle={[tabWidth <= 80 ? { top: 43 } : {}]}
                      renderIndicator={(props) => {
                        let width = 44;
                        if (props) {
                          const { navigationState } = props;
                          const currentChoice =
                            choicesTextWidth[navigationState.index];

                          if (currentChoice) {
                            width = currentChoice.width + 24;
                          }
                        }

                        return (
                          <TabBarIndicator
                            {...props}
                            width={width}
                            style={{
                              width,
                              backgroundColor: colors.darkGray,
                              top: Platform.OS === "ios" ? 42 : 43,
                              height: 5,
                            }}
                          />
                        );
                      }}
                      activeColor={colors.textColor}
                      style={{
                        shadowColor: "transparent",
                        borderTopWidth: 0,
                        shadowOpacity: 0,
                        backgroundColor: colors.white,
                        paddingTop: 0,
                        height: 45,
                        elevation: 0,
                        zIndex: 200,
                      }}
                      tabStyle={tabStyle}
                      inactiveColor={colors.textColor}
                      renderLabel={(props) => {
                        return (
                          <View
                            onLayout={(event) => {
                              setLayoutList(
                                layoutList.concat({
                                  index: event.nativeEvent.layout,
                                  key: props.route.key,
                                })
                              );
                            }}
                          >
                            <Text
                              style={styles.labelStyle}
                              ellipsizeMode="tail"
                              numberOfLines={1}
                            >
                              {props.route.title}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
              </ScrollViewComponent>
            </View>
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
