import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useAuthState } from "context/authContext";
import IconFont from "components/IconFont";
import common from "styles/common";
import Device from "helpers/device";

const styles = StyleSheet.create({
  recapRowContainer: {
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
    textTransform: "capitalize",
  },
  value: {
    fontFamily: "Calibre-Medium",
    fontSize: 18,
    marginRight: 4,
    marginTop: 9,
    width: Device.getDeviceWidth() - 100,
  },
});

interface RecapRowProps {
  icon?: string;
  IconComponent?: React.FC;
  title: string;
  value?: string;
  ValueComponent?: React.FC;
  DetailsComponent?: React.FC;
}

function RecapRow({
  icon,
  title,
  IconComponent = undefined,
  ValueComponent = undefined,
  DetailsComponent = undefined,
  value,
}: RecapRowProps) {
  const { colors } = useAuthState();

  return (
    <View style={styles.recapRowContainer}>
      <View style={common.row}>
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
          <View style={[common.row, common.alignItemsCenter]}>
            {ValueComponent ? (
              <ValueComponent />
            ) : (
              <Text style={[styles.value, { color: colors.textColor }]}>
                {value}
              </Text>
            )}
          </View>
        </View>
      </View>
      {DetailsComponent ? <DetailsComponent /> : <View />}
    </View>
  );
}

export default RecapRow;
