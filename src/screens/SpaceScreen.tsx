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
import AboutSpace from "components/space/AboutSpace";
import SpaceHeader from "components/space/SpaceHeader";
import SpaceProposals from "components/space/SpaceProposals";
import TabBarItem from "components/tabBar/TabBarItem";

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
  scrollPropsProposals: any,
  scrollPropsAbout: any,
  spaceAboutRef: any,
  spaceProposalsRef: any
) =>
  SceneMap({
    proposals: () => (
      <SpaceProposals
        space={route.params.space}
        scrollProps={scrollPropsProposals}
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
        spaceAboutRef,
        spaceProposalsRef
      ),
    [route]
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
      </Animated.View>
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

export default SpaceScreen;
