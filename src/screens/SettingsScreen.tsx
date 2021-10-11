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
import BackButton from "../components/BackButton";
import packageJson from "../../package.json";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    textAlignVertical: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    paddingHorizontal: 16,
  },
  rowTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  rowValue: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: "auto",
  },
});

function SettingsScreen() {
  const { connectedAddress } = useAuthState();
  const insets = useSafeAreaInsets();

  return (
    <View style={[{ paddingTop: insets.top }, common.screen]}>
      <BackButton />
      <View style={{ marginTop: 8, flex: 1 }}>
        <Text style={[common.headerTitle, { paddingHorizontal: 16 }]}>
          {i18n.t("settings")}
        </Text>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{i18n.t("appearance")}</Text>
          <Text style={styles.rowValue}>{i18n.t("light")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{i18n.t("version")}</Text>
          <Text style={styles.rowValue}>{packageJson.version}</Text>
        </View>
      </View>
    </View>
  );
}

export default SettingsScreen;
