import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";
import Device from "helpers/device";

export interface AnimatedNavBarProps {
  scrollY: Animated.AnimatedValue;
  children: ReactNode;
  headerHeight: number;
}

const AnimatedTabBar: FunctionComponent<AnimatedNavBarProps> = ({
  children,
  scrollY,
  headerHeight,
}) => {
  const [showTitle, setShowTitle] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const tabViewOffset = Device.isIos() ? -headerHeight : 0;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: showTitle ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacity, showTitle]);

  useEffect(() => {
    const listener = scrollY?.addListener(({ value }) => {
      setShowTitle(value > tabViewOffset + headerHeight * 0.6);
    });

    return () => {
      scrollY?.removeListener(listener);
    };
  });

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
};

export default AnimatedTabBar;
