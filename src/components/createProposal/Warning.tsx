import React from "react";
import { View, Text } from "react-native";
import i18n from "i18n-js";
import { Space } from "../../types/explore";
import colors from "../../constants/colors";
import common from "../../styles/common";
import IconFont from "../IconFont";
import { n } from "../../util/miscUtils";

type WarningProps = {
  space: Space;
  passValidation: [boolean, string];
};

function Warning({ space, passValidation }: WarningProps) {
  let text;

  if (passValidation[1] === "basic") {
    text =
      space.validation?.params.minScore || space?.filters?.minScore
        ? i18n.t("validationWarningMinScore", {
            amount: n(space.filters.minScore),
            token: space.symbol,
          })
        : i18n.t("validationWarningBasic");
  } else {
    text = space.validation?.params?.rules || i18n.t("validationWarningCustom");
  }

  return (
    <View
      style={[
        common.containerHorizontalPadding,
        common.containerVerticalPadding,
        common.row,
        {
          borderRadius: 6,
          borderColor: colors.borderColor,
          borderWidth: 1,
          margin: 8,
        },
      ]}
    >
      <IconFont
        name="warning"
        size={20}
        color={colors.darkGray}
      />
      <Text style={[common.subTitle, { marginLeft: 8, paddingRight: 16 }]}>
        {text}
      </Text>
    </View>
  );
}

export default Warning;
