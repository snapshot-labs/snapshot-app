import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { SafeAreaView } from "react-native-safe-area-context";
import { CONNECT_ACCOUNT_SCREEN, LANDING_SCREEN } from "constants/navigation";
import common from "styles/common";
import Button from "components/Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import { useExploreDispatch, useExploreState } from "context/exploreContext";
import { setProfiles } from "helpers/profile";
import ConnectedWallet from "components/ConnectedWallet";
import ActiveAccount from "components/ActiveAccount";
import IconFont from "components/IconFont";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  bottomButton: {
    position: "absolute",
    bottom: 30,
    width: width - 32,
    left: 16,
  },
});

function MoreScreen() {
  const { connectedAddress, savedWallets, wcConnector, theme, colors }: any =
    useAuthState();
  const { profiles } = useExploreState();
  const exploreDispatch = useExploreDispatch();
  const navigation: any = useNavigation();
  const authDispatch = useAuthDispatch();
  const savedWalletKeys = Object.keys(savedWallets).filter(
    (address: string) => address !== connectedAddress
  );

  useEffect(() => {
    const profilesArray = Object.keys(profiles);
    const addressArray: string[] = Object.keys(savedWallets);
    const filteredArray = addressArray.filter((address) => {
      return !profilesArray.includes(address);
    });

    if (filteredArray.length > 0) {
      setProfiles(filteredArray, exploreDispatch);
    }
  }, [connectedAddress]);

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <ScrollView style={{ flex: 1 }}>
        <View style={[common.headerContainer, { borderBottomWidth: 0 }]}>
          <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
            {i18n.t("account")}
          </Text>

          <TouchableOpacity
            onPress={() => {
              authDispatch({
                type: AUTH_ACTIONS.SET_THEME,
                payload: theme === "light" ? "dark" : "light",
              });
            }}
            style={[{ marginLeft: "auto" }, common.containerHorizontalPadding]}
          >
            <IconFont
              name={theme === "light" ? "moon" : "sun"}
              size={30}
              color={colors.textColor}
            />
          </TouchableOpacity>
        </View>
        <ActiveAccount address={connectedAddress} />
        {savedWalletKeys.map((address: string) => {
          return <ConnectedWallet address={address} key={address} />;
        })}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(CONNECT_ACCOUNT_SCREEN);
          }}
        >
          <View style={{ marginTop: 24, paddingLeft: 16 }}>
            <Text style={[common.h4, { color: colors.textColor }]}>
              {i18n.t("addWallet")}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.bottomButton}>
        <Button
          onPress={async () => {
            try {
              await wcConnector.killSession();
            } catch (e) {}
            authDispatch({
              type: AUTH_ACTIONS.LOGOUT,
            });
            navigation.reset({
              index: 0,
              routes: [{ name: LANDING_SCREEN }],
            });
          }}
          title={i18n.t("logout")}
        />
      </View>
    </SafeAreaView>
  );
}

export default MoreScreen;
