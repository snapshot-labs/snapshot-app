import React, { useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  findNodeHandle,
} from "react-native";
import { styles as buttonStyles } from "components/Button";
import { useAuthState } from "context/authContext";
import { useExploreState } from "context/exploreContext";

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

async function measureComponent(component: any) {
  return new Promise((resolve, reject) => {
    component.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        resolve({ x, y, width, height, pageX, pageY });
      }
    );
  });
}

type CategoriesScrollViewProps = {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

function CategoriesScrollView({
  selectedCategory,
  setSelectedCategory,
}: CategoriesScrollViewProps) {
  const { colors } = useAuthState();
  const { categories } = useExploreState();
  const nodesRef: any = useRef([]);
  const scrollViewRef: any = useRef(null);

  return (
    <ScrollView
      horizontal
      style={{ marginTop: 7, paddingHorizontal: 16 }}
      showsHorizontalScrollIndicator={false}
      ref={scrollViewRef}
    >
      {allCategories.map((category, i) => (
        <TouchableOpacity
          key={i}
          onPress={async () => {
            if (selectedCategory === category) {
              setSelectedCategory("");
            } else {
              setSelectedCategory(category);
              let xPos = 0;
              for (let j = 0; j < i; j++) {
                const result: any = await measureComponent(nodesRef.current[i]);
                xPos += result?.width ?? 0;
                console.log({ xPos });
              }
              scrollViewRef.current?.scrollTo({
                x: xPos !== 0 ? xPos - 24 : xPos,
              });
            }
          }}
        >
          <View
            style={[
              buttonStyles.button,
              {
                borderColor:
                  selectedCategory === category
                    ? colors.textColor
                    : colors.borderColor,
                marginRight: i === allCategories.length - 1 ? 24 : 8,
              },
            ]}
            ref={(ref) => {
              nodesRef.current.push(ref);
            }}
          >
            <Text
              style={[
                buttonStyles.buttonTitle,
                {
                  color:
                    selectedCategory === category
                      ? colors.textColor
                      : colors.darkGray,
                  textTransform: "capitalize",
                },
              ]}
            >
              {category}
            </Text>
            <Text
              style={{
                fontFamily: "Calibre-Medium",
                color: colors.borderColor,
                fontSize: 18,
                marginLeft: 6,
              }}
            >
              {categories[category]}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default CategoriesScrollView;
