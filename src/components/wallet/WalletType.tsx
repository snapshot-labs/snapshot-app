import React from "react";
import { View, StyleSheet, Image } from "react-native";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import { addressIsSnapshotWallet } from "helpers/address";
import get from "lodash/get";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";
import walletConnectLogo from "../../images/walletConnectLogo.png";

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
});

interface WalletTypeProps {
  address: string;
  size: string;
}

function WalletType({ address, size }: WalletTypeProps) {
  const { colors, snapshotWallets, savedWallets } = useAuthState();
  const isSnapshotWallet = addressIsSnapshotWallet(address, snapshotWallets);
  const walletName: any = get(savedWallets, `${address}.name`, "");
  const isWalletConnect =
    walletName !== CUSTOM_WALLET_NAME && walletName !== SNAPSHOT_WALLET;
  const isSmall = size === "s";

  if (walletName === CUSTOM_WALLET_NAME) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isWalletConnect ? colors.white : colors.bgBlue,
            borderColor: isWalletConnect ? colors.textColor : colors.bgBlue,
            borderWidth: 1,
            width: isSmall ? 20 : 30,
            height: isSmall ? 20 : 30,
            borderRadius: isSmall ? 10 : 15,
          },
        ]}
      >
        {isWalletConnect && (
          <Image
            source={walletConnectLogo}
            style={{
              width: isSmall ? 15 : 20,
              height: isSmall ? 15 : 20,
            }}
            resizeMode="contain"
          />
        )}
        {isSnapshotWallet && (
          <IconFont
            name="snapshot"
            size={size === "s" ? 15 : 20}
            color={colors.yellow}
          />
        )}
      </View>
    </View>
  );
}

export default WalletType;
