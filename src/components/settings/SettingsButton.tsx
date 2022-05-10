import React, { useState } from "react";
import IconButton from "components/IconButton";
import {
  BOTTOM_SHEET_MODAL_ACTIONS,
  useBottomSheetModalDispatch,
} from "context/bottomSheetModalContext";
import { Text, View, Switch } from "react-native";
import common from "styles/common";
import i18n from "i18n-js";
import {
  AUTH_ACTIONS,
  useAuthDispatch,
  useAuthState,
} from "context/authContext";
import SettingsOption from "components/settings/SettingsOption";
import SettingsAboutOption from "components/settings/SettingsAboutOption";
import settingsStyles from "styles/settings";
import SettingsAdvancedOption from "components/settings/SettingsAdvancedOption";

function SettingsButton() {
  const bottomSheetModalDispatch = useBottomSheetModalDispatch();
  const { theme } = useAuthState();

  function displaySettings() {
    const snapPoint = 300;
    bottomSheetModalDispatch({
      type: BOTTOM_SHEET_MODAL_ACTIONS.SET_BOTTOM_SHEET_MODAL,
      payload: {
        scroll: true,
        TitleComponent: () => {
          const { colors, theme } = useAuthState();
          return (
            <Text
              style={[common.modalTitle, { color: colors.textColor }]}
              key={theme}
            >
              {i18n.t("settings")}
            </Text>
          );
        },
        ModalContent: () => {
          const { colors, theme } = useAuthState();
          const authDispatch = useAuthDispatch();
          return (
            <View style={common.containerHorizontalPadding}>
              <SettingsOption
                title={i18n.t("appearance")}
                iconName="snapshot"
                ValueComponent={() => {
                  return (
                    <Switch
                      onValueChange={async (darkMode) => {
                        authDispatch({
                          type: AUTH_ACTIONS.SET_THEME,
                          payload: darkMode ? "dark" : "light",
                        });
                      }} // eslint-disable-line react/jsx-no-bind
                      value={theme === "dark"}
                      trackColor={{
                        true: colors.secondaryGray,
                        false: colors.secondaryGray,
                      }}
                      thumbColor={colors.textColor}
                      ios_backgroundColor={colors.navBarBg}
                      key={theme}
                    />
                  );
                }}
              />
              <View
                style={[
                  settingsStyles.separator,
                  { backgroundColor: colors.borderColor },
                ]}
              />
              <SettingsAdvancedOption goBack={displaySettings} />
              <View
                style={[
                  settingsStyles.separator,
                  { backgroundColor: colors.borderColor },
                ]}
              />
              <SettingsAboutOption goBack={displaySettings} />
            </View>
          );
        },
        options: [],
        snapPoints: [10, snapPoint],
        show: true,
        key: `view-settings-${theme}`,
        icons: [],
        initialIndex: 1,
      },
    });
  }

  return <IconButton iconSize={20} onPress={displaySettings} name="gear" />;
}

export default SettingsButton;
