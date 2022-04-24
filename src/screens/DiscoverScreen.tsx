import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import i18n from "i18n-js";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
import orderBy from "lodash/orderBy";
import { getFilteredSpaces } from "helpers/searchUtils";
import { ALL_WALLET_FOLLOWS } from "helpers/queries";
import devApolloClient from "helpers/devApolloClient";
import SpacePreview from "components/SpacePreview";
import CategoriesScrollView from "components/CategoriesScrollView";
import { useNavigation } from "@react-navigation/native";
import UserWalletPreview from "components/explore/UserWalletPreview";
import Device from "helpers/device";

async function getWallets(setWallets: (wallets: []) => void) {
  try {
    const query = {
      query: ALL_WALLET_FOLLOWS,
    };
    const result = await devApolloClient.query(query);
    setWallets(result.data.walletFollows);
  } catch (e) {}
}

function DiscoverScreen() {
  const { colors } = useAuthState();
  const { spaces } = useExploreState();
  const [filteredExplore, setFilteredExplore] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState([]);
  const navigation = useNavigation();
  const carouselRef = useRef();
  const orderedSpaces = useMemo(() => {
    const list = Object.keys(spaces)
      .map((key) => {
        return {
          id: key,
          ...spaces[key],
          followers: spaces[key].followers ?? 0,
          private: spaces[key].private ?? false,
        };
      })
      .filter((space) => !space.private);
    return orderBy(list, ["following", "followers"], ["desc", "desc"]);
  }, [spaces]);

  useEffect(() => {
    getWallets(setWallets);
  }, []);

  useEffect(() => {
    setFilteredExplore(
      getFilteredSpaces(orderedSpaces, searchValue, selectedCategory)
    );
  }, [spaces, searchValue, selectedCategory]);

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          {
            backgroundColor: colors.bgDefault,
            borderBottomWidth: 0,
          },
        ]}
      >
        <Text
          style={[
            common.screenHeaderTitle,
            {
              color: colors.textColor,
            },
          ]}
        >
          {i18n.t("discover")}
        </Text>
      </View>
      <Tabs.Container
        pagerProps={{ scrollEnabled: Device.isIos() }}
        headerContainerStyle={{
          shadowOpacity: 0,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
          elevation: 0,
        }}
        renderHeader={() => null}
        headerHeight={130}
        renderTabBar={(props) => {
          return (
            <MaterialTabBar
              {...props}
              contentContainerStyle={{ backgroundColor: colors.bgDefault }}
              tabStyle={{ backgroundColor: colors.bgDefault }}
              labelStyle={{
                fontFamily: "Calibre-Medium",
                color: colors.textColor,
                textTransform: "none",
                fontSize: 18,
              }}
              indicatorStyle={{
                backgroundColor: colors.indicatorColor,
                height: 3,
                borderBottomWidth: 0,
              }}
              inactiveColor={colors.darkGray}
              activeColor={colors.textColor}
              getLabelText={(name: any) => {
                return i18n.t(name);
              }}
            >
              {props.children}
            </MaterialTabBar>
          );
        }}
      >
        <Tabs.Tab name="spaces">
          <Tabs.FlatList
            data={filteredExplore}
            ListHeaderComponent={
              <CategoriesScrollView
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            }
            renderItem={(data: any) => {
              return <SpacePreview space={data.item} />;
            }}
            ListEmptyComponent={
              loading ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
                  <Text style={[common.subTitle, { color: colors.textColor }]}>
                    {i18n.t("noProposalsCreated")}
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              loading ? (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 24,
                    padding: 24,
                    height: 150,
                  }}
                >
                  <ActivityIndicator color={colors.textColor} size="large" />
                </View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 150,
                    backgroundColor: colors.bgDefault,
                  }}
                />
              )
            }
            onEndReachedThreshold={0.6}
          />
        </Tabs.Tab>
        <Tabs.Tab name="wallets">
          <Tabs.FlatList
            data={[]}
            ListHeaderComponent={
              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontFamily: "Calibre-Semibold",
                    fontSize: 20,
                    color: colors.textColor,
                    marginBottom: 16,
                  }}
                >
                  {i18n.t("popularWallets")}
                </Text>
                <FlatList
                  ref={carouselRef}
                  data={wallets}
                  renderItem={({ item }) => {
                    return <UserWalletPreview userData={item} />;
                  }}
                  itemWidth={200}
                  sliderWidth={Device.getDeviceWidth()}
                  enableMomentum={true}
                  loop={true}
                  decelerationRate={0.9}
                />
              </View>
            }
            renderItem={(data: any) => {
              return null;
            }}
            ListEmptyComponent={
              loading ? (
                <View />
              ) : (
                <View style={{ marginTop: 16, paddingHorizontal: 16 }}></View>
              )
            }
            ListFooterComponent={
              loading ? (
                <View
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    marginTop: 24,
                    padding: 24,
                    height: 150,
                  }}
                >
                  <ActivityIndicator color={colors.textColor} size="large" />
                </View>
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 400,
                    backgroundColor: colors.bgDefault,
                  }}
                />
              )
            }
          />
        </Tabs.Tab>
      </Tabs.Container>
    </SafeAreaView>
  );
}

export default DiscoverScreen;
