import React from "react";
import { View } from "react-native";
import common from "styles/common";
import ActiveAccount from "components/ActiveAccount";
import FollowSection from "components/user/FollowSection";
import Button from "components/Button";
import { SETTINGS_SCREEN } from "constants/navigation";
import i18n from "i18n-js";
import IconFont from "components/IconFont";
import { useNavigation } from "@react-navigation/native";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";

function ProfileScreenHeader() {
  const { colors, connectedAddress } = useAuthState();
  const navigation: any = useNavigation();
  return (
    <View
      style={[
        common.justifyCenter,
        common.alignItemsCenter,
        {
          backgroundColor: colors.bgDefault,
          paddingTop: Device.isIos() ? 100 : 10,
        },
      ]}
    >
      <ActiveAccount address={connectedAddress} />
      <View style={{ marginTop: 9 }}>
        <Button
          onPress={() => {
            navigation.navigate(SETTINGS_SCREEN);
          }}
          title={i18n.t("settings")}
          buttonTitleStyle={{
            textTransform: "uppercase",
            fontSize: 14,
          }}
          Icon={() => (
            <IconFont name={"gear"} size={22} color={colors.textColor} />
          )}
          buttonContainerStyle={{
            width: 173,
            paddingVertical: 9,
          }}
        />
      </View>
    </View>
  );
}

export default ProfileScreenHeader;
