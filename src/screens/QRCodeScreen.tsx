import React, { useState, useEffect, useCallback, useRef } from "react";
import { Alert, InteractionManager, Text, View } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import common from "../styles/common";
import Button from "../components/Button";
import { useAuthDispatch, useAuthState } from "context/authContext";
import BackButton from "components/BackButton";
import { failedSeedPhraseRequirements } from "helpers/validators";
import { isValidMnemonic } from "ethers/lib/utils";
import { useEngineState } from "context/engineContext";
import { parse } from "eth-url-parser";

interface QRCodeScreenProps {
  route: {
    params: {
      onScanError: (error: string) => void;
      onScanSuccess: (data: any, content?: any) => void;
      onStartScan: (data: any) => void;
    };
  };
}

function QRCodeScreen({ route }: QRCodeScreenProps) {
  const { keyRingController } = useEngineState();
  const { colors } = useAuthState();
  const { onScanError, onScanSuccess, onStartScan } = route.params;
  const [hasPermission, setHasPermission] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation: any = useNavigation();
  const mountedRef = useRef(true);
  const shouldReadBarCodeRef = useRef(true);

  const end = useCallback(() => {
    mountedRef.current = false;
    navigation.goBack();
  }, [mountedRef, navigation]);

  const onBarCodeRead = useCallback(
    (response) => {
      const content = response.data;
      /**
       * Barcode read triggers multiple times
       * shouldReadBarCodeRef controls how often the logic below runs
       * Think of this as a allow or disallow bar code reading
       */
      if (!shouldReadBarCodeRef.current || !mountedRef.current || !content) {
        return;
      }

      let data = {};

      if (content.split("metamask-sync:").length > 1) {
        shouldReadBarCodeRef.current = false;
        data = { content };
        if (onStartScan) {
          onStartScan(data).then(() => {
            onScanSuccess(data);
          });
          mountedRef.current = false;
        } else {
          Alert.alert(
            i18n.t("qr_scanner.error"),
            i18n.t("qr_scanner.attempting_sync_from_wallet_error")
          );
          mountedRef.current = false;
        }
      } else {
        if (
          !failedSeedPhraseRequirements(content) &&
          isValidMnemonic(content)
        ) {
          shouldReadBarCodeRef.current = false;
          data = { seed: content };
          end();
          onScanSuccess(data, content);
          return;
        }

        const isUnlocked = keyRingController.isUnlocked();

        if (!isUnlocked) {
          navigation.goBack();
          Alert.alert(
            i18n.t("qr_scanner.error"),
            i18n.t("qr_scanner.attempting_to_scan_with_wallet_locked")
          );
          mountedRef.current = false;
          return;
        }
        // Let ethereum:address go forward
        if (
          content.split("ethereum:").length > 1 &&
          !parse(content).function_name
        ) {
          shouldReadBarCodeRef.current = false;
          data = parse(content);
          const action = "send-eth";
          data = { ...data, action };
          end();
          onScanSuccess(data, content);
          return;
        }

        if (
          content.length === 64 ||
          (content.substring(0, 2).toLowerCase() === "0x" &&
            content.length === 66)
        ) {
          shouldReadBarCodeRef.current = false;
          data = {
            private_key: content.length === 64 ? content : content.substr(2),
          };
        } else if (content.substring(0, 2).toLowerCase() === "0x") {
          shouldReadBarCodeRef.current = false;
          data = { target_address: content, action: "send-eth" };
        } else if (content.split("wc:").length > 1) {
          shouldReadBarCodeRef.current = false;
          data = { walletConnectURI: content };
        } else {
          // EIP-945 allows scanning arbitrary data
          data = content;
        }
        onScanSuccess(data, content);
      }

      end();
    },
    [onStartScan, end, mountedRef, navigation, onScanSuccess]
  );

  const onError = useCallback(
    (error) => {
      navigation.goBack();
      InteractionManager.runAfterInteractions(() => {
        if (onScanError && error) {
          onScanError(error.message);
        }
      });
    },
    [onScanError, navigation]
  );

  const onStatusChange = useCallback(
    (event) => {
      if (event.cameraStatus === "NOT_AUTHORIZED") {
        navigation.goBack();
      }
    },
    [navigation]
  );

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={[{ paddingTop: insets.top }, common.screen]}>
        <Text
          style={[common.subTitle, { marginTop: 24, paddingHorizontal: 16 }]}
        >
          {i18n.t("requestingForCameraPermission")}
        </Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View
        style={[
          common.screen,
          {
            paddingTop: insets.top,
            paddingHorizontal: 16,
            backgroundColor: colors.bgDefault,
          },
        ]}
      >
        <Text
          style={[common.subTitle, { marginTop: 24, color: colors.textColor }]}
        >
          {i18n.t("noAccessToCamera")}
        </Text>
        <View style={{ marginTop: 50 }}>
          <Button
            onPress={async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === "granted");
            }}
            title={i18n.t("requestAccessToCamera")}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        common.screen,
        { paddingTop: insets.top, backgroundColor: colors.bgDefault },
      ]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("scanQRCode")} />
      </View>
      <BarCodeScanner
        onBarCodeScanned={onBarCodeRead}
        style={common.screen}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
    </View>
  );
}

export default QRCodeScreen;
