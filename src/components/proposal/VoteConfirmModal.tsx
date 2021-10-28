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
import i18n from "i18n-js";
import common from "styles/common";
import Toast from "react-native-toast-message";
import colors from "constants/colors";
import IconFont from "../IconFont";
import { styles as buttonStyles } from "../Button";
import { explorerUrl, getChoiceString, n, shorten } from "helpers/miscUtils";
import { useAuthState } from "context/authContext";
import client from "../../helpers/snapshotClient";
import { useToastShowConfig } from "constants/toast";

const { width } = Dimensions.get("screen");

const buttonWidth = width / 2 - 32;

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
    marginTop: 18,
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
  onClose: () => void;
  proposal: any;
  selectedChoices: any;
  space: any;
  totalScore: number;
  getProposal: () => void;
};

function VoteConfirmModal({
  onClose,
  proposal,
  selectedChoices,
  space,
  totalScore,
  getProposal,
}: VoteConfirmModalProps) {
  const formattedChoiceString = getChoiceString(proposal, selectedChoices);
  const { connectedAddress, wcConnector, isWalletConnect, colors, theme } =
    useAuthState();
  const [loading, setLoading] = useState<boolean>(false);
  const toastShowConfig = useToastShowConfig();

  return (
    <View style={[styles.container, { backgroundColor: colors.bgDefault }]}>
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text
          style={[common.h3, { textAlign: "center", color: colors.textColor }]}
        >
          {i18n.t("confirmVote")}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setLoading(false);
            onClose();
          }}
          style={{ marginLeft: "auto" }}
        >
          <IconFont name="close" size={20} color={colors.darkGray} />
        </TouchableOpacity>
      </View>
      <Text
        style={[
          common.h4,
          { paddingHorizontal: 16, paddingTop: 16, color: colors.textColor },
        ]}
      >
        {i18n.t("areYouSureYouWantToVote", {
          choice: shorten(formattedChoiceString, "choice"),
        })}
      </Text>
      <Text
        style={[
          common.h4,
          { paddingHorizontal: 16, paddingTop: 8, color: colors.textColor },
        ]}
      >
        {i18n.t("thisActionCannotBeUndone")}
      </Text>
      <View style={[styles.mainContent, { borderColor: colors.borderColor }]}>
        <View style={styles.row}>
          <Text
            style={[styles.rowTitle, { width: 100, color: colors.textColor }]}
          >
            {i18n.t("optionss")}
          </Text>
          <View style={{ marginLeft: "auto" }}>
            <Text
              style={[
                styles.rowValue,
                {
                  textAlign: "right",
                  width: width / 2,
                  color: colors.textColor,
                },
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
              <Text style={[styles.rowValue, { color: colors.textColor }]}>
                {n(proposal.snapshot, "0,0")}
              </Text>
              <IconFont
                name="external-link"
                size={18}
                color={colors.darkGray}
                style={{ marginLeft: 6 }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{i18n.t("yourVotingPower")}</Text>
          <Text style={[styles.rowValue, { color: colors.textColor }]}>
            {n(totalScore)} {shorten(space.symbol, "symbol")}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            setLoading(false);
            onClose();
          }}
        >
          <View
            style={[
              buttonStyles.button,
              { width: buttonWidth, borderColor: colors.borderColor },
            ]}
          >
            <Text
              style={[buttonStyles.buttonTitle, { color: colors.textColor }]}
            >
              {i18n.t("cancel")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (loading || !isWalletConnect || totalScore === 0) return;

            setLoading(true);

            //@ts-ignore
            wcConnector.send = async (type, params) => {
              return await wcConnector.signPersonalMessage(params);
            };

            let formattedSelectedChoices = selectedChoices;

            if (proposal.type === "single-choice") {
              formattedSelectedChoices = selectedChoices[0];
            }

            try {
              const sign = await client.broadcast(
                wcConnector,
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
                  ...toastShowConfig,
                });

                getProposal();
                onClose();
              }
            } catch (e) {
              console.log(e);
              Toast.show({
                type: "customError",
                text1: i18n.t("unableToCastVote"),
                ...toastShowConfig,
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
                opacity:
                  !isWalletConnect || loading || totalScore === 0 ? 0.3 : 1,
                borderColor: colors.textColor,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textColor} />
            ) : (
              <Text
                style={[buttonStyles.buttonTitle, { color: colors.textColor }]}
              >
                {i18n.t("vote")}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default VoteConfirmModal;
