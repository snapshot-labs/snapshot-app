import React from "react";
import { Text, View } from "react-native";
import i18n from "i18n-js";
import common from "../../styles/common";

function DashboardHeader() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
      <Text style={common.headerTitle}>{i18n.t("dashboard")}</Text>
      <Text style={[common.subTitle, { marginTop: 16 }]}>
        {i18n.t("mySpaces")}
      </Text>
    </View>
  );
}

export default DashboardHeader;
