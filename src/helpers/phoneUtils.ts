import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import includes from "lodash/includes";

export function isOldIphone() {
  if (Platform.OS === "android") return false;
  const deviceId = DeviceInfo.getDeviceId();
  const deviceIdLowered = deviceId?.toLowerCase() || "";
  if (
    includes(deviceIdLowered, "iphone7") ||
    includes(deviceIdLowered, "iphone8") ||
    includes(deviceIdLowered, "iphone9")
  ) {
    return true;
  }
}
