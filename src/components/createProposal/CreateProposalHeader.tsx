import React from "react";
import { View, StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import common from "styles/common";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import * as Progress from "react-native-progress";
import IconFont from "components/IconFont";

const MAX_STEPS = 3;

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: "Calibre-Semibold",
    fontSize: 14,
    textTransform: "uppercase",
  },
  stepText: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  stepContainer: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingLeft: 9,
    paddingVertical: 9,
    paddingRight: 9,
  },
  stepsProgressContainer: {
    width: 96,
    paddingRight: 9,
    borderRightWidth: 1,
    marginRight: 9,
  },
});

interface CreateProposalHeaderProps {
  currentStep: number;
  onClose: () => void;
}

function CreateProposalHeader({
  currentStep,
  onClose,
}: CreateProposalHeaderProps) {
  const { colors } = useAuthState();
  const progress = currentStep / MAX_STEPS;
  return (
    <View
      style={[
        common.headerContainer,
        common.containerHorizontalPadding,
        common.justifySpaceBetween,
        { borderBottomColor: "transparent" },
      ]}
    >
      <Text style={[styles.headerTitle, { color: colors.textColor }]}>
        {i18n.t("createProposal")}
      </Text>
      <View
        style={[styles.stepContainer, { backgroundColor: colors.navBarBg }]}
      >
        <View
          style={[
            styles.stepsProgressContainer,
            { borderRightColor: colors.borderColor },
          ]}
        >
          <Text style={[styles.stepText, { color: colors.textColor }]}>
            {currentStep}/{MAX_STEPS}
          </Text>
          <Progress.Bar
            progress={progress}
            color={colors.bgBlue}
            unfilledColor={colors.borderColor}
            width={null}
            borderColor="transparent"
            height={2}
          />
        </View>
        <View>
          <TouchableWithoutFeedback onPress={onClose}>
            <View>
              <IconFont name={"close"} size={20} color={colors.textColor} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  );
}

export default CreateProposalHeader;
