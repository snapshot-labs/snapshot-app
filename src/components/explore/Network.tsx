import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import i18n from "i18n-js";
import colors from "../../constants/colors";
import { n } from "../../helpers/miscUtils";
import { NetworkType, Space } from "../../types/explore";
import common from "../../styles/common";
import { useNavigation } from "@react-navigation/native";
import { NETWORK_SCREEN } from "../../constants/navigation";
import { useAuthState } from "context/authContext";

const isIOS = Platform.OS === "ios";

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryText: {
    fontFamily: "Calibre-Medium",
    color: colors.darkGray,
    fontSize: 18,
  },
});

function getLogoUrl(key: string) {
  return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${key}.png`;
}

type NetworkProps = {
  network: NetworkType;
  orderedSpaces: Space[];
};

function Network({ network, orderedSpaces }: NetworkProps) {
  const navigation: any = useNavigation();
  const { colors } = useAuthState();
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(NETWORK_SCREEN, {
          networkName: network.name,
          networkId: network.key,
          orderedSpaces,
        });
      }}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Image
            source={{ uri: getLogoUrl(network.key) }}
            style={{ width: 24, height: 24, borderRadius: 12, marginRight: 4 }}
          />
          <Text
            style={[
              common.h4,
              { marginTop: isIOS ? 4 : 0, color: colors.textColor },
            ]}
          >
            {network.name}
          </Text>
          <Text
            style={[
              styles.secondaryText,
              { marginLeft: 4, marginTop: isIOS ? 4 : 0 },
            ]}
          >
            {network.key}
          </Text>
        </View>
        <Text style={[styles.secondaryText, { marginTop: 6 }]}>
          {i18n.t("inSpaces", { spaceCount: n(network.spaces) })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default Network;
