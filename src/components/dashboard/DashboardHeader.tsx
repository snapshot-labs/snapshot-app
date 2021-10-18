import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import i18n from "i18n-js";
import { useNavigation } from "@react-navigation/native";
import common from "../../styles/common";
import IconFont from "../IconFont";
import colors from "../../constants/colors";
import { SETTINGS_SCREEN } from "../../constants/navigation";

function DashboardHeader() {
  const navigation: any = useNavigation();
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 30 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={common.headerTitle}>{i18n.t("dashboard")}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(SETTINGS_SCREEN);
          }}
        >
          <IconFont name="gear" size={40} color={colors.textColor} />
        </TouchableOpacity>
      </View>
      <Text style={[common.subTitle, { marginTop: 16 }]}>
        {i18n.t("mySpaces")}
      </Text>
    </View>
  );
}

export default DashboardHeader;
