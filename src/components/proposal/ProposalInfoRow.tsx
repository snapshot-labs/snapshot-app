import React from "react";
import { View, StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import { useAuthState } from "context/authContext";
import IconFont from "components/IconFont";
import common from "styles/common";
import Device from "helpers/device";

const styles = StyleSheet.create({
  proposalInfoRowContainer: {
    flexDirection: "row",
    paddingVertical: 18,
  },
  iconContainer: {
    height: 28,
    width: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    marginLeft: 12,
  },
  title: {
    fontFamily: "Calibre-Medium",
    fontSize: 14,
  },
  value: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginRight: 6,
    marginTop: 9,
  },
});

interface ProposalInfoRowProps {
  icon?: string;
  IconComponent?: any;
  title: string;
  value?: string;
  onPress?: () => void;
  ValueComponent?: any;
}

function ProposalInfoRow({
  icon,
  title,
  onPress = undefined,
  IconComponent = undefined,
  ValueComponent = undefined,
  value,
}: ProposalInfoRowProps) {
  const { colors } = useAuthState();

  return (
    <View style={styles.proposalInfoRowContainer}>
      <View
        style={[styles.iconContainer, { backgroundColor: colors.navBarBg }]}
      >
        {IconComponent ? (
          <IconComponent />
        ) : (
          <IconFont name={icon} size={14} color={colors.textColor} />
        )}
      </View>
      <View style={styles.valueContainer}>
        <Text style={[styles.title, { color: colors.secondaryGray }]}>
          {title}
        </Text>
        <TouchableWithoutFeedback onPress={onPress ? onPress : () => {}}>
          <View style={[common.row, common.alignItemsCenter]}>
            {ValueComponent ? (
              <ValueComponent />
            ) : (
              <Text style={[styles.value, { color: colors.textColor }]}>
                {value}
              </Text>
            )}
            {onPress && (
              <IconFont
                name="external-link"
                size={16}
                color={colors.textColor}
                style={{ marginTop: Device.isIos() ? 8 : 9 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

export default ProposalInfoRow;
