import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import i18n from "i18n-js";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import UserAvatar from "./UserAvatar";
import { shorten } from "helpers/miscUtils";
import { useExploreState } from "context/exploreContext";
import colors from "constants/colors";
import { useToastShowConfig } from "constants/toast";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import WalletType from "components/wallet/WalletType";
import { ethers } from "ethers";
import { USER_PROFILE } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

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

interface ActiveAccountProps {
  address: string;
}

function ActiveAccount({ address }: ActiveAccountProps) {
  const { colors } = useAuthState();
  const { profiles } = useExploreState();
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const toastShowConfig = useToastShowConfig();
  const navigation: any = useNavigation();
  const [checksumAddress, setChecksumAddress] = useState(address);

  useEffect(() => {
    try {
      const checksumAddress = ethers.utils.getAddress(address ?? "");
      setChecksumAddress(checksumAddress);
    } catch (e) {}
  }, [address]);

  const copyToClipboard = () => {
    Clipboard.setString(checksumAddress);
    Toast.show({
      type: "default",
      text1: i18n.t("publicAddressCopiedToClipboard"),
      ...toastShowConfig,
    });
  };

  return (
    <View
      style={[
        common.justifyCenter,
        common.alignItemsCenter,
        { paddingBottom: 6, marginTop: 16, height: 160 },
      ]}
    >
      {address ? (
        <TouchableOpacity
          onPress={() => {
            navigation.push(USER_PROFILE, { address });
          }}
        >
          <UserAvatar
            size={60}
            address={address}
            key={`${address}${profile?.image}`}
          />
          <View style={{ position: "absolute", bottom: -4, right: -10 }}>
            <WalletType address={address} />
          </View>
        </TouchableOpacity>
      ) : (
        <View />
      )}
      <View
        style={[
          common.containerHorizontalPadding,
          common.justifyCenter,
          common.alignItemsCenter,
        ]}
      >
        {!isEmpty(ens) && (
          <Text style={[styles.connectedEns, { color: colors.textColor }]}>
            {ens}
          </Text>
        )}
        <TouchableOpacity onPress={copyToClipboard}>
          <View style={isEmpty(ens) ? { marginTop: 16 } : { marginTop: 8 }}>
            <Text
              style={[styles.address, { color: colors.textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {shorten(checksumAddress ?? "")}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ActiveAccount;
