import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import i18n from "i18n-js";
import common from "../../styles/common";
import colors from "../../constants/colors";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Button from "../Button";
import { getUrl } from "@snapshot-labs/snapshot.js/src/utils";
import { explorerUrl, getChoiceString, n, shorten } from "../../util/miscUtils";

const { width } = Dimensions.get("screen");

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
    marginTop: 12,
    marginHorizontal: 24,
    padding: 24,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  buttonContainer: {
    marginVertical: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  rowTitle: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    color: colors.darkGray,
  },
  rowValue: {
    marginLeft: "auto",
    fontSize: 18,
    color: colors.textColor,
    fontFamily: "Calibre-Medium",
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
});

type VoteConfirmModalProps = {
  isVisible: boolean;
  onClose: () => void;
  proposal: any;
  selectedChoices: any;
  space: any;
  totalScore: number;
};

function VoteConfirmModal({
  isVisible,
  onClose,
  proposal,
  selectedChoices,
  space,
  totalScore,
}: VoteConfirmModalProps) {
  const formattedChoiceString = getChoiceString(proposal, selectedChoices);
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
            <FontAwesome5Icon
              name="times"
              style={{ marginLeft: "auto", paddingRight: 16 }}
              size={20}
              color={colors.darkGray}
            />
          </TouchableOpacity>
          <Text style={[common.h3, { textAlign: "center" }]}>
            {i18n.t("confirmVote")}
          </Text>
        </View>
        <Text
          style={[
            common.h4,
            { paddingHorizontal: 16, paddingTop: 16, textAlign: "center" },
          ]}
        >
          {i18n.t("areYouSureYouWantToVote", {
            choice: shorten(formattedChoiceString, "choice"),
          })}
        </Text>
        <Text style={[common.h4, { textAlign: "center", paddingTop: 8 }]}>
          {i18n.t("thisActionCannotBeUndone")}
        </Text>
        <View style={styles.mainContent}>
          <View style={styles.row}>
            <Text style={[styles.rowTitle, { width: 100 }]}>
              {i18n.t("optionss")}
            </Text>
            <View style={{ marginLeft: "auto" }}>
              <Text
                style={[styles.rowValue, { textAlign: "right", width: 150 }]}
              >
                {formattedChoiceString}
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Snapshot</Text>
            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              onPress={() => {
                const url = explorerUrl(
                  space.network,
                  proposal.snapshot,
                  "block"
                );
                Linking.openURL(url);
              }}
            >
              <View style={styles.linkContainer}>
                <Text style={styles.rowValue}>
                  {n(proposal.snapshot, "0,0")}
                </Text>
                <FontAwesome5Icon
                  name="external-link-alt"
                  size={16}
                  color={colors.darkGray}
                  style={{ marginLeft: 6 }}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{i18n.t("yourVotingPower")}</Text>
            <Text style={styles.rowValue}>
              {n(totalScore)} {shorten(space.symbol, "symbol")}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={() => {
              onClose();
            }}
            title={i18n.t("cancel")}
            light
            buttonContainerStyle={{ width: width / 3 }}
          />
          <Button
            onPress={() => {
              Linking.openURL("https://app.mycrypto.com/verify-message");
            }}
            title={i18n.t("vote")}
            buttonContainerStyle={{
              width: width / 3,
              marginLeft: totalScore === 0 ? "auto" : 20,
            }}
            disabled={totalScore === 0}
          />
        </View>
      </View>
    </Modal>
  );
}

export default VoteConfirmModal;
