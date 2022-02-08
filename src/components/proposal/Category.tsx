import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { styles as buttonStyles } from "components/Button";
import React from "react";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";
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
  const { categories } = useExploreState();

  return (
    <TouchableOpacity onPress={() => onPress(category)}>
      <View
        style={[
          buttonStyles.button,
          {
            borderColor: isSelected ? "transparent" : colors.borderColor,
            backgroundColor: isSelected ? colors.bgBlue : colors.borderColor,
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
              fontSize: 18,
              lineHeight: 18,
              marginBottom: Device.isIos() ? 4 : 0,
            },
          ]}
        >
          {category}
        </Text>
        {!isSelected && (
          <Text
            style={{
              fontFamily: "Calibre-Medium",
              color: colors.darkGray,
              fontSize: 18,
              lineHeight: 18,
              marginLeft: 6,
              marginBottom: Device.isIos() ? 4 : 0,
            }}
          >
            {categories[category]}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default Category;
