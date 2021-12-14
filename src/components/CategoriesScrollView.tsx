import React from "react";
import { View, ScrollView, Platform, TouchableOpacity } from "react-native";
import Category from "components/proposal/Category";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";

const allCategories = [
  "protocol",
  "social",
  "investment",
  "grant",
  "service",
  "media",
  "creator",
  "collector",
];

interface CategoriesScrollViewProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

function CategoriesScrollView({
  selectedCategory,
  setSelectedCategory,
}: CategoriesScrollViewProps) {
  const { colors } = useAuthState();

  return (
    <View
      style={{
        marginTop: 10,
        borderBottomWidth: 1,
        paddingBottom: 10,
        borderBottomColor: colors.borderColor,
      }}
    >
      {selectedCategory === "" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allCategories.map((category, i) => (
            <Category
              key={i}
              onPress={(category) => {
                if (selectedCategory === category) {
                  setSelectedCategory("");
                } else {
                  setSelectedCategory(category);
                }
              }}
              buttonContainerStyle={{
                marginLeft: i === 0 ? 16 : 0,
                marginRight: i === allCategories.length - 1 ? 16 : 8,
              }}
              category={category}
              isSelected={selectedCategory === category}
            />
          ))}
        </ScrollView>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory("");
            }}
          >
            <IconFont
              name="close"
              size={21}
              color={colors.textColor}
              style={{
                marginBottom: Platform.OS === "ios" ? 4 : 0,
                marginRight: 6,
              }}
            />
          </TouchableOpacity>
          <Category
            onPress={(category) => {
              if (selectedCategory === category) {
                setSelectedCategory("");
              } else {
                setSelectedCategory(category);
              }
            }}
            category={selectedCategory}
            isSelected
          />
        </View>
      )}
    </View>
  );
}

export default CategoriesScrollView;
