import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import tailwind from "tailwind-rn";
import i18n from "i18n-js";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import UserAvatar from "./UserAvatar";
import { explorerUrl, shorten } from "../helpers/miscUtils";
import { useExploreState } from "context/exploreContext";
import colors from "constants/colors";
import { useToastShowConfig } from "constants/toast";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  connectedEns: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 24,
    marginTop: 16,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
  },
});

type ActiveAccountProps = {
  address: string;
};

function ActiveAccount({ address }: ActiveAccountProps) {
  const { colors } = useAuthState();
  const { profiles } = useExploreState();
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const toastShowConfig = useToastShowConfig();

  const copyToClipboard = () => {
    Clipboard.setString(address);
    Toast.show({
      type: "default",
      text1: i18n.t("publicAddressCopiedToClipboard"),
      ...toastShowConfig,
    });
  };

  return (
    <View style={tailwind("justify-center items-center pb-6 h-32")}>
      {address ? (
        <TouchableOpacity
          onPress={() => {
            const url = explorerUrl("1", address);
            Linking.openURL(url);
          }}
        >
          <UserAvatar
            size={60}
            address={address}
            imgSrc={profile?.image}
            key={`${address}${profile?.image}`}
          />
        </TouchableOpacity>
      ) : (
        <View />
      )}
      <View style={tailwind("h-16 justify-center items-center")}>
        {!isEmpty(ens) && (
          <Text style={[styles.connectedEns, { color: colors.textColor }]}>
            {ens}
          </Text>
        )}
        <TouchableOpacity onPress={copyToClipboard}>
          <View style={tailwind(isEmpty(ens) ? "mt-4" : "mt-1")}>
            <Text
              style={[styles.address, { color: colors.textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shorten(address ?? "")}
            </Text>
          </View>
        </TouchableOpacity>
        {isEmpty(ens) && <Text style={styles.connectedEns}> </Text>}
      </View>
    </View>
  );
}

export default ActiveAccount;
