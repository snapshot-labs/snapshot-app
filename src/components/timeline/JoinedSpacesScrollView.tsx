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

const styles = StyleSheet.create({
  spaceName: {
    fontSize: 14,
    fontFamily: "Calibre-Medium",
    textAlign: "center",
    marginTop: 2,
    width: 66,
  },
});

interface JoinedSpacesScrollViewProps {
  useLoader?: boolean;
}

function JoinedSpacesScrollView({
  useLoader = false,
}: JoinedSpacesScrollViewProps) {
  const { colors, followedSpaces } = useAuthState();
  const { spaces } = useExploreState();
  const navigation: any = useNavigation();

  return (
    <View
      style={{
        marginTop: 8,
        borderBottomWidth: 1,
        paddingBottom: 8,
        borderBottomColor: colors.borderColor,
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
              if (isEmpty(spaceDetails)) {
                return;
              }
              return (
                <View
                  key={i}
                  style={{
                    marginLeft: 8,
                    marginRight: i === followedSpaces.length - 1 ? 16 : 0,
                  }}
                >
                  <SpaceAvatarButton
                    onPress={() => {
                      navigation.navigate(SPACE_SCREEN, {
                        space: { id: space?.space?.id, ...spaceDetails },
                      });
                    }}
                    size={64}
                    space={spaceDetails}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate(SPACE_SCREEN, {
                        space: { id: space?.space?.id, ...spaceDetails },
                      });
                    }}
                  >
                    <View>
                      <Text
                        ellipsizeMode="tail"
                        style={[styles.spaceName, { color: colors.textColor }]}
                        numberOfLines={1}
                      >
                        {spaceDetails.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
      </ScrollView>
    </View>
  );
}

export default JoinedSpacesScrollView;
