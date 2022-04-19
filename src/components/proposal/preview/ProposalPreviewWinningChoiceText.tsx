import React from "react";
import { Text, View, StyleSheet } from "react-native";
import common from "styles/common";
import TextTicker from "react-native-text-ticker";
import Device from "helpers/device";
import { useAuthState } from "context/authContext";

const textTickerWidth = Device.getDeviceWidth() - 110;

const styles = StyleSheet.create({
  winningResultText: {
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
  winningResultTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 18,
  },
  voteAmountText: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginLeft: 4,
  },
});

interface ProposalPreviewWinningChoiceTextProps {
  winningChoiceTitle: string;
  voteAmount: string;
  formattedCalculatedScore: string;
}

function ProposalPreviewWinningChoiceText({
  winningChoiceTitle,
  voteAmount,
  formattedCalculatedScore,
}: ProposalPreviewWinningChoiceTextProps) {
  const { colors } = useAuthState();
  const totalTextWidth =
    winningChoiceTitle.length +
    voteAmount.length +
    formattedCalculatedScore.length;
  const useTextTicker = totalTextWidth * 10 > textTickerWidth;
  const TextComponent: any = useTextTicker ? TextTicker : Text;
  const textTickerProps = useTextTicker
    ? {
        style: { width: textTickerWidth },
        duration: 3000,
        loop: true,
        repeatSpacer: 50,
        marqueeOnMount: true,
        marqueeDelay: 1500,
        bounceDelay: 300,
        scrollSpeed: 1000,
        animationType: "scroll",
      }
    : {};
  return (
    <View style={styles.winningResultTextContainer}>
      <View style={common.row}>
        <TextComponent {...textTickerProps}>
          <Text style={[styles.winningResultText, { color: colors.textColor }]}>
            {winningChoiceTitle}
          </Text>
          <Text
            style={[styles.voteAmountText, { color: colors.secondaryGray }]}
          >
            {` ${voteAmount}`}
          </Text>
        </TextComponent>
      </View>
      <Text style={[styles.winningResultText, { color: colors.textColor }]}>
        {formattedCalculatedScore}
      </Text>
    </View>
  );
}

export default ProposalPreviewWinningChoiceText;
