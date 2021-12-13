import React, { useMemo, useState } from "react";
import { View } from "react-native";
import i18n from "i18n-js";
import common from "styles/common";
import { dateFormat } from "helpers/miscUtils";
import { Space } from "types/explore";
import Block from "../Block";
import Button from "../Button";
import DatePickerModal from "./DatePickerModal";

interface ActionsBlockProps {
  startTimestamp: number | undefined;
  endTimestamp: number | undefined;
  setStartTimestamp: (timestamp: number) => void;
  setEndTimestamp: (timestamp: number) => void;
  isValid: boolean;
  snapshot: number | string;
  onSubmit: () => void;
  space: Space;
}

function ActionsBlock({
  startTimestamp,
  endTimestamp,
  setStartTimestamp,
  setEndTimestamp,
  isValid,
  snapshot,
  onSubmit,
  space,
}: ActionsBlockProps) {
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [datePickerProps, setDatePickerProps] = useState({});
  const [loading, setLoading] = useState(false);
  const dateEnd = useMemo(() => {
    return space.voting?.period && startTimestamp
      ? startTimestamp + space.voting.period
      : undefined;
  }, [space, startTimestamp]);
  const disabledEndDate =
    Number.isInteger(space.voting?.period) || dateEnd !== undefined;
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
              disabled={Number.isInteger(space.voting?.delay)}
              onPress={() => {
                setDatePickerProps({
                  title: i18n.t("selectStartDate"),
                  timestamp: startTimestamp,
                  setTimestamp: (timestamp: number) => {
                    setStartTimestamp(timestamp);
                    if (disabledEndDate) {
                      setEndTimestamp(timestamp + space.voting.period);
                    }
                  },
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
              disabled={disabledEndDate}
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
