import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { util } from "@metamask/controllers";
import fontStyles from "styles/fonts";
import { useAuthState } from "context/authContext";
import TransactionHeader from "components/wallet/TransactionHeader";
import i18n from "i18n-js";
import Ionicons from "react-native-vector-icons/Ionicons";
import IconFont from "components/IconFont";
import common from "styles/common";
import get from "lodash/get";
import { useExploreState } from "context/exploreContext";
import UserAvatar from "components/UserAvatar";
import { shorten } from "helpers/miscUtils";
import colors from "constants/colors";
import isObject from "lodash/isObject";
import Button from "components/Button";

const styles = StyleSheet.create({
  messageText: {
    fontSize: 18,
    ...fontStyles.normal,
  },
  textLeft: {
    textAlign: "left",
  },
  messageWrapper: {
    marginBottom: 4,
  },
  readMore: {
    fontSize: 18,
    ...fontStyles.bold,
  },
  arrowIconWrapper: {
    flexGrow: 1,
    alignItems: "flex-end",
  },
  messageColumn: {
    width: "75%",
    justifyContent: "space-between",
  },
  messageLabelText: {
    ...fontStyles.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  children: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
  },
  messageTextContainer: {
    flexDirection: "row",
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  signingTitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  accountInformation: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  address: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  ens: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 20,
    marginLeft: 8,
  },
  signButtonContainer: {
    marginTop: 16,
  },
});

interface SignModalProps {
  messageParamsData: any;
  onSign: () => void;
  onClose: () => void;
}

function SignModal({ messageParamsData, onSign, onClose }: SignModalProps) {
  const { colors, connectedAddress } = useAuthState();
  const { profiles } = useExploreState();
  const [truncateMessage, setTruncateMessage] = useState(false);
  const [showExpandedMessage, setShowExpandedMessage] = useState(false);
  const profile = profiles[connectedAddress ?? ""];
  const ens = get(profile, "ens", undefined);
  const [loading, setLoading] = useState(false);

  function renderMessageText() {
    const messageText = [];
    for (let key in messageParamsData) {
      if (key === "id" || key === "metamaskId") {
        continue;
      } else {
        const value = messageParamsData[key];
        let formattedValue = "";
        try {
          formattedValue = isObject(value) ? JSON.stringify(value) : value;
        } catch (e) {}

        messageText.push(
          <View key={key} style={styles.messageTextContainer}>
            <Text
              style={[styles.messageLabelText, { color: colors.textColor }]}
            >
              {key}:{" "}
            </Text>
            <Text style={[styles.messageText, { color: colors.textColor }]}>
              {formattedValue}
            </Text>
          </View>
        );
      }
    }
    return messageText;
  }

  return (
    <View>
      <View
        style={[
          common.modalHeader,
          {
            borderBottomColor: colors.borderColor,
            marginBottom: 16,
          },
        ]}
      >
        <Text
          style={[common.h3, { textAlign: "center", color: colors.textColor }]}
        >
          {i18n.t("signature_request.signing")}
        </Text>

        <TouchableOpacity
          onPress={() => {
            onClose();
          }}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <TransactionHeader title="snapshot.org" />
      <View style={styles.messageContainer}>
        <View
          style={[
            styles.accountInformation,
            { borderColor: colors.borderColor },
          ]}
        >
          <UserAvatar
            size={40}
            address={connectedAddress ?? ""}
            imgSrc={profile?.image}
            key={`${connectedAddress}${profile?.image}`}
          />
          {ens !== undefined && ens !== "" && (
            <Text style={[styles.ens, { color: colors.textColor }]}>{ens}</Text>
          )}
          <Text
            style={[styles.address, { color: colors.textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {shorten(connectedAddress ?? "")}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.children, { borderColor: colors.borderColor }]}
          onPress={
            truncateMessage
              ? () => {
                  setShowExpandedMessage(!showExpandedMessage);
                }
              : () => {}
          }
        >
          <View style={styles.messageColumn}>
            <Text
              style={[styles.messageLabelText, { color: colors.textColor }]}
            >
              {i18n.t("signature_request.message")}:
            </Text>
            <View style={styles.messageWrapper}>{renderMessageText()}</View>
            {truncateMessage ? (
              <Text style={[styles.readMore, { color: colors.bgBlue }]}>
                {i18n.t("signature_request.read_more")}
              </Text>
            ) : (
              <View />
            )}
          </View>
          <View style={styles.arrowIconWrapper}>
            {truncateMessage ? (
              <View style={styles.arrowIconWrapper}>
                <Ionicons
                  name={"ios-arrow-forward"}
                  size={20}
                  color={colors.darkGray}
                />
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <View style={styles.signButtonContainer}>
          <Button
            onPress={async () => {
              setLoading(true);
              await onSign();
              setLoading(false);
            }}
            title={i18n.t("signature_request.sign")}
            loading={loading}
          />
        </View>
      </View>
    </View>
  );
}

export default SignModal;
