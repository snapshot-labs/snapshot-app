import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import get from "lodash/get";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { CollapsibleHeaderFlatList } from "react-native-collapsible-header-views";
import uniqBy from "lodash/uniqBy";
import colors from "../constants/colors";
import common from "../styles/common";
import { Space } from "../types/explore";
import Token from "../components/Token";
import { PROPOSALS_QUERY, SPACES_QUERY } from "../util/queries";
import apolloClient from "../util/apolloClient";
import { Proposal } from "../types/proposal";
import ProposalPreview from "../components/ProposalPreview";
import {
  EXPLORE_ACTIONS,
  useExploreDispatch,
  useExploreState,
} from "../context/exploreContext";
import { ContextDispatch } from "../types/context";
import { useAuthState } from "../context/authContext";
import FollowButton from "../components/FollowButton";
import ProposalFilters from "../components/proposal/ProposalFilters";
import proposal from "../constants/proposal";
import BackButton from "../components/BackButton";
import { setProfiles } from "../util/profile";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import AboutSpace from "../components/space/AboutSpace";
import SpaceHeader from "../components/space/SpaceHeader";

const LOAD_BY = 6;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

async function getProposals(
  space: string,
  loadCount: number,
  proposals: Proposal[],
  setLoadCount: (loadCount: number) => void,
  setProposals: (proposals: Proposal[]) => void,
  isInitial: boolean,
  setLoadingMore: (loadingMore: boolean) => void,
  state: string
) {
  const query = {
    query: PROPOSALS_QUERY,
    variables: {
      first: LOAD_BY,
      skip: loadCount,
      space_in: [space],
      state,
    },
  };
  const result = await apolloClient.query(query);
  const proposalResult = get(result, "data.proposals", []);
  if (isInitial) {
    setProposals(proposalResult);
  } else {
    const newProposals = uniqBy([...proposals, ...proposalResult], "id");
    setProposals(newProposals);
    setLoadCount(loadCount + LOAD_BY);
  }
  setLoadingMore(false);
}

async function getSpace(spaceId: string, exploreDispatch: ContextDispatch) {
  const query = {
    query: SPACES_QUERY,
    variables: {
      id_in: [spaceId],
    },
  };
  const result: any = await apolloClient.query(query);
  exploreDispatch({
    type: EXPLORE_ACTIONS.UPDATE_SPACES,
    payload: result.data.spaces,
  });
}

type TokenScreenProps = {
  route: {
    params: {
      space: Space;
    };
  };
  tokenScreenRef: any;
  scrollProps: any;
};
function TokenScreen({ route, tokenScreenRef, scrollProps }: TokenScreenProps) {
  const { isWalletConnect } = useAuthState();
  const { profiles } = useExploreState();
  const space = route.params.space;
  const spaceId: string = get(space, "id", "");
  const insets = useSafeAreaInsets();
  const [loadCount, setLoadCount] = useState<number>(0);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState(proposal.getStateFilters()[0]);
  const exploreDispatch = useExploreDispatch();
  tokenScreenRef.current = {
    filter,
    setFilter,
    onChangeFilter: (newFilter: string) => {
      setLoadCount(0);
      getProposals(
        spaceId,
        0,
        proposals,
        setLoadCount,
        setProposals,
        true,
        setLoadingMore,
        newFilter
      );
    },
  };

  useEffect(() => {
    console.log("INITIAL GET PROPOSALS");
    setLoadingMore(true);
    getProposals(
      spaceId,
      loadCount,
      proposals,
      setLoadCount,
      setProposals,
      true,
      setLoadingMore,
      filter.key
    );
    getSpace(spaceId, exploreDispatch);
  }, [space]);

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray = proposals.map((proposal: Proposal) => proposal.author);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });
    setProfiles(filteredArray, exploreDispatch);
  }, [space, proposals]);

  return (
    <View style={common.screen}>
      <AnimatedFlatList
        data={proposals}
        keyExtractor={(item) => `${item.id}`}
        renderItem={(data) => {
          return <ProposalPreview proposal={data.item} />;
        }}
        onEndReachedThreshold={0.1}
        onEndReached={() => {
          setLoadingMore(true);
          getProposals(
            spaceId,
            loadCount === 0 ? LOAD_BY : loadCount,
            proposals,
            setLoadCount,
            setProposals,
            false,
            setLoadingMore,
            filter.key
          );
        }}
        ListEmptyComponent={
          loadingMore ? (
            <View />
          ) : (
            <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
              <Text style={common.subTitle}>
                {i18n.t("cantFindAnyResults")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                height: 150,
              }}
            >
              <ActivityIndicator color={colors.textColor} size="large" />
            </View>
          ) : (
            <View
              style={{ width: "100%", height: 150, backgroundColor: "white" }}
            />
          )
        }
        {...scrollProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  indicatorStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    backgroundColor: colors.darkGray,
  },
  labelStyle: {
    fontFamily: "Calibre-Medium",
    color: colors.textColor,
    textTransform: "none",
    fontSize: 18,
  },
});

