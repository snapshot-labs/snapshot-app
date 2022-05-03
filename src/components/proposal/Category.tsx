import {
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { styles as buttonStyles } from "components/Button";
import React from "react";
import { useAuthState } from "context/authContext";
import Device from "helpers/device";

interface CategoryProps {
  isSelected?: boolean;
  onPress(category: string): void;
  category: string;
  buttonContainerStyle?: ViewStyle;
}

function Category({
  isSelected,
  onPress,
  category,
  buttonContainerStyle,
}: CategoryProps) {
  const { colors } = useAuthState();

  return (
    <TouchableWithoutFeedback onPress={() => onPress(category)}>
      <View
        style={[
          buttonStyles.button,
          {
            borderColor: isSelected ? "transparent" : colors.navBarBg,
            backgroundColor: isSelected ? colors.bgBlue : colors.navBarBg,
            paddingBottom: 8,
            paddingHorizontal: 14,
            paddingTop: Platform.OS === "android" ? 8 : 12,
          },
          buttonContainerStyle,
        ]}
      >
        <Text
          style={[
            buttonStyles.buttonTitle,
            {
              color: isSelected ? colors.white : colors.textColor,
              textTransform: "capitalize",
              fontSize: 14,
              lineHeight: 14,
              marginBottom: Device.isIos() ? 4 : 0,
              fontWeight: "500",
            },
          ]}
        >
          {category}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default Category;
