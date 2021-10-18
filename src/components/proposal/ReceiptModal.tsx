import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import Modal from "react-native-modal";
import i18n from "i18n-js";
import common from "../../styles/common";
import colors from "../../constants/colors";
import IconFont from "../IconFont";
import Button from "../Button";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 6,
  },
  header: {
    paddingBottom: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
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
  isVisible: boolean;
  onClose: () => void;
  authorIpfsHash: string;
};

function ReceiptModal({
  isVisible,
  onClose,
  authorIpfsHash = "",
}: ReceiptModalProps) {
  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <IconFont
              name="close"
              style={{ marginLeft: "auto", paddingRight: 16 }}
              size={20}
              color={colors.darkGray}
            />
          </TouchableOpacity>
          <Text style={[common.h3, { textAlign: "center" }]}>
            {i18n.t("receipt")}
          </Text>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.authorTitle}>{i18n.t("author")}</Text>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(getUrl(authorIpfsHash));
            }}
            style={{ marginLeft: "auto" }}
          >
            <View style={styles.authorContainer}>
              <Text style={styles.author}>#{authorIpfsHash.slice(0, 7)}</Text>
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
            light
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
    </Modal>
  );
}

export default ReceiptModal;
