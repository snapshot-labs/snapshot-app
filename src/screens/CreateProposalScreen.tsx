import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import { getBlockNumber } from "@snapshot-labs/snapshot.js/src/utils/web3";
import { Space } from "../types/explore";
import i18n from "i18n-js";
import Input from "../components/Input";
import common from "../styles/common";
import BackButton from "../components/BackButton";
import colors from "../constants/colors";
import ChoicesBlock from "../components/createProposal/ChoicesBlock";
import ActionsBlock from "../components/createProposal/ActionsBlock";
import proposal from "../constants/proposal";
import MarkdownBody from "../components/proposal/MarkdownBody";
import set = Reflect.set;

const bodyLimit = 6400;

const styles = StyleSheet.create({
  questionInput: {
    fontSize: 24,
    fontFamily: "Calibre-Semibold",
    height: 40,
    lineHeight: 26,
    marginTop: 6,
  },
  input: {
    borderLeftWidth: 0,
    borderRadius: 0,
    borderTopWidth: 0,
    borderWidth: 0,
    paddingLeft: 0,
    marginBottom: 0,
    marginTop: 0,
    fontSize: 18,
    fontFamily: "Calibre-Medium",
    lineHeight: 20,
    color: colors.textColor,
    height: "auto",
    paddingTop: 0,
    marginLeft: 16,
  },
});

const isValid = (
  name: string,
  body: string,
  choices: string[],
  start: number | null,
  end: number | null,
  snapshot: number
) => {
  return !!(
    name &&
    body.length <= bodyLimit &&
    start &&
    end &&
    end > start &&
    snapshot &&
    snapshot > snapshot / 2 &&
    choices.length >= 2 &&
    !choices.some((a) => a === "")
  );
};

async function fetchBlockNumber(
  space: Space,
  setSnapshot: (snapshot: number) => void
) {
  const blockNumber = await getBlockNumber(getProvider(space.network));
  setSnapshot(blockNumber);
}

type CreateProposalScreenProps = {
  route: {
    params: {
      space: Space;
    };
  };
};

function CreateProposalScreen({ route }: CreateProposalScreenProps) {
  const [choices, setChoices] = useState([""]);
  const [votingType, setVotingType] = useState<{ key: string; text: string }>(
    proposal.getVotingTypes()[0]
  );
  const [question, setQuestion] = useState<string>("");
  const [proposalText, setProposalText] = useState<string>("");
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [endTimestamp, setEndTimestamp] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState(0);

  useEffect(() => {}, [fetchBlockNumber(route.params.space, setSnapshot)]);

  return (
    <SafeAreaView style={common.screen}>
      <View style={common.headerContainer}>
        <BackButton title={i18n.t("createProposal")} />
      </View>
      <ScrollView style={common.screen}>
        <Input
          placeholder={i18n.t("question")}
          style={[styles.input, styles.questionInput]}
          value={question}
          onChangeText={(text: string) => {
            setQuestion(text);
          }}
        />
        <Input
          placeholder={i18n.t("whatIsYourProposal")}
          multiline
          numberOfLines={4}
          style={[styles.input, { minHeight: 60 }]}
          textAlignVertical="top"
          value={proposalText}
          onChangeText={(text: string) => {
            setProposalText(text);
          }}
        />
        {proposalText !== "" && (
          <View
            style={[
              common.containerHorizontalPadding,
              common.containerVerticalPadding,
            ]}
          >
            <Text style={[common.h4, { marginBottom: 6 }]}>
              {i18n.t("preview")}
            </Text>
            <MarkdownBody body={proposalText} />
          </View>
        )}
        <ChoicesBlock
          choices={choices}
          setChoices={setChoices}
          votingType={votingType}
          setVotingType={setVotingType}
        />
        <View style={{ height: 10, width: 10 }} />
        <ActionsBlock
          startTimestamp={startTimestamp}
          endTimestamp={endTimestamp}
          setStartTimestamp={setStartTimestamp}
          setEndTimestamp={setEndTimestamp}
          isValid={isValid(
            question,
            proposalText,
            choices,
            startTimestamp,
            endTimestamp,
            snapshot
          )}
          snapshot={snapshot}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default CreateProposalScreen;
