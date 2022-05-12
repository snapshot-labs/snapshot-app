import React from "react";
import { View, Text } from "react-native";
import common from "styles/common";
import ActiveAccount from "components/ActiveAccount";
import Button from "components/Button";
import i18n from "i18n-js";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
} from "context/bottomSheetModalContext";
import Input from "components/Input";
import { getSnapshotProfileAbout } from "helpers/address";
import { useExploreState } from "context/exploreContext";
import isEmpty from "lodash/isEmpty";

function ProfileScreenHeader() {
  const { colors, connectedAddress } = useAuthState();
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const { snapshotUsers } = useExploreState();
  const about = getSnapshotProfileAbout(connectedAddress ?? "", snapshotUsers);
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
      <ActiveAccount address={connectedAddress ?? ""} />
      {!isEmpty(about) && (
        <Text
          style={{
            fontFamily: "Calibre-Medium",
            fontSize: 14,
            marginHorizontal: 28,
            marginTop: 18,
            textAlign: "center",
            color: colors.textColor,
          }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {about}
        </Text>
      )}
      <View style={{ marginTop: 18 }}>
        <Button
          onPress={() => {
            const snapPoint = 300;
            bottomSheetModalDispatch({
              type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
              payload: {
                scroll: true,
                TitleComponent: () => {
                  return (
                    <Text
                      style={[common.modalTitle, { color: colors.textColor }]}
                    >
                      {i18n.t("description")}
                    </Text>
                  );
                },
                ModalContent: () => {
                  const { snapshotUsers } = useExploreState();
                  const about = getSnapshotProfileAbout(
                    connectedAddress ?? "",
                    snapshotUsers
                  );
                  return (
                    <View style={common.containerHorizontalPadding}>
                      <Input
                        value={about}
                        multiline
                        numberOfLines={4}
                        style={{
                          borderLeftWidth: 0,
                          borderRadius: 0,
                          borderTopWidth: 0,
                          borderWidth: 0,
                          paddingLeft: 0,
                          marginBottom: 0,
                          marginTop: 22,
                          fontSize: 18,
                          fontFamily: "Calibre-Medium",
                          lineHeight: 20,
                          color: colors.textColor,
                          height: "auto",
                          paddingTop: 0,
                          marginLeft: 16,
                        }}
                      />
                    </View>
                  );
                },
                options: [],
                snapPoints: [10, snapPoint],
                show: true,
                key: `description-${connectedAddress}`,
                icons: [],
                initialIndex: 1,
              },
            });
          }}
          title={i18n.t("editProfile")}
          buttonTitleStyle={{
            fontSize: 14,
          }}
          Icon={() => (
            <IconFont name={"people"} size={16} color={colors.textColor} />
          )}
          buttonContainerStyle={{
            minWidth: 102,
            paddingVertical: 9,
          }}
        />
      </View>
    </View>
  );
}

export default ProfileScreenHeader;