const renderScene = (route, tokenScreenRef, scrollProps) =>
  SceneMap({
    proposals: () => (
      <TokenScreen
        route={route}
        tokenScreenRef={tokenScreenRef}
        scrollProps={scrollProps}
      />
    ),
    about: () => <AboutSpace route={route} />,
  });

const headerHeight = 130;

function TokenScreenWrapper({ route }) {
  const [index, setIndex] = React.useState(0);
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isWalletConnect } = useAuthState();
  const space = route.params.space;
  const tokenScreenRef = useRef(null);
  const scrollEndTimer: any = useRef(-1);
  const scrollAnim = useRef(new Animated.Value(0));
  const offsetAnim = useRef(new Animated.Value(0));
  const scrollValue = useRef(0);
  const offsetValue = useRef(0);
  const clampedScrollValue = useRef(0);
  const headerSnap = useRef(Animated.CompositeAnimation);
  const clampedScroll = useRef(
    Animated.diffClamp(
      Animated.add(
        scrollAnim.current.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolateLeft: "clamp",
        }),
        offsetAnim.current
      ),
      0,
      headerHeight
    )
  );

  useEffect(() => {
    offsetAnim.current.addListener(({ value }) => {
      offsetValue.current = value;
    });
    scrollAnim.current.addListener(({ value }) => {
      const diff = value - scrollValue.current;
      scrollValue.current = value;
      clampedScrollValue.current = Math.min(
        Math.max(clampedScrollValue.current + diff, 0),
        headerHeight
      );
    });
    return () => {
      scrollAnim.current.removeAllListeners();
      offsetAnim.current.removeAllListeners();
    };
  }, []);

  const headerTranslation = clampedScroll.current.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });

  function moveHeader(toValue: number) {
    if (headerSnap.current) {
      headerSnap.current.stop();
    }

    headerSnap.current = Animated.timing(offsetAnim.current, {
      toValue,
      duration: 350,
      useNativeDriver: true,
    });

    headerSnap.current.start();
  }

  function onMomentumScrollEnd() {
    moveHeader(
      scrollValue.current > headerHeight &&
        clampedScrollValue.current > headerHeight / 2
        ? offsetValue.current + headerHeight
        : offsetValue.current - headerHeight
    );
  }

  function onScrollEndDrag() {
    scrollEndTimer.current = setTimeout(onMomentumScrollEnd, 250);
  }

  function onMomentumScrollBegin() {
    clearTimeout(scrollEndTimer.current);
  }

  const sceneMap = useMemo(
    () =>
      renderScene(route, tokenScreenRef, {
        onMomentumScrollEnd,
        onScrollEndDrag,
        onMomentumScrollBegin,

        onScroll: Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnim.current } } }],
          { useNativeDriver: true }
        ),
      }),
    [route]
  );

  const renderTabBar = (props: any) => (
    <>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 9999,
            height: headerHeight,
            backgroundColor: colors.white,
            width: "100%",
          },
          [{ transform: [{ translateY: headerTranslation }] }],
        ]}
      >
        <SpaceHeader space={space} isWalletConnect={isWalletConnect} />
        <TabBar
          {...props}
          labelStyle={styles.labelStyle}
          indicatorStyle={styles.indicatorStyle}
          activeColor={colors.textColor}
          style={{ backgroundColor: colors.white }}
          inactiveColor={colors.textColor}
        />
      </Animated.View>
    </>
  );

  const [routes] = React.useState([
    { key: "proposals", title: i18n.t("proposals") },
    { key: "about", title: i18n.t("about") },
  ]);

  return (
    <View style={[common.screen, { paddingTop: insets.top }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <BackButton />
        <View style={{ padding: 16, width: 60, height: 55, marginRight: 18 }}>
          {index === 0 && (
            <ProposalFilters
              filter={tokenScreenRef?.current?.filter}
              setFilter={tokenScreenRef?.current?.setFilter}
              onChangeFilter={tokenScreenRef?.current?.onChangeFilter}
            />
          )}
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

export default TokenScreenWrapper;
