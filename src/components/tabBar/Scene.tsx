import React, { FunctionComponent, ReactElement } from "react";
import {
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  FlatList,
  FlatListProps,
} from "react-native";
import AnimatedTabViewFlatList from "./AnimatedTabViewFlatList";

type ScrollEvent = NativeSyntheticEvent<NativeScrollEvent>;

interface SceneProps<T>
  extends Pick<
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
  isActive: boolean;
  routeKey: string;
  scrollY: Animated.Value;
  trackRef: (key: string, ref: FlatList<any>) => void;
  onMomentumScrollBegin: (e: ScrollEvent) => void;
  onMomentumScrollEnd: (e: ScrollEvent) => void;
  onScrollEndDrag: (e: ScrollEvent) => void;
  headerHeight: number;
  renderItem: any;
  refreshControl?: ReactElement;
  data: any[];
}

const Scene: FunctionComponent<SceneProps> = ({
  isActive,
  routeKey,
  scrollY,
  trackRef,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScrollEndDrag,
  headerHeight,
  renderItem,
  refreshControl,
  data,
  ListFooterComponent,
  ListEmptyComponent,
}) => (
  <View style={styles.container}>
    <AnimatedTabViewFlatList
      data={data}
      windowSize={3}
      initialNumToRender={15}
      refreshControl={refreshControl}
      renderItem={renderItem}
      onRef={(ref: any) => {
        trackRef(routeKey, ref);
      }}
      scrollY={isActive ? scrollY : undefined}
      onScrollEndDrag={onScrollEndDrag}
      onMomentumScrollBegin={onMomentumScrollBegin}
      onMomentumScrollEnd={onMomentumScrollEnd}
      headerHeight={headerHeight}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
});

export default Scene;
