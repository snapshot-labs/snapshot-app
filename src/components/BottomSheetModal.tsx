import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import colors from "constants/colors";
import { useAuthState } from "context/authContext";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowTitle: {
    color: colors.textColor,
    fontFamily: "Calibre-Semibold",
    fontSize: 18,
  },
});

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} pressBehavior="close" />
);

type BottomSheetModalProps = {
  bottomSheetRef: any;
  snapPoints: any[];
  options: string[];
  onPressOption: (index: number) => void;
  initialIndex: number;
  destructiveButtonIndex?: number;
};

function BottomSheetModal({
  bottomSheetRef,
  snapPoints,
  options,
  onPressOption,
  initialIndex,
  destructiveButtonIndex,
}: BottomSheetModalProps) {
  const { colors } = useAuthState();
  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      animateOnMount
      backgroundStyle={{
        backgroundColor: colors.bgDefault,
      }}
      backdropComponent={renderBackdrop}
      index={initialIndex}
      handleIndicatorStyle={{ backgroundColor: colors.textColor }}
    >
      <BottomSheetView>
        {options.map((option: string, index: number) => (
          <TouchableHighlight
            underlayColor={colors.highlightColor}
            onPress={() => {
              onPressOption(index);
            }}
            key={index}
          >
            <View style={styles.row}>
              <Text
                style={[
                  styles.rowTitle,
                  { color: colors.textColor },
                  destructiveButtonIndex === index
                    ? {
                        color: colors.red,
                      }
                    : {},
                ]}
              >
                {option}
              </Text>
            </View>
          </TouchableHighlight>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
}

export default BottomSheetModal;
