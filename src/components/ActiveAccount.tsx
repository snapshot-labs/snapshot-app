import React, { useEffect, useState } from "react";
import { Text, View, TouchableWithoutFeedback, StyleSheet } from "react-native";
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
import appConstants from "constants/app";
import { getUserProfile } from "helpers/profile";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamsList } from "types/navigationTypes";

const styles = StyleSheet.create({
  connectedEns: {
    color: colors.textColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 22,
    marginTop: 9,
  },
  address: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  addressContainer: {
    borderRadius: 4,
    marginTop: 9,
    padding: 4,
  },
});

interface ActiveAccountProps {
  address: string;
}

function ActiveAccount({ address = "" }: ActiveAccountProps) {
  const { colors } = useAuthState();
  const { profiles } = useExploreState();
  const profile = getUserProfile(address, profiles);
  const ens = get(profile, "ens", undefined);
  const toastShowConfig = useToastShowConfig();
  const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();
  const [checksumAddress, setChecksumAddress] = useState(shorten(address));

  useEffect(() => {
    try {
      const checksumAddress = ethers.utils.getAddress(address ?? "");
      const shortenedAddress = shorten(checksumAddress ?? "");
      setChecksumAddress(shortenedAddress);
    } catch (e) {
      setChecksumAddress(address);
    }
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
        { paddingBottom: 6, marginTop: 16 },
      ]}
    >
      {address ? (
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.push(USER_PROFILE, { address });
          }}
        >
          <View>
            <UserAvatar
              size={60}
              address={address}
              key={`${address}${profile?.image}`}
            />
            <View style={{ position: "absolute", bottom: -4, right: -10 }}>
              <WalletType address={address} />
            </View>
          </View>
        </TouchableWithoutFeedback>
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
        <Text style={[styles.connectedEns, { color: colors.textColor }]}>
          {isEmpty(ens) ? checksumAddress : ens}
        </Text>
        <TouchableWithoutFeedback onPress={copyToClipboard}>
          <View
            style={[
              styles.addressContainer,
              { backgroundColor: colors.navBarBg },
            ]}
          >
            <Text
              style={[styles.address, { color: colors.secondaryGray }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {address?.toLowerCase() ===
              appConstants.ANONYMOUS_ADDRESS.toLowerCase()
                ? i18n.t("anonymous")
                : checksumAddress}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

export default ActiveAccount;
