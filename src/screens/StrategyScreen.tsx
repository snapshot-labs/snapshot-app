import React from "react";
import { ScrollView, Text, View } from "react-native";
import i18n from "i18n-js";
import common from "../styles/common";
import BackButton from "../components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import MarkdownBody from "../components/proposal/MarkdownBody";
import BlockInformation from "../components/strategy/BlockInformation";

type StrategyScreenProps = {
  route: {
    params: {
      minifiedStrategiesArray: any;
      strategy: any;
    };
  };
};

function StrategyScreen({ route }: StrategyScreenProps) {
  const minifiedStrategiesArray = route.params.minifiedStrategiesArray;
  const strategy = route.params.strategy;
  const strategyKey = strategy?.key ?? "";
  const inSpaces =
    minifiedStrategiesArray?.find((st: any) => st.key === strategyKey)
      ?.spaces ?? "";

  return (
    <SafeAreaView style={common.screen}>
      <View style={common.screen}>
        <BackButton title={i18n.t("strategiess")} />
        <ScrollView style={[common.screen, { paddingHorizontal: 16 }]}>
          <Text style={[common.headerTitle, { marginTop: 20 }]}>
            {strategyKey}
          </Text>
          <Text style={[common.subTitle, { marginTop: 20, paddingBottom: 20 }]}>
            {i18n.t("inSpaces", { spaceCount: inSpaces })}
          </Text>
          <MarkdownBody body={strategy.about} />
          <View style={{ width: "100%", height: 20 }} />
          <BlockInformation strategy={strategy} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default StrategyScreen;
