import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "components/Button";
import i18n from "i18n-js";
import OnboardingProgress from "components/wallet/OnboardingProgress";
import fontStyles from "styles/fonts";
import colors from "constants/colors";
import Device from "helpers/device";
import { ENGINE_ACTIONS, useEngineDispatch } from "context/engineContext";
import { createChoosePasswordSteps } from "constants/onboarding";
import IconFont from "components/IconFont";
import { useAuthState } from "context/authContext";
import common from "styles/common";
import BackButton from "components/BackButton";
import { SEED_PHRASE_BACKUP_COMPLETE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/native";

const styles = StyleSheet.create({
  mainWrapper: {
    backgroundColor: colors.white,
    flex: 1,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  onBoardingWrapper: {
    paddingHorizontal: 20,
  },
  action: {
    fontSize: 18,
    marginBottom: 16,
    color: colors.textColor,
    justifyContent: "center",
    textAlign: "center",
    ...fontStyles.bold,
  },
  infoWrapper: {
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    color: colors.textColor,
    ...fontStyles.normal,
    paddingTop: 16,
  },
  seedPhraseWrapper: {
    backgroundColor: colors.white,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: colors.borderColor,
    borderWidth: 1,
    marginBottom: 24,
  },
  seedPhraseWrapperComplete: {
    borderColor: colors.bgGreen,
  },
  seedPhraseWrapperError: {
    borderColor: colors.red,
  },
  colLeft: {
    paddingTop: 18,
    paddingLeft: 27,
    paddingBottom: 4,
    alignItems: "flex-start",
  },
  colRight: {
    paddingTop: 18,
    paddingRight: 27,
    paddingBottom: 4,
    alignItems: "flex-end",
  },
  wordBoxWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  wordWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: Device.isMediumDevice() ? 75 : 95,
    backgroundColor: colors.white,
    borderColor: colors.borderColor,
    borderWidth: 1,
    borderRadius: 34,
    borderStyle: "dashed",
    marginLeft: 4,
  },
  word: {
    fontSize: 14,
    color: colors.textColor,
    lineHeight: 14,
    textAlign: "center",
  },
  selectableWord: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.textColor,
    width: 95,
    backgroundColor: colors.white,
    borderColor: colors.bgBlue,
    borderWidth: 1,
    marginBottom: 6,
    borderRadius: 13,
    marginRight: 6,
    textAlign: "center",
  },
  selectableWordText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 14,
    color: colors.black,
  },
  words: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: Device.isMediumDevice() ? "space-around" : "space-between",
  },
  successRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: 18,
    color: colors.bgGreen,
    marginLeft: 4,
  },
  selectedWord: {
    backgroundColor: colors.darkGray,
    borderWidth: 1,
    borderColor: colors.darkGray,
  },
  selectedWordText: {
    color: colors.white,
  },
  currentWord: {
    borderWidth: 1,
    borderColor: colors.blue,
  },
  confirmedWord: {
    borderWidth: 1,
    borderColor: colors.blue,
    borderStyle: "solid",
  },
});

interface SeedPhraseBackupStep2ScreenProps {
  route: {
    params: {
      words: string[];
    };
  };
}

