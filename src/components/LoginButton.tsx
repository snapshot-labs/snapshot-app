import React from "react";
import { useNavigation } from "@react-navigation/native";
import i18n from "i18n-js";
import { WALLET_CONNECT_SCREEN } from "../constants/navigation";
import Button from "./Button";

function LoginButton() {
  const navigation: any = useNavigation();
  return (
    <Button
      onPress={() => {
        navigation.navigate(WALLET_CONNECT_SCREEN);
      }}
      title={i18n.t("logIn")}
    />
  );
}

export default LoginButton;
