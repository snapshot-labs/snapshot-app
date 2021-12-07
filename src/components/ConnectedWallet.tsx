import React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import IconFont from "./IconFont";
import get from "lodash/get";
import colors, { getColors } from "../constants/colors";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "../context/authContext";
import UserAvatar from "./UserAvatar";
import { shorten } from "../helpers/miscUtils";
import storage from "../helpers/storage";
import { useExploreState } from "../context/exploreContext";
import { getAliasWallet } from "../helpers/aliasUtils";

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
  const { savedWallets, aliases, colors }: any = useAuthState();
  const { profiles } = useExploreState();
  const authDispatch = useAuthDispatch();
  const profile = profiles[address];
  const ens = get(profile, "ens", undefined);
  const walletName = get(savedWallets, `${address}.name`);

  return (
    <TouchableHighlight
      underlayColor={colors.highlightColor}
      key={address}
      onPress={() => {
        const walletProfile = savedWallets[address];
        authDispatch({
          type: AUTH_ACTIONS.SET_CONNECTED_ADDRESS,
          payload: {
            connectedAddress: address,
            addToStorage: true,
            isWalletConnect: walletName !== "Custom Wallet",
          },
        });

        if (walletName !== "Custom Wallet" && walletProfile) {
          authDispatch({
            type: AUTH_ACTIONS.SET_WC_CONNECTOR,
            payload: {
              androidAppUrl: walletProfile?.androidAppUrl,
              session: walletProfile?.session,
              walletService: walletProfile?.walletService,
            },
          });

          authDispatch({
            type: AUTH_ACTIONS.SET_ALIAS_WALLET,
            payload: aliases[address] ? getAliasWallet(aliases[address]) : null,
          });
        }
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
        <UserAvatar
          size={40}
          address={address}
          imgSrc={profile?.image}
          key={`${address}${profile?.image}`}
        />
        <View style={styles.connectedAddressContainer}>
          <View>
            {ens !== undefined && ens !== "" && (
              <Text style={[styles.ens, { color: colors.textColor }]}>
                {ens}
              </Text>
            )}
            <Text
              style={[styles.address, { color: colors.textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
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
          <IconFont name="close" size={20} color={colors.textColor} />
        </TouchableOpacity>
      </View>
    </TouchableHighlight>
  );
}

export default ConnectedWallet;
