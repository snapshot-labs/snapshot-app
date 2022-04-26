import React from "react";
import { StyleSheet } from "react-native";
import { TabBar } from "react-native-tab-view";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  indicatorStyle: {
    fontFamily: "Calibre-Medium",
    height: 3,
    top: 42,
  },
  labelStyle: {
    fontFamily: "Calibre-Medium",
    textTransform: "none",
    fontSize: 18,
    marginTop: 0,
  },
});

function TabBarComponent(props: any) {
  const { colors } = useAuthState();
  return (
    <TabBar
      {...props}
      labelStyle={styles.labelStyle}
      indicatorStyle={[
        styles.indicatorStyle,
        { color: colors.secondaryGray, backgroundColor: colors.textColor },
      ]}
      activeColor={colors.textColor}
      style={{
        shadowColor: "transparent",
        borderTopWidth: 0,
        shadowOpacity: 0,
        backgroundColor: colors.bgDefault,
        height: 45,
        elevation: 0,
        borderBottomColor: colors.borderColor,
        borderBottomWidth: 1,
        marginTop: 0,
        paddingTop: 0,
      }}
      inactiveColor={colors.secondaryGray}
      tabStyle={{ alignItems: "center", justifyContent: "flex-start" }}
    />
  );
}

export default TabBarComponent;
