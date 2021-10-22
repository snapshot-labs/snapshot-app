import React from "react";
import { ScrollView, Text, View } from "react-native";
import i18n from "i18n-js";
import common from "../styles/common";
import BackButton from "../components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import MarkdownBody from "../components/proposal/MarkdownBody";
import BlockInformation from "../components/strategy/BlockInformation";
import { useAuthState } from "context/authContext";

type StrategyScreenProps = {
  route: {
    params: {
      minifiedStrategiesArray: any;
      strategy: any;
    };
  };
};

function StrategyScreen({ route }: StrategyScreenProps) {
  const { colors } = useAuthState();
  const minifiedStrategiesArray = route.params.minifiedStrategiesArray;
  const strategy = route.params.strategy;
  const strategyKey = strategy?.key ?? "";
  const inSpaces =
    minifiedStrategiesArray?.find((st: any) => st.key === strategyKey)
      ?.spaces ?? "";

  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View style={[common.screen, { backgroundColor: colors.bgDefault }]}>
        <BackButton title={i18n.t("strategiess")} />
        <ScrollView
          style={[common.screen, { backgroundColor: colors.bgDefault }]}
        >
          <Text
            style={[
              common.containerHorizontalPadding,
              common.headerTitle,
              { marginTop: 20, color: colors.textColor },
            ]}
          >
            {strategyKey}
          </Text>
          <Text
            style={[
              common.containerHorizontalPadding,
              common.subTitle,
              { marginTop: 20, paddingBottom: 20, color: colors.textColor },
            ]}
          >
            {i18n.t("inSpaces", { spaceCount: inSpaces })}
          </Text>
          <View style={common.containerHorizontalPadding}>
            <MarkdownBody body={strategy.about} />
          </View>
          <View style={{ width: "100%", height: 20 }} />
          <BlockInformation strategy={strategy} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default StrategyScreen;
