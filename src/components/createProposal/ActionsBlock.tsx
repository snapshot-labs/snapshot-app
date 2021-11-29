import React, { useState } from "react";
import { View } from "react-native";
import i18n from "i18n-js";
import Block from "../Block";
import common from "../../styles/common";

import Button from "../Button";
import DatePickerModal from "./DatePickerModal";
import { dateFormat } from "../../helpers/miscUtils";

type ActionsBlockProps = {
  startTimestamp: number | undefined;
  endTimestamp: number | undefined;
  setStartTimestamp: (timestamp: number) => void;
  setEndTimestamp: (timestamp: number) => void;
  isValid: boolean;
  snapshot: number | string;
  onSubmit: () => void;
};

function ActionsBlock({
  startTimestamp,
  endTimestamp,
  setStartTimestamp,
  setEndTimestamp,
  isValid,
  snapshot,
  onSubmit,
}: ActionsBlockProps) {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [datePickerProps, setDatePickerProps] = useState({});
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Block
        title={i18n.t("actions")}
        Content={
          <View
            style={[
              common.containerHorizontalPadding,
              common.containerVerticalPadding,
            ]}
          >
            <Button
              title={
                startTimestamp === undefined
                  ? i18n.t("selectStartDate")
                  : dateFormat(startTimestamp)
              }
              onPress={() => {
                setDatePickerProps({
                  title: i18n.t("selectStartDate"),
                  timestamp: startTimestamp,
                  setTimestamp: setStartTimestamp,
                  key: Math.random().toString(),
                });
                setShowDatePickerModal(true);
              }}
              buttonContainerStyle={{ marginBottom: 20 }}
            />
            <Button
              title={
                endTimestamp === undefined
                  ? i18n.t("selectEndDate")
                  : dateFormat(endTimestamp)
              }
              onPress={() => {
                setDatePickerProps({
                  title: i18n.t("selectEndDate"),
                  timestamp: endTimestamp,
                  setTimestamp: setEndTimestamp,
                  key: Math.random().toString(),
                });
                setShowDatePickerModal(true);
              }}
              buttonContainerStyle={{ marginBottom: 20 }}
            />
            <Button
              title={`${snapshot}`}
              onPress={() => {}}
              buttonContainerStyle={{ marginBottom: 20 }}
            />
            <Button
              title={i18n.t("publish")}
              disabled={!isValid}
              loading={loading}
              onPress={async () => {
                setLoading(true);
                await onSubmit();
                setLoading(false);
              }}
            />
          </View>
        }
      />
      <DatePickerModal
        isVisible={showDatePickerModal}
        onClose={() => {
          setShowDatePickerModal(false);
        }}
        {...datePickerProps}
      />
    </>
  );
}

export default ActionsBlock;
