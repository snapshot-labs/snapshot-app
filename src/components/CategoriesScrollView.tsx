import React from "react";
import { View, ScrollView, Platform, TouchableOpacity } from "react-native";
import Category from "components/proposal/Category";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";

const allCategories = [
  "all",
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
  return (
    <View
      style={{
        paddingTop: 9,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {allCategories.map((category, i) => {
          let isSelected = selectedCategory === category;

          if (category === "all") {
            isSelected = selectedCategory === "";
          }

          return (
            <Category
              key={i}
              onPress={(category) => {
                if (category === "all") {
                  setSelectedCategory("");
                } else if (selectedCategory === category) {
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
              isSelected={isSelected}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

export default CategoriesScrollView;
