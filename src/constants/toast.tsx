import { Text, View } from "react-native";
import styles from "../styles/toast";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const toastLayoutConfig = {
  default: ({ text1 }: { text1: string }) => (
    <View style={styles.container}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  customSuccess: ({ text1 }: { text1: string }) => (
    <View style={[styles.container, styles.successContainer]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
  customError: ({ text1 }: { text1: string }) => (
    <View style={[styles.container, styles.errorContainer]}>
      <Text style={styles.text}>{text1}</Text>
    </View>
  ),
};

export function useToastShowConfig() {
  const insets = useSafeAreaInsets();
  return {
    topOffset: insets.top,
    visibilityTime: 2000,
  };
}
