import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import i18n from "i18n-js";
import common from "../../styles/common";
import colors from "../../constants/colors";
import IconFont from "../IconFont";
import Button from "../Button";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { useAuthState } from "context/authContext";

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
  view: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: colors.bgDefault,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    width,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  mainContent: {
    marginTop: 24,
    marginHorizontal: 24,
    padding: 24,
    borderColor: colors.borderColor,
    borderWidth: 1,
    flexDirection: "row",
    borderRadius: 6,
  },
  authorTitle: {
    color: colors.darkGray,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
  },
  authorContainer: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  author: {
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
    fontSize: 18,
  },
  buttonContainer: {
    margin: 24,
  },
});

type ReceiptModalProps = {
  onClose: () => void;
  authorIpfsHash: string;
};

function ReceiptModal({ onClose, authorIpfsHash = "" }: ReceiptModalProps) {
  const { colors, theme } = useAuthState();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgDefault },
        theme === "dark"
          ? {
              borderLeftWidth: 0,
              borderRightWidth: 0,
            }
          : {},
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Text
          style={[common.h3, { textAlign: "center", color: colors.textColor }]}
        >
          {i18n.t("receipt")}
        </Text>
        <TouchableOpacity onPress={onClose} style={{ marginLeft: "auto" }}>
          <IconFont
            name="close"
            style={{ marginLeft: "auto", paddingRight: 16 }}
            size={20}
            color={colors.darkGray}
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.mainContent, { borderColor: colors.borderColor }]}>
        <Text style={[styles.authorTitle, { color: colors.textColor }]}>
          {i18n.t("author")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Linking.openURL(getUrl(authorIpfsHash));
          }}
          style={{ marginLeft: "auto" }}
        >
          <View style={styles.authorContainer}>
            <Text style={[styles.author, { color: colors.textColor }]}>
              #{authorIpfsHash.slice(0, 7)}
            </Text>
            <IconFont
              name="external-link"
              style={{ marginLeft: 8, marginBottom: 6 }}
              size={18}
              color={colors.darkGray}
            />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => {
            Linking.openURL("https://app.mycrypto.com/verify-message");
          }}
          title={i18n.t("verifyReceiptOnMyCrypto")}
          Icon={() => {
            return (
              <IconFont
                name="external-link"
                style={{ marginLeft: 4 }}
                size={20}
                color={colors.darkGray}
              />
            );
          }}
        />
      </View>
    </View>
  );
}

export default ReceiptModal;
