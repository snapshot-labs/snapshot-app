import React, { useState } from "react";
import common from "styles/common";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useAuthState } from "context/authContext";
import i18n from "i18n-js";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import BackButton from "components/BackButton";
import InputRound from "components/InputRound";
import Button from "components/Button";
import VotingTypeModal from "components/createProposal/VotingTypeModal";
import { calcFromSeconds } from "helpers/miscUtils";
import client from "helpers/snapshotClient";

const styles = StyleSheet.create({
  separator: {
    height: 8,
    width: "100%",
  },
  heading: {
    fontFamily: "Calibre-Semibold",
    fontSize: 20,
    marginBottom: 16,
  },
  footer: {
    height: 300,
    width: "100%",
  },
});

type SpaceSettingsScreenProps = {
  route: {
    params: {
      space: any;
    };
  };
};

function SpaceSettingsScreen({ route }: SpaceSettingsScreenProps) {
  const space = route.params.space;
  const { colors, wcConnector, connectedAddress } = useAuthState();
  const [name, setName] = useState(space.name);
  const [about, setAbout] = useState(space.about);
  const [avatar, setAvatar] = useState(space.avatar);
  const [votingDelay, setVotingDelay] = useState(space.voting?.delay);
  const [votingDelayUnit, setVotingDelayUnit] = useState("hours");
  const [votingPeriod, setVotingPeriod] = useState(space.voting?.period);
  const [votingPeriodUnit, setVotingPeriodUnit] = useState("hours");
  const [quorum, setQuorum] = useState("0");
  const [symbol, setSymbol] = useState(space.symbol);
  const [terms, setTerms] = useState(space.terms);
  const [twitter, setTwitter] = useState(space.twitter);
  const [github, setGithub] = useState(space.github);
  const [showVotingTypeModal, setShowVotingTypeModal] = useState(false);
  const [votingType, setVotingType] = useState<{ key: string; text: string }>(
    space.voting?.type
      ? { key: space.voting.type, text: space.voting.type }
      : { key: "any", text: i18n.t("any") }
  );
  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View style={common.headerContainer}>
        <BackButton title={i18n.t("spaceSettings")} />
      </View>
      <ScrollView
        style={common.screen}
        contentContainerStyle={{
          padding: 16,
          backgroundColor: colors.bgDefault,
        }}
      >
        <Text style={[styles.heading, { color: colors.textColor }]}>
          {i18n.t("profile")}
        </Text>
        <InputRound
          title={i18n.t("name")}
          value={name}
          onChangeText={(text: string) => {
            setName(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("about")}
          value={about}
          onChangeText={(text: string) => {
            setAbout(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("avatar")}
          value={avatar}
          onChangeText={(text: string) => {
            setAvatar(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={`${i18n.t("symbol")} *`}
          value={symbol}
          onChangeText={(text: string) => {
            setSymbol(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("twitter")}
          icon="twitter"
          value={twitter}
          onChangeText={(text: string) => {
            setTwitter(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("github")}
          icon="mark-github"
          value={github}
          onChangeText={(text: string) => {
            setGithub(text);
          }}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("terms")}
          value={terms}
          onChangeText={(text: string) => {
            setTerms(text);
          }}
        />
        <View style={[styles.separator, { height: 16 }]} />
        <Text style={[styles.heading, { color: colors.textColor }]}>
          {i18n.t("voting")}
        </Text>
        <InputRound
          title={i18n.t("votingDelay")}
          value={votingDelay}
          onChangeText={(text: string) => {
            setVotingDelay(text);
          }}
          keyboardType="number-pad"
          rightValue={votingDelayUnit}
          rightValueOptions={["hours", "days"]}
          onChangeRightValue={setVotingDelayUnit}
        />
        <View style={styles.separator} />
        <InputRound
          title={i18n.t("votingPeriod")}
          value={votingPeriod}
          onChangeText={(text: string) => {
            setVotingPeriod(text);
          }}
          keyboardType="number-pad"
          rightValue={votingPeriodUnit}
          rightValueOptions={["hours", "days"]}
          onChangeRightValue={setVotingPeriodUnit}
        />
        <View style={styles.separator} />
        <Button
          label={i18n.t("type")}
          title={votingType.text}
          buttonTitleStyle={{ marginLeft: 8, fontSize: 18 }}
          onPress={() => {
            setShowVotingTypeModal(true);
          }}
          buttonContainerStyle={{ marginBottom: 8 }}
        />
        <InputRound
          title={i18n.t("quorum")}
          value={quorum}
          onChangeText={(text: string) => {
            setQuorum(text);
          }}
          keyboardType="number-pad"
        />
        <View style={styles.separator} />
        <Button
          title={i18n.t("save")}
          onPress={async () => {
            const parsedVotingDelay = calcFromSeconds(
              parseInt(votingDelay, 16),
              votingDelayUnit === "hours" ? "h" : "d"
            );
            const parsedVotingPeriod = calcFromSeconds(
              parseInt(votingPeriod, 16),
              votingPeriodUnit === "hours" ? "h" : "d"
            );
            //@ts-ignore
            wcConnector.send = async (type, params) => {
              return await wcConnector.signPersonalMessage(params);
            };

            const form = {
              name,
              about,
              avatar,
              symbol,
              twitter,
              github,
              terms,
              voting: {
                delay: parsedVotingDelay,
                period: parsedVotingPeriod,
              },
            };

            const sign = await client.broadcast(
              wcConnector,
              connectedAddress,
              space.id,
              "settings",
              form
            );
          }}
        />
        <View style={styles.footer} />
        <VotingTypeModal
          isVisible={showVotingTypeModal}
          setVotingType={setVotingType}
          onClose={() => {
            setShowVotingTypeModal(false);
          }}
          addAny
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default SpaceSettingsScreen;
