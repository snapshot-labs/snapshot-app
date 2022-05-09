import React from "react";
import { Dimensions, View } from "react-native";
import ActivityIndicator from "components/ActivityIndicator";
import { useAuthState } from "context/authContext";

const { height } = Dimensions.get("screen");

interface FlatListFooterLoaderProps {
  loading: boolean;
}

function FlatListFooterLoader({ loading }: FlatListFooterLoaderProps) {
  const { colors } = useAuthState();
  return loading ? (
    <View
      style={{
        width: "100%",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 24,
        padding: 24,
        height: 150,
      }}
    >
      <ActivityIndicator color={colors.textColor} size="large" />
    </View>
  ) : (
    <View
      style={{
        width: 100,
        height,
        backgroundColor: colors.bgDefault,
      }}
    />
  );
}

export default FlatListFooterLoader;
