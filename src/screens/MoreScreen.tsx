import React from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LANDING_SCREEN } from "../constants/navigation";
import common from "../styles/common";
import Button from "../components/Button";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import colors from "../constants/colors";
import { explorerUrl, shorten } from "../util/miscUtils";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  connectedAddressContainer: {
    flexDirection: "row",
    marginTop: 24,
    alignItems: "center",
    textAlignVertical: "center",
  },
  connectedAddress: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    width: width - 60,
  },
  bottomButton: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    left: 16,
  },
});

function MoreScreen() {
  const { connectedAddress } = useAuthState();
  const connector = useWalletConnect();
  const navigation: any = useNavigation();
  const insets = useSafeAreaInsets();
  const authDispatch = useAuthDispatch();

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <View style={{ paddingHorizontal: 16, marginTop: 24, flex: 1 }}>
        <Text style={common.headerTitle}>{i18n.t("account")}</Text>
        <TouchableOpacity
          onPress={() => {
            const url = explorerUrl("1", connectedAddress ?? "");
            Linking.openURL(url);
          }}
        >
          <View style={styles.connectedAddressContainer}>
            <Text
              style={styles.connectedAddress}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {connectedAddress}
            </Text>
            <FontAwesome5Icon
              name="external-link-alt"
              style={{
                marginLeft: 8,
                marginBottom: Platform.OS === "ios" ? 7 : 0,
              }}
              size={14}
              color={colors.darkGray}
            />
          </View>
        </TouchableOpacity>
        <View style={styles.bottomButton}>
          <Button
            onPress={async () => {
              try {
                await connector.killSession();
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
      </View>
    </View>
  );
}

export default MoreScreen;
