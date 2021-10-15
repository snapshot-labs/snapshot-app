import React, { useState } from "react";
import { Platform, Text, View, TouchableOpacity } from "react-native";
import i18n from "i18n-js";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import moment from "moment-timezone";
import { styles as buttonStyle } from "../Button";
import common from "../../styles/common";
import BackButton from "../BackButton";
import TimePicker from "./TimePicker";
import colors from "../../constants/colors";

type DatePickerModalProps = {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  timestamp?: number;
  setTimestamp: (timestamp: number) => void;
};

const initialDate = moment().format("YYYY-MM-DD");
const initialTime = { hour: 1, minutes: 0 };

function DatePickerModal({
  isVisible,
  onClose,
  title,
  timestamp = new Date().getTime() / 1e3,
  setTimestamp,
}: DatePickerModalProps) {
  const insets = useSafeAreaInsets();
  const momentTimestamp = moment(timestamp * 1e3);
  const [time, setTime] = useState<{ hour: number; minutes: number }>({
    hour: momentTimestamp.get("hour"),
    minutes: momentTimestamp.get("minutes"),
  });
  const [selected, setSelected] = useState<string>(
    momentTimestamp.format("YYYY-MM-DD")
  );

  function onCloseHandler() {
    setTime(initialTime);
    setSelected(initialDate);
    onClose();
  }
  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onCloseHandler}
      style={[
        common.screen,
        common.fullScreenModal,
        {
          paddingTop: insets.top,
        },
      ]}
      coverScreen
    >
      <View
        style={[
          common.headerContainer,
          {
            justifyContent: "space-between",
          },
        ]}
      >
        <Text style={common.screenHeaderTitle}>{title}</Text>
        <BackButton
          backIcon="times"
          onPress={onCloseHandler}
          backIconStyle={{
            marginBottom: Platform.OS === "ios" ? 6 : 0,
          }}
        />
      </View>
      <View
        style={[
          common.containerHorizontalPadding,
          common.containerVerticalPadding,
        ]}
      >
        <Calendar
          onDayPress={(day) => {
            setSelected(day.dateString);
          }}
          theme={{
            backgroundColor: colors.white,
            calendarBackground: colors.white,
            textSectionTitleColor: colors.textColor,
            textSectionTitleDisabledColor: colors.borderColor,
            selectedDayBackgroundColor: colors.textColor,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.textColor,
            dayTextColor: colors.textColor,
            textDisabledColor: colors.borderColor,
            arrowColor: colors.textColor,
            disabledArrowColor: colors.borderColor,
            monthTextColor: colors.textColor,
            textDayFontFamily: "Calibre-Medium",
            textMonthFontFamily: "Calibre-Medium",
            textDayHeaderFontFamily: "Calibre-Medium",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "300",
            textDayFontSize: 18,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 18,
            //@ts-ignore
            "stylesheet.day.basic": {
              base: {
                height: 32,
                width: 32,
                alignItems: "center",
                paddingTop: Platform.OS === "ios" ? 3 : 0,
              },
            },
          }}
          enableSwipeMonths
          markedDates={{
            [selected]: {
              selected: true,
              disableTouchEvent: true,
              customStyles: {
                container: {
                  backgroundColor: "red",
                },
              },
            },
          }}
        />

        <View style={{ marginTop: 8 }}>
          <Text style={common.screenHeaderTitle}>{i18n.t("selectTime")}</Text>
          <View>
            <TimePicker
              onChange={(value) => {
                setTime(value);
              }}
              time={time}
            />
          </View>
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          position: "absolute",
          bottom: 40,
          width: "100%",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            const [year, month, day]: any = selected.split("-");
            let timestamp = new Date(
              year,
              month - 1,
              day,
              time.hour,
              time.minutes,
              0
            );
            setTimestamp(new Date(timestamp).getTime() / (1e3).toFixed());
            onCloseHandler();
          }}
        >
          <View style={buttonStyle.button}>
            <Text style={buttonStyle.buttonTitle}>{i18n.t("select")}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default DatePickerModal;
