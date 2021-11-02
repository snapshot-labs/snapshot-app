import React from "react";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
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
  ModalContent?: React.FunctionComponent | undefined;
  scroll?: boolean;
  enablePanDownToClose?: boolean;
  BackDropRenderer?: any;
};

function BottomSheetModal({
  bottomSheetRef,
  snapPoints,
  options,
  onPressOption,
  initialIndex,
  destructiveButtonIndex,
  ModalContent,
  scroll = false,
  enablePanDownToClose = true,
  BackDropRenderer = undefined,
}: BottomSheetModalProps) {
  const { colors } = useAuthState();
  let BottomSheetViewComponent: any = BottomSheetView;
  if (scroll) {
    BottomSheetViewComponent = BottomSheetScrollView;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      animateOnMount
      backgroundStyle={{
        backgroundColor: colors.bgDefault,
      }}
      backdropComponent={
        BackDropRenderer !== undefined ? BackDropRenderer : renderBackdrop
      }
      index={initialIndex}
      handleIndicatorStyle={{ backgroundColor: colors.textColor }}
    >
      <BottomSheetViewComponent>
        {ModalContent !== undefined && <ModalContent />}
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
      </BottomSheetViewComponent>
    </BottomSheet>
  );
}

export default BottomSheetModal;
