import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useAuthState } from "context/authContext";
import SpaceAvatarButton from "components/SpaceAvatarButton";
import { SPACE_SCREEN } from "constants/navigation";
import { useNavigation } from "@react-navigation/core";
import { Fade, Placeholder, PlaceholderMedia } from "rn-placeholder";
import { useExploreState } from "context/exploreContext";
import isEmpty from "lodash/isEmpty";
import i18n from "i18n-js";
import common from "styles/common";
import IconFont from "components/IconFont";
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { RootStackParamsList } from "types/navigationTypes";

const verified: any = require("constants/verifiedSpaces.json");

const styles = StyleSheet.create({
  spaceName: {
    fontSize: 14,
    fontFamily: "Calibre-Medium",
    textAlign: "center",
    marginTop: 2,
  },
  spacesJoinedTitle: {
    fontSize: 14,
    fontFamily: "Calibre-Semibold",
    paddingLeft: 16,
    paddingBottom: 8,
    paddingTop: 16,
    textTransform: "uppercase",
  },
});

interface JoinedSpacesScrollViewProps {
  useLoader?: boolean;
  followedSpaces?: any[];
  showEmptySpacesText?: boolean;
}

function JoinedSpacesScrollView({
  useLoader = false,
  followedSpaces = [],
}: JoinedSpacesScrollViewProps) {
  const { colors } = useAuthState();
  const { spaces } = useExploreState();
  const navigation = useNavigation<StackNavigationProp<RootStackParamsList>>();

  if (followedSpaces.length === 0 && !useLoader) {
    return <View />;
  }

  return (
    <View>
      <Text style={[styles.spacesJoinedTitle, { color: colors.textColor }]}>
        {i18n.t("joinedSpaces")}
      </Text>
      <View
        style={{
          marginTop: 8,
          paddingBottom: 8,
          minHeight: 90.9,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {useLoader
            ? new Array(1).fill(1).map((v, index: number) => {
                return (
                  <Placeholder
                    key={index}
                    Animation={Fade}
                    Left={(props) => (
                      <PlaceholderMedia
                        isRound={true}
                        style={[props.style, { marginLeft: 8 }]}
                        size={65}
                      />
                    )}
                    style={{ alignItems: "center" }}
                  />
                );
              })
            : followedSpaces.map((space, i) => {
                const spaceDetails = spaces[space?.space?.id];
                const verificationStatus = verified[space?.space?.id] || 0;
                const isVerified = verificationStatus === 1;

                if (isEmpty(spaceDetails)) {
                  return;
                }
                return (
                  <View
                    key={i}
                    style={[
                      common.justifyCenter,
                      {
                        marginLeft: i === 0 ? 16 : 20,
                        marginRight: i === followedSpaces.length - 1 ? 16 : 0,
                      },
                    ]}
                  >
                    <SpaceAvatarButton
                      onPress={() => {
                        navigation.navigate(SPACE_SCREEN, {
                          space: {
                            ...spaceDetails,
                            id: spaceDetails.id ?? space?.space?.id,
                          },
                        });
                      }}
                      size={64}
                      space={spaceDetails}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate(SPACE_SCREEN, {
                          space: {
                            ...spaceDetails,
                            id: spaceDetails.id ?? space?.space?.id,
                          },
                        });
                      }}
                    >
                      <View
                        style={[
                          common.row,
                          common.alignItemsCenter,
                          common.justifyCenter,
                          { width: 66 },
                        ]}
                      >
                        <Text
                          ellipsizeMode="tail"
                          style={[
                            styles.spaceName,
                            { color: colors.textColor },
                          ]}
                          numberOfLines={1}
                        >
                          {spaceDetails.name}
                        </Text>
                        {isVerified && (
                          <IconFont
                            name="check-verified"
                            size={13}
                            color={colors.blueButtonBg}
                            style={{ marginTop: 2, marginLeft: 2 }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
        </ScrollView>
      </View>
    </View>
  );
}

export default JoinedSpacesScrollView;
