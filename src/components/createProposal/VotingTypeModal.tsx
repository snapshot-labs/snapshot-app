import React from "react";
import {
  Platform,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import colors from "../../constants/colors";
import common from "../../styles/common";
import i18n from "i18n-js";
import Modal from "react-native-modal";
import proposal from "../../constants/proposal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "../BackButton";

type VotingTypeModalProps = {
  isVisible: boolean;
  onClose: () => void;
  setVotingType: (votingType: { key: string; text: string }) => void;
};

function VotingTypeModal({
  isVisible,
  onClose,
  setVotingType,
}: VotingTypeModalProps) {
  const votingTypes = proposal.getVotingTypes();
  const insets = useSafeAreaInsets();
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
        },
      ]}
      coverScreen
    >
      <View
        style={[
          common.headerContainer,
          {
            justifyContent: "space-between",
          },
        ]}
      >
        <Text style={common.screenHeaderTitle}>
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
              <Text style={common.headerTitle}>{votingType.text}</Text>
              <Text style={[common.subTitle, { marginTop: 8 }]}>
                {votingType.description}
              </Text>
            </View>
          </TouchableHighlight>
        );
      })}
    </Modal>
  );
}

export default VotingTypeModal;
