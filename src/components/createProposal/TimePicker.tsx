import React, { useState } from "react";
import { View, Text, Platform } from "react-native";
import { Picker } from "react-native-wheel-datepicker";
import common from "../../styles/common";
import colors from "../../constants/colors";

const [hours, minutes]: number[][] = [[], []];

for (let i = 1; i <= 24; i += 1) {
  hours.push(i);
}

for (let i = 0; i <= 59; i += 1) {
  minutes.push(i);
}

const pickerStyle = {
  height: 150,
  backgroundColor: colors.bgDefault,
  marginTop: 0,
  paddingTop: 0,
};

const dividerStyle = {
  marginBottom: Platform.OS === "android" ? 10 : 0,
  marginTop: Platform.OS === "ios" ? 73 : 0,
};

type TimePickerProps = {
  onChange: (time: { hour: number; minutes: number }) => void;
  time: { hour: number; minutes: number };
};

function TimePicker({
  onChange,
  time = { hour: 1, minutes: 0 },
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(time.hour);
  const [selectedMinutes, setSelectedMinutes] = useState(time.minutes);

  return (
    <View style={[common.row, { alignItems: "center", height: 150 }]}>
      <View key="hour" style={common.flex1}>
        <Picker
          style={pickerStyle}
          itemStyle={{
            backgroundColor: colors.bgDefault,
          }}
          selectedValue={selectedHour}
          pickerData={hours}
          onValueChange={(value: number) => {
            setSelectedHour(value);
            onChange({ hour: value, minutes: selectedMinutes });
          }}
        />
      </View>
      <Text style={[common.headerTitle, dividerStyle]}>:</Text>
      <View key="minute" style={[common.flex1]}>
        <Picker
          style={pickerStyle}
          itemStyle={{
            backgroundColor: colors.bgDefault,
          }}
          selectedValue={selectedMinutes}
          pickerData={minutes}
          onValueChange={(value: number) => {
            setSelectedMinutes(value);
            onChange({ hour: selectedHour, minutes: value });
          }}
        />
      </View>
    </View>
  );
}

export default TimePicker;
