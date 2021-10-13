import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import i18n from "i18n-js";
import common from "../../styles/common";
import colors from "../../constants/colors";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Button, { styles as buttonStyles } from "../Button";
import { explorerUrl, getChoiceString, n, shorten } from "../../util/miscUtils";
import signClient from "../../util/signClient";
import { useAuthDispatch, useAuthState } from "../../context/authContext";
import client from "../../util/snapshotClient";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("screen");

const buttonWidth = width / 2 - 32;

const styles = StyleSheet.create({
  view: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 6,
  },
  header: {
    paddingBottom: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderColor,
    flexDirection: "row",
    width,
    paddingHorizontal: 16,
  },
  mainContent: {
    marginTop: 12,
    marginHorizontal: 16,
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
  getProposal: () => void;
};

function VoteConfirmModal({
  isVisible,
  onClose,
  proposal,
  selectedChoices,
  space,
  totalScore,
  getProposal,
}: VoteConfirmModalProps) {
  const formattedChoiceString = getChoiceString(proposal, selectedChoices);
  const { connectedAddress } = useAuthState();
  const connector = useWalletConnect();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.3}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={styles.view}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[common.h3, { textAlign: "center" }]}>
            {i18n.t("confirmVote")}
          </Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: "auto" }}>
            <FontAwesome5Icon
              name="times"
              style={{ paddingRight: 16 }}
              size={20}
              color={colors.darkGray}
            />
          </TouchableOpacity>
        </View>
        <Text style={[common.h4, { paddingHorizontal: 16, paddingTop: 16 }]}>
          {i18n.t("areYouSureYouWantToVote", {
            choice: shorten(formattedChoiceString, "choice"),
          })}
        </Text>
        <Text style={[common.h4, { paddingHorizontal: 16, paddingTop: 8 }]}>
          {i18n.t("thisActionCannotBeUndone")}
        </Text>
        <View style={styles.mainContent}>
          <View style={styles.row}>
            <Text style={[styles.rowTitle, { width: 100 }]}>
              {i18n.t("optionss")}
            </Text>
            <View style={{ marginLeft: "auto" }}>
              <Text
                style={[
                  styles.rowValue,
                  { textAlign: "right", width: width / 2 },
                ]}
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
          <TouchableOpacity
            onPress={() => {
              onClose();
            }}
          >
            <View
              style={[
                buttonStyles.button,
                buttonStyles.lightButton,
                { width: buttonWidth },
              ]}
            >
              <Text
                style={[
                  buttonStyles.buttonTitle,
                  buttonStyles.lightButtonTitle,
                ]}
              >
                {i18n.t("cancel")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              if (loading) return;

              setLoading(true);

              connector.send = async (type, params) => {
                return await connector.signPersonalMessage(params);
              };

              let formattedSelectedChoices = selectedChoices;

              if (
                proposal.type === "single-choice" ||
                proposal.type === "approval"
              ) {
                formattedSelectedChoices = selectedChoices[0];
              }

              try {
                const sign = await client.broadcast(
                  connector,
                  connectedAddress,
                  space.id,
                  "vote",
                  {
                    proposal: proposal.id,
                    choice: formattedSelectedChoices,
                    metadata: {},
                  }
                );
                if (sign) {
                  Toast.show({
                    type: "customSuccess",
                    text1: i18n.t("yourVoteIsIn"),
                  });

                  getProposal();
                  onClose();
                }
              } catch (e) {
                console.log(e);
                Toast.show({
                  type: "customError",
                  text1: i18n.t("unableToCastVote"),
                });
              }

              setLoading(false);
            }}
          >
            <View
              style={[
                buttonStyles.button,
                {
                  width: buttonWidth,
                  marginLeft: 16,
                  opacity: loading || totalScore === 0 ? 0.3 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={[buttonStyles.buttonTitle]}>{i18n.t("vote")}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default VoteConfirmModal;