function SeedPhraseBackupStep2Screen({
  route,
}: SeedPhraseBackupStep2ScreenProps) {
  const { colors } = useAuthState();
  const words = route.params?.words ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedWords, setConfirmedWords] = useState<any[]>(
    Array(words.length).fill({ word: undefined, originalPosition: undefined })
  );
  const [wordsDict, setWordsDict] = useState<any>({});
  const [seedPhraseReady, setSeedPhraseReady] = useState(false);
  const wordLength = confirmedWords.length;
  const half = wordLength / 2;
  const CHOOSE_PASSWORD_STEPS = createChoosePasswordSteps();
  const engineDispatch = useEngineDispatch();
  const navigation: any = useNavigation();

  useEffect(() => {
    const dict: any = {};
    words.forEach((word, i) => {
      dict[`${word},${i}`] = { currentPosition: undefined };
    });
    setWordsDict(dict);
  }, []);

  function validateWords() {
    const words = route.params?.words ?? [];
    const wordsMap = confirmedWords.map((confirmedWord) => confirmedWord.word);
    return words.join("") === wordsMap.join("");
  }

  function findNextAvailableIndex(confirmedWords: any[]) {
    return confirmedWords.findIndex(({ word }) => !word);
  }

  function clearConfirmedWordAt(i: number) {
    const confirmedWordsCopy = [...confirmedWords];
    const wordsDictCopy: any = { ...wordsDict };
    const { word, originalPosition } = confirmedWordsCopy[i];
    const currentIndex = i;

    if (word && (originalPosition || originalPosition === 0)) {
      //@ts-ignore
      wordsDictCopy[[word, originalPosition]].currentPosition = undefined;
      confirmedWordsCopy[i] = { word: undefined, originalPosition: undefined };
    }

    setCurrentIndex(currentIndex);
    setConfirmedWords(confirmedWordsCopy);
    setSeedPhraseReady(findNextAvailableIndex(confirmedWordsCopy) === -1);
    setWordsDict(wordsDictCopy);
  }

  function renderWordBox(word: string, i: number) {
    return (
      <View key={`word_${i}`} style={styles.wordBoxWrapper}>
        <Text>{i + 1}.</Text>
        <TouchableOpacity
          onPress={() => {
            clearConfirmedWordAt(i);
          }}
          style={[
            styles.wordWrapper,
            i === currentIndex && styles.currentWord,
            confirmedWords[i].word && styles.confirmedWord,
          ]}
        >
          <Text style={styles.word}>{word}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function goNext() {
    if (validateWords()) {
      engineDispatch({
        type: ENGINE_ACTIONS.SEEDPHRASE_BACKED_UP,
      });
      navigation.navigate(SEED_PHRASE_BACKUP_COMPLETE_SCREEN);
    } else {
      Alert.alert(
        i18n.t("manual_backup_step_2.error_title"),
        i18n.t("manual_backup_step_2.error_message")
      );
    }
  }
  return (
    <SafeAreaView
      style={[common.screen, { backgroundColor: colors.bgDefault }]}
    >
      <View
        style={[
          common.headerContainer,
          { borderBottomColor: colors.borderColor },
        ]}
      >
        <BackButton title={i18n.t("manual_backup_step_2.action")} />
      </View>
      <View style={{ paddingHorizontal: 16, marginLeft: -16, marginTop: 24 }}>
        <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={2} />
      </View>
      <View style={styles.wrapper}>
        <View style={styles.infoWrapper}>
          <Text style={[styles.info, { color: colors.textColor }]}>
            {i18n.t("manual_backup_step_2.info")}
          </Text>
        </View>

        <View
          style={[
            styles.seedPhraseWrapper,
            seedPhraseReady && styles.seedPhraseWrapperError,
            validateWords() && styles.seedPhraseWrapperComplete,
          ]}
        >
          <View style={styles.colLeft}>
            {confirmedWords
              .slice(0, half)
              .map(({ word }, i) => renderWordBox(word, i))}
          </View>
          <View style={styles.colRight}>
            {confirmedWords
              .slice(-half)
              .map(({ word }, i) => renderWordBox(word, i + half))}
          </View>
        </View>
        {validateWords() ? (
          <View style={styles.successRow}>
            <IconFont name="check" size={20} color={colors.bgGreen} />
            <Text style={styles.successText}>
              {i18n.t("manual_backup_step_2.success")}
            </Text>
          </View>
        ) : (
          <View style={styles.words}>
            {Object.keys(wordsDict).map((key, i) => {
              const [word] = key.split(",");
              const selected = wordsDict[key].currentPosition !== undefined;
              return (
                <TouchableOpacity
                  // eslint-disable-next-line react/jsx-no-bind
                  onPress={() => {
                    let currentIndexCopy = currentIndex;
                    const wordsDictCopy = { ...wordsDict };
                    const confirmedWordsCopy = [...confirmedWords];
                    if (
                      wordsDictCopy[`${word},${i}`].currentPosition !==
                      undefined
                    ) {
                      currentIndexCopy =
                        wordsDictCopy[`${word},${i}`].currentPosition;
                      wordsDictCopy[`${word},${i}`].currentPosition = undefined;
                      confirmedWordsCopy[currentIndexCopy] = {
                        word: undefined,
                        originalPosition: undefined,
                      };
                    } else {
                      wordsDictCopy[`${word},${i}`].currentPosition =
                        currentIndexCopy;
                      confirmedWordsCopy[currentIndexCopy] = {
                        word,
                        originalPosition: i,
                      };
                      currentIndexCopy =
                        findNextAvailableIndex(confirmedWordsCopy);
                    }

                    setWordsDict(wordsDictCopy);
                    setCurrentIndex(currentIndexCopy);
                    setConfirmedWords(confirmedWordsCopy);
                    setSeedPhraseReady(
                      findNextAvailableIndex(confirmedWordsCopy) === -1
                    );
                  }}
                  style={[
                    styles.selectableWord,
                    selected && styles.selectedWord,
                  ]}
                  key={`selectableWord_${i}`}
                >
                  <Text
                    style={[
                      styles.selectableWordText,
                      selected && styles.selectedWordText,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 16, marginBottom: 30 }}>
        <Button
          disabled={!seedPhraseReady || !validateWords()}
          onPress={goNext}
          title={i18n.t("manual_backup_step_2.complete")}
        />
      </View>
    </SafeAreaView>
  );
}

export default SeedPhraseBackupStep2Screen;
