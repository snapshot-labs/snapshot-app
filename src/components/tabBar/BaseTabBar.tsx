import React from "react";
import i18n from "i18n-js";
import { MaterialTabBar } from "react-native-collapsible-tab-view";
import { useAuthState } from "context/authContext";

function BaseTabBar(props: any) {
  const { colors } = useAuthState();
  return (
    <MaterialTabBar
      {...props}
      contentContainerStyle={{ backgroundColor: colors.bgDefault }}
      tabStyle={{ backgroundColor: colors.bgDefault }}
      labelStyle={{
        fontFamily: "Calibre-Medium",
        color: colors.textColor,
        textTransform: "none",
        fontSize: 18,
      }}
      indicatorStyle={{
        backgroundColor: colors.indicatorColor,
        height: 3,
        borderBottomWidth: 0,
      }}
      inactiveColor={colors.darkGray}
      activeColor={colors.textColor}
      getLabelText={(name: any) => {
        return i18n.t(name);
      }}
    >
      {props.children}
    </MaterialTabBar>
  );
}

export default BaseTabBar;
