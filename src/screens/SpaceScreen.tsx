import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  Platform,
  Dimensions,
} from "react-native";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import colors from "constants/colors";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { Space } from "types/explore";
import proposal from "constants/proposal";
import ProposalFilters from "components/proposal/ProposalFilters";
import AboutSpace from "components/space/AboutSpace";
import SpaceHeader from "components/space/SpaceHeader";
import SpaceProposals from "components/space/SpaceProposals";
import TabBarItem from "components/tabBar/TabBarItem";
import ProposalFiltersBottomSheet from "components/proposal/ProposalFiltersBottomSheet";

const { width } = Dimensions.get("screen");

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
    marginTop: 0,
  },
});

export const headerHeight = Platform.OS === "android" ? 185 : 170;

const HEADER_MAX_HEIGHT = Platform.OS === "android" ? 155 : 140;
const HEADER_MIN_HEIGHT = 0;
const PROFILE_IMAGE_MAX_HEIGHT = 60;
const PROFILE_IMAGE_MIN_HEIGHT = 10;

const renderScene = (
  route: any,
  spaceScreenRef: any,
  scrollProps: any,
  filter: { key: string }
) =>
  SceneMap({
    proposals: () => (
      <SpaceProposals
        space={route.params.space}
        spaceScreenRef={spaceScreenRef}
        scrollProps={scrollProps}
        headerHeight={headerHeight + 40}
        filter={filter}
      />
    ),
    about: () => (
      <AboutSpace
        routeSpace={route.params.space}
        scrollProps={scrollProps}
        headerHeight={headerHeight}
      />
    ),
  });

type SpaceScreenProps = {
  route: {
    params: {
      space: Space;
    };
  };
};

function TabCustomTouchableNativeFeedback({ children, ...props }: any) {
  return (
    <TouchableNativeFeedback
      {...props}
      background={TouchableNativeFeedback.Ripple("rgba(0, 0, 0, .32)", false)}
      style={[{ width: width / 2 }].concat(props.style)}
    >
      {children}
    </TouchableNativeFeedback>
  );
}

