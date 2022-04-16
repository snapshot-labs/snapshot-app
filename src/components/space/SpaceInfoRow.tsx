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
    marginRight: 4,
    marginTop: 9,
    width: Device.getDeviceWidth() - 100,
  },
});

interface SpaceInfoRowProps {
  icon?: string;
  IconComponent?: any;
  title: string;
  value?: string;
  onPress?: () => void;
  ValueComponent?: any;
}

function SpaceInfoRow({
  icon,
  title,
  onPress = undefined,
  IconComponent = undefined,
  ValueComponent = undefined,
  value,
}: SpaceInfoRowProps) {
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
                style={{ marginTop: Device.isIos() ? 8 : 0 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

export default SpaceInfoRow;
