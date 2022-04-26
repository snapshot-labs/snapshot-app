import React, { useCallback, useEffect } from "react";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import { BackHandler, View, Text } from "react-native";
import SpaceHeader from "components/space/SpaceHeader";
import { Space } from "types/explore";
import { setSpaceDetails } from "helpers/voting/spaceUtils";
import { useExploreDispatch } from "context/exploreContext";
import SpaceProposalsTab from "components/space/SpaceProposalsTab";
import SpaceAboutTab from "components/space/SpaceAboutTab";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";
import { useNavigation } from "@react-navigation/core";
import i18n from "i18n-js";
import { TabRoute } from "components/tabBar/TabView";
import { useScrollManager } from "../hooks/useScrollManager";
import TabView from "components/tabBar/TabView";
import Device from "helpers/device";
import AnimatedTabBar from "components/tabBar/AnimatedTabBar";
import AnimatedNavBar from "components/tabBar/AnimatedNavBar";
import TabBarComponent from "components/tabBar/TabBar";
import AnimatedHeader from "components/tabBar/AnimatedHeader";

const headerHeight = Device.isIos() ? 330 : 300;

interface SpaceScreenProps {
  route: {
    params: {
      space: Space;
      showHeader?: boolean;
    };
  };
}

function SpaceScreen({ route }: SpaceScreenProps) {
  const space = route.params.space;
  const exploreDispatch = useExploreDispatch();
  const { colors } = useAuthState();
  const bottomSheetModalRef = useBottomSheetModalRef();
  const bottomSheetModalShowRef = useBottomSheetModalShowRef();
  const navigation = useNavigation();
  const tabs = [
    { key: "proposals", title: i18n.t("proposals") },
    { key: "about", title: i18n.t("about") },
  ];
  const { scrollY, index, setIndex, getRefForKey, ...sceneProps } =
    useScrollManager(tabs, { header: headerHeight });
  const renderScene = useCallback(
    ({ route: tab }: { route: TabRoute }) => {
      if (tab.key === "proposals") {
        return (
          <SpaceProposalsTab
            space={space}
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            {...sceneProps}
          />
        );
      } else if (tab.key === "about") {
        return (
          <SpaceAboutTab
            space={space}
            isActive={tabs[index].key === tab.key}
            routeKey={tab.key}
            scrollY={scrollY}
            headerHeight={headerHeight}
            {...sceneProps}
          />
        );
      }
    },
    [getRefForKey, index, tabs, scrollY]
  );

  useEffect(() => {
    setSpaceDetails(space.id, exploreDispatch);
  }, [space]);

  useEffect(() => {
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

  return (
    <>
      <IPhoneTopSafeAreaViewBackground />
      <SafeAreaView
        style={[common.screen, { backgroundColor: colors.bgDefault }]}
      >
        <View
          style={[
            common.headerContainer,
            {
              borderBottomColor: "transparent",
              zIndex: 200,
              backgroundColor: colors.bgDefault,
            },
          ]}
        >
          <BackButton />
          <AnimatedNavBar scrollY={scrollY} headerHeight={headerHeight}>
            <Text
              style={{
                color: colors.textColor,
                fontFamily: "Calibre-Medium",
                fontSize: 24,
              }}
            >
              {space.name}
            </Text>
          </AnimatedNavBar>
        </View>
        <AnimatedHeader scrollY={scrollY} headerHeight={headerHeight}>
          <SpaceHeader space={space} />
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
      </SafeAreaView>
    </>
  );
}

export default SpaceScreen;
