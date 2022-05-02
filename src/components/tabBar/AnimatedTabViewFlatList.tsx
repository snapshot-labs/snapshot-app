import React, { memo, ReactElement, useEffect } from "react";
import {
  Animated,
  FlatListProps,
  Platform,
  View,
  ViewProps,
} from "react-native";
import { tabBarOffset } from "components/tabBar/AnimatedTabBar";
import Device from "helpers/device";

export interface AnimatedTabViewProps<T>
  extends ViewProps,
    Pick<
      FlatListProps<T>,
      | "data"
      | "getItemLayout"
      | "initialNumToRender"
      | "maxToRenderPerBatch"
      | "onContentSizeChange"
      | "onMomentumScrollBegin"
      | "onMomentumScrollEnd"
      | "onScrollEndDrag"
      | "renderItem"
      | "updateCellsBatchingPeriod"
      | "windowSize"
      | "ListEmptyComponent"
      | "ListHeaderComponent"
      | "onEndReached"
      | "onEndReachedThreshold"
      | "ListFooterComponent"
    > {
  onRef: (scrollableChild: Animated.FlatList<T>) => void;
  scrollY?: Animated.AnimatedValue;
  refreshControl?: ReactElement;
  headerHeight: number;
  listOffset?: number;
}
const AnimatedTabViewFlatListWithoutMemo = <T extends any>({
  data,
  renderItem,
  getItemLayout,
  onContentSizeChange,
  initialNumToRender,
  maxToRenderPerBatch,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScrollEndDrag,
  onRef,
  scrollY,
  refreshControl,
  ListEmptyComponent,
  headerHeight,
  ListHeaderComponent = <View />,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent = <View />,
  listOffset = 110,
}: AnimatedTabViewProps<T>) => {
  const handleScroll =
    scrollY &&
    Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
      useNativeDriver: true,
    });

  return (
    <Animated.FlatList<T>
      data={data as readonly Animated.WithAnimatedValue<T>[]}
      renderItem={renderItem}
      keyboardShouldPersistTaps="always"
      ListEmptyComponent={ListEmptyComponent}
      getItemLayout={getItemLayout}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      ref={onRef}
      refreshControl={refreshControl}
      onContentSizeChange={onContentSizeChange}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      ListHeaderComponent={ListHeaderComponent}
      onScroll={handleScroll}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      onScrollEndDrag={onScrollEndDrag}
      ListFooterComponent={ListFooterComponent}
      showsVerticalScrollIndicator={false}
      contentInset={Platform.select({
        ios: { top: headerHeight - tabBarOffset },
      })}
      contentOffset={Platform.select({
        ios: {
          x: 0,
          y: -headerHeight + tabBarOffset,
        },
      })}
      contentContainerStyle={Platform.select({
        ios: {
          flexGrow: 1,
        },
        android: {
          flexGrow: 1,
          paddingTop: headerHeight - tabBarOffset,
          minHeight:
            Device.getDeviceHeight() + headerHeight - tabBarOffset - listOffset,
        },
      })}
    />
  );
};
// Creating an unmemoized component and casting as that type is the only way
// I can get Typescript to respect the generics of the memoized function.
export const AnimatedTabViewFLatList = memo(
  AnimatedTabViewFlatListWithoutMemo
) as typeof AnimatedTabViewFlatListWithoutMemo;

export default AnimatedTabViewFLatList;
