import React, { useMemo } from "react";
import makeBlockie from "ethereum-blockies-base64";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import get from "lodash/get";
import colors from "../constants/colors";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import UserAvatar from "./UserAvatar";
import { shorten } from "../util/miscUtils";
import storage from "../util/storage";
import { useExploreState } from "../context/exploreContext";

const styles = StyleSheet.create({
  connectedAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
  },
  ens: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 8,
  },
});

type ConnectedWalletProps = {
  address: string;
};

function ConnectedWallet({ address }: ConnectedWalletProps) {
  const { savedWallets }: any = useAuthState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const blockie = useMemo(
    () => (address ? makeBlockie(address) : null),
    [address]
  );
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const walletName = get(savedWallets, `${address}.name`);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      key={address}
      onPress={() => {
        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: address,
            addToStorage: true,
            isWalletConnect: walletName !== "Custom Wallet",
          },
        });
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.borderColor,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <UserAvatar size={40} address={address} imgSrc={profile?.image} />
        <View style={styles.connectedAddressContainer}>
          <View>
            {ens !== undefined && ens !== "" && (
              <Text style={styles.ens}>{ens}</Text>
            )}
            <Text style={styles.address} numberOfLines={1} ellipsizeMode="tail">
              {shorten(address ?? "")}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            const newSavedWallets = { ...savedWallets };
            delete newSavedWallets[address];
            authDispatch({
              type: AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS,
              payload: newSavedWallets,
            });
            storage.save(
              storage.KEYS.savedWallets,
              JSON.stringify(newSavedWallets)
            );
          }}
          style={{ marginLeft: 8 }}
        >
          <FontAwesome5Icon name="times" size={20} color={colors.textColor} />
        </TouchableOpacity>
      </View>
    </TouchableHighlight>
  );
}

export default ConnectedWallet;