function SpaceScreen({ route }: SpaceScreenProps) {
  const [index, setIndex] = React.useState(0);
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isWalletConnect, colors } = useAuthState();
  const [filter, setFilter] = useState(proposal.getStateFilters()[0]);
  const [showTitle, setShowTitle] = useState(false);
  const space = route.params.space;
  const scrollY = useRef(new Animated.Value(0));
  const headerHeight = scrollY.current.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - 40, HEADER_MAX_HEIGHT + 5],
    outputRange: [-40, -15, Platform.OS === "android" ? 10 : 6],
    extrapolate: "clamp",
  });
  const profileImageHeight = scrollY.current.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [PROFILE_IMAGE_MAX_HEIGHT, PROFILE_IMAGE_MIN_HEIGHT],
    extrapolate: "clamp",
  });
  const headerZindex = scrollY.current.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const headerTitleBottom = scrollY.current.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT],
    outputRange: [0, -HEADER_MAX_HEIGHT],
    extrapolate: "clamp",
  });
  const spaceScreenRef: any = useRef(null);
  const scrollValue = useRef(0);
  const scrollEndTimer: any = useRef(-1);
  const [isInitial, setIsInitial] = useState(true);
  const bottomSheetRef: any = useRef();
  const [showProposalFilters, setShowProposalFilters] = useState(false);

  useEffect(() => {
    if (!isInitial) {
      setShowTitle(false);
    }

    setIsInitial(false);
  }, [index]);

  useEffect(() => {
    scrollY.current.addListener(({ value }) => {
      scrollValue.current = value;

      if (value >= HEADER_MAX_HEIGHT) {
        setShowTitle(true);
      } else {
        setShowTitle(false);
      }
    });
    return () => {
      scrollY.current.removeAllListeners();
      clearTimeout(scrollEndTimer.current);
    };
  }, []);

  function resetHeader() {
    const toValue = -HEADER_MAX_HEIGHT;
    Animated.timing(scrollY.current, {
      toValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }

  const sceneMap = useMemo(
    () =>
      renderScene(
        route,
        spaceScreenRef,
        {
          onScroll: Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
            { useNativeDriver: false }
          ),
        },
        filter
      ),
    [route, filter]
  );

  const renderTabBar = (props: any) => (
    <>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            height: HEADER_MAX_HEIGHT,
            backgroundColor: colors.bgDefault,
            width: "100%",
          },
          [{ transform: [{ translateY: headerTitleBottom }] }],
        ]}
      >
        <SpaceHeader
          space={space}
          isWalletConnect={isWalletConnect}
          profileImageHeight={profileImageHeight}
        />
        <TabBar
          {...props}
          labelStyle={styles.labelStyle}
          indicatorStyle={[
            styles.indicatorStyle,
            { color: colors.textColor, backgroundColor: colors.indicatorColor },
          ]}
          activeColor={colors.textColor}
          style={{
            shadowColor: "transparent",
            borderTopWidth: 0,
            shadowOpacity: 0,
            backgroundColor: colors.bgDefault,
            height: 45,
            elevation: 0,
            zIndex: 200,
            borderBottomColor: colors.borderColor,
            borderBottomWidth: 1,
            paddingTop: 4,
          }}
          inactiveColor={colors.textColor}
          renderTabBarItem={(item) => {
            return (
              <TabBarItem
                {...item}
                //@ts-ignore
                PressableComponent={
                  Platform.OS === "android"
                    ? TabCustomTouchableNativeFeedback
                    : undefined
                }
              />
            );
          }}
          tabStyle={{ alignItems: "center", justifyContent: "flex-start" }}
          onTabPress={() => {
            resetHeader();
          }}
        />
      </Animated.View>
    </>
  );

  const [routes] = React.useState([
    { key: "proposals", title: i18n.t("proposals") },
    { key: "about", title: i18n.t("about") },
  ]);
  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <Animated.View
        style={[
          common.headerContainer,
          {
            justifyContent: "space-between",
            backgroundColor: showTitle ? colors.bgBlue : colors.bgDefault,
            borderBottomWidth: 0,
          },
        ]}
      >
        <BackButton
          iconColor={showTitle ? colors.white : colors.textColor}
          titleStyle={{
            color: showTitle ? colors.white : colors.textColor,
            overflow: "visible",
          }}
          title={space.name}
          isAnimated
          animatedProps={{
            style: {
              position: "absolute",
              bottom: headerHeight,
              zIndex: headerZindex,
              elevation: headerZindex,
              left: 50,
            },
          }}
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: Platform.OS === "android" ? 12 : 16,
            height: 60,
            marginRight: 18,
          }}
        >
          {index === 0 && (
            <ProposalFilters
              filter={filter}
              showBottomSheetModal={() => {
                if (bottomSheetRef.current) {
                  bottomSheetRef.current.snapToIndex(1);
                } else {
                  setShowProposalFilters(!showProposalFilters);
                }
              }}
              iconColor={showTitle ? colors.white : colors.textColor}
              filterTextStyle={{
                color: showTitle ? colors.white : colors.textColor,
                fontSize: 24,
              }}
              filterContainerStyle={{
                marginTop: 6,
              }}
            />
          )}
        </View>
      </Animated.View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={sceneMap}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        onSwipeStart={() => {
          resetHeader();
        }}
      />
      {showProposalFilters && (
        <ProposalFiltersBottomSheet
          bottomSheetRef={bottomSheetRef}
          setFilter={setFilter}
          onClose={() => {
            if (bottomSheetRef.current) {
              bottomSheetRef.current.close();
            } else {
              setShowProposalFilters(false);
            }
          }}
          onChangeFilter={(newFilter: string) => {
            spaceScreenRef?.current?.onChangeFilter(newFilter);
            resetHeader();
          }}
        />
      )}
    </View>
  );
}

export default SpaceScreen;
