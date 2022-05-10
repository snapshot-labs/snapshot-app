import React from "react";
import { Text, View, StyleSheet } from "react-native";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import common from "styles/common";

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    marginLeft: 23,
  },
  container: {
    paddingVertical: 20,
  },
});

interface SettingsOptionProps {
  iconName: string;
  iconSize?: number;
  title: string;
  ValueComponent?: React.FC | undefined;
  valueTitle?: string | undefined;
}

function SettingsOption({
  iconName,
  iconSize = 20,
  title,
  ValueComponent = undefined,
  valueTitle = undefined,
}: SettingsOptionProps) {
  const { colors } = useAuthState();
  return (
    <View style={[common.row, common.alignItemsCenter, styles.container]}>
      <IconFont name={iconName} size={iconSize} color={colors.textColor} />
      <Text style={[styles.titleStyle, { color: colors.textColor }]}>
        {title}
      </Text>
      <View style={common.marginLeftAuto}>
        {ValueComponent !== undefined && <ValueComponent />}
        {valueTitle !== undefined && (
          <Text style={[styles.titleStyle, { color: colors.textColor }]}>
            {valueTitle}
          </Text>
        )}
      </View>
    </View>
  );
}

export default SettingsOption;
