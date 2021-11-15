import React from "react";
import { Platform, Text, TouchableHighlight, View } from "react-native";
import common from "../../styles/common";
import i18n from "i18n-js";
import Modal from "react-native-modal";
import proposal from "../../constants/proposal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../BackButton";
import { useAuthState } from "context/authContext";

type VotingTypeModalProps = {
  isVisible: boolean;
  onClose: () => void;
  setVotingType: (votingType: { key: string; text: string }) => void;
  addAny?: boolean;
};

function VotingTypeModal({
  isVisible,
  onClose,
  setVotingType,
  addAny = false,
}: VotingTypeModalProps) {
  const { colors } = useAuthState();
  const votingTypes = proposal.getVotingTypes();
  const anyVotingType = {
    key: "any",
    text: i18n.t("any"),
    description: "",
  };
  const insets = useSafeAreaInsets();

  if (addAny) {
    votingTypes.unshift(anyVotingType);
  }

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={[
        common.screen,
        common.fullScreenModal,
        {
          paddingTop: insets.top,
          backgroundColor: colors.bgDefault,
        },
      ]}
      coverScreen
    >
      <View
        style={[
          common.headerContainer,
          {
            justifyContent: "space-between",
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <Text style={[common.screenHeaderTitle, { color: colors.textColor }]}>
          {i18n.t("selectVotingSystem")}
        </Text>
        <BackButton
          backIcon="close"
          onPress={onClose}
          backIconStyle={{
            marginBottom: Platform.OS === "ios" ? 6 : 0,
          }}
        />
      </View>
      {votingTypes.map((votingType) => {
        return (
          <TouchableHighlight
            underlayColor={colors.highlightColor}
            onPress={() => {
              setVotingType(votingType);
              onClose();
            }}
            key={votingType.key}
          >
            <View
              style={[
                common.containerVerticalPadding,
                common.containerHorizontalPadding,
                { borderBottomWidth: 1, borderBottomColor: colors.borderColor },
              ]}
            >
              <Text style={[common.headerTitle, { color: colors.textColor }]}>
                {votingType.text}
              </Text>
              {votingType.description !== "" && (
                <Text
                  style={[
                    common.subTitle,
                    { marginTop: 8, color: colors.textColor },
                  ]}
                >
                  {votingType.description}
                </Text>
              )}
            </View>
          </TouchableHighlight>
        );
      })}
    </Modal>
  );
}

export default VotingTypeModal;
