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

const renderScene = (
  route: any,
  spaceScreenRef: any,
  scrollPropsProposals: any,
  scrollPropsAbout: any,
  filter: { key: string },
  spaceAboutRef: any,
  spaceProposalsRef: any
) =>
  SceneMap({
    proposals: () => (
      <SpaceProposals
        space={route.params.space}
        spaceScreenRef={spaceScreenRef}
        scrollProps={scrollPropsProposals}
        filter={filter}
        headerHeight={headerHeight}
        spaceProposalsRef={spaceProposalsRef}
      />
    ),
    about: () => (
      <AboutSpace
        routeSpace={route.params.space}
        scrollProps={scrollPropsAbout}
        headerHeight={headerHeight}
        spaceAboutRef={spaceAboutRef}
      />
    ),
  });

type SpaceScreenProps = {
  route: {
    params: {
      space: Space;
      showHeader?: boolean;
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
  const showTitleRef = useRef(false);
  const space = route.params.space;
  const scrollProposals = useRef(new Animated.Value(0));
  const scrollAbout = useRef(new Animated.Value(0));
  const headerProposals = scrollProposals.current.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });
  const headerAbout = scrollAbout.current.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
    extrapolate: "clamp",
  });
  const spaceScreenRef: any = useRef(null);
  const bottomSheetRef: any = useRef();
  const [showProposalFilters, setShowProposalFilters] = useState(false);
  const spaceAboutCurrentScrollRef = useRef(0);
  const spaceProposalsCurrentScrollRef = useRef(0);
  const spaceAboutRef = useRef();
  const spaceProposalsRef = useRef();
  const showingProposals = useRef(true);

  function resetHeader() {
    const toValue = -headerHeight;
    Animated.timing(scrollProposals.current, {
      toValue,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    spaceAboutCurrentScrollRef.current = 0;
    spaceProposalsCurrentScrollRef.current = 0;
  }

  useEffect(() => {
    if (route?.params?.showHeader) {
      resetHeader();
    }
  }, [route.params]);

  useEffect(() => {
    showingProposals.current = index === 0;
  }, [index]);

  useEffect(() => {
    scrollProposals.current.addListener(({ value }) => {
      if (showingProposals.current) {
        if (value > 0 && spaceAboutCurrentScrollRef.current <= 300) {
          scrollAbout.current.setValue(value);
          if (spaceAboutCurrentScrollRef.current !== headerHeight) {
            spaceAboutRef.current?.scrollTo({ y: headerHeight });
          }
          spaceAboutCurrentScrollRef.current = headerHeight;
        } else if (value <= headerHeight) {
          scrollAbout.current.setValue(value);
          if (spaceAboutCurrentScrollRef.current !== 0) {
            spaceAboutRef.current?.scrollTo({ y: 0 });
          }
          spaceAboutCurrentScrollRef.current = 0;
        }
      }
    });
    scrollAbout.current.addListener(({ value }) => {
      if (!showingProposals.current) {
        if (value > 0 && spaceProposalsCurrentScrollRef.current <= 300) {
          scrollProposals.current.setValue(value);
          if (spaceProposalsCurrentScrollRef.current !== headerHeight) {
            spaceProposalsRef?.current?.scrollToOffset({
              offset: headerHeight,
            });
          }
          spaceProposalsCurrentScrollRef.current = headerHeight;
        } else if (value <= headerHeight) {
          scrollProposals.current.setValue(value);
          if (spaceProposalsCurrentScrollRef.current !== 0) {
            spaceProposalsRef.current?.scrollToOffset({ offset: 0 });
          }
          spaceProposalsCurrentScrollRef.current = 0;
        }
      }
    });
  }, []);

  const sceneMap = useMemo(
    () =>
      renderScene(
        route,
        spaceScreenRef,
        {
          onScroll: Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollProposals.current } },
              },
            ],
            {
              useNativeDriver: true,
              listener: (event) => {
                if (showingProposals.current) {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  if (offsetY >= headerHeight) {
                    if (!showTitleRef.current) {
                      setShowTitle(true);
                      showTitleRef.current = true;
                    }
                  } else {
                    setShowTitle(false);
                    showTitleRef.current = false;
                  }
                }
              },
            }
          ),
        },
        {
          onScroll: Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollAbout.current } } }],
            {
              useNativeDriver: true,
              listener: (event) => {
                if (!showingProposals.current) {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  if (offsetY >= headerHeight) {
                    if (!showTitleRef.current) {
                      setShowTitle(true);
                      showTitleRef.current = true;
                    }
                  } else {
                    setShowTitle(false);
                    showTitleRef.current = false;
                  }
                }
              },
            }
          ),
        },
        filter,
        spaceAboutRef,
        spaceProposalsRef
      ),
    [route, filter]
  );
  const headerTranslate = index === 0 ? headerProposals : headerAbout;

  const renderTabBar = (props: any) => (
    <>
      <Animated.View
        style={[
          {
            backgroundColor: colors.bgDefault,
            width: "100%",
            height: headerHeight,
            top: 0,
            left: 0,
            position: "absolute",
            zIndex: 200,
          },
          [
            {
              transform: [{ translateY: headerTranslate }],
            },
          ],
        ]}
      >
        <SpaceHeader space={space} isWalletConnect={isWalletConnect} />
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
          title={showTitle ? space.name : ""}
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
