import React, { useEffect } from "react";
import IPhoneTopSafeAreaViewBackground from "components/IPhoneTopSafeAreaViewBackground";
import { SafeAreaView } from "react-native-safe-area-context";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import { BackHandler, View } from "react-native";
import { Tabs } from "react-native-collapsible-tab-view";
import SpaceHeader from "components/space/SpaceHeader";
import { Space } from "types/explore";
import { setSpaceDetails } from "helpers/voting/spaceUtils";
import { useExploreDispatch } from "context/exploreContext";
import SpaceProposalsTab from "components/space/SpaceProposalsTab";
import BaseTabBar from "components/tabBar/BaseTabBar";
import SpaceAboutTab from "components/space/SpaceAboutTab";
import {
  useBottomSheetModalRef,
  useBottomSheetModalShowRef,
} from "context/bottomSheetModalContext";
import { useNavigation } from "@react-navigation/core";

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
        </View>
        <Tabs.Container
          headerContainerStyle={[
            common.tabBarContainer,
            { borderBottomColor: colors.borderColor },
          ]}
          renderHeader={() => {
            return <SpaceHeader space={space} />;
          }}
          renderTabBar={(props) => {
            return <BaseTabBar {...props} />;
          }}
        >
          <Tabs.Tab name="proposals">
            <SpaceProposalsTab space={space} />
          </Tabs.Tab>
          <Tabs.Tab name="about">
            <Tabs.ScrollView>
              <View
                style={[
                  common.containerHorizontalPadding,
                  { paddingVertical: 22 },
                ]}
              >
                <SpaceAboutTab space={space} />
              </View>
            </Tabs.ScrollView>
          </Tabs.Tab>
        </Tabs.Container>
      </SafeAreaView>
    </>
  );
}

export default SpaceScreen;
