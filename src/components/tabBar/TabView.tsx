import React, { FunctionComponent, ReactNode } from "react";
import { TabView } from "react-native-tab-view";

export interface TabRoute {
  key: string;
  title: string;
}

export interface TabViewProps {
  routes: TabRoute[];
  width: number;
  index: number;
  setIndex: (i: number) => void;
  renderTabBar: (props: {
    navigationState: any;
    setIndex: (i: number) => void;
  }) => ReactNode;
  swipeEnabled?: boolean;
  renderScene: any;
}

const TabViewComponent: FunctionComponent<TabViewProps> = ({
  routes,
  width,
  renderTabBar,
  index,
  setIndex,
  renderScene,
  swipeEnabled = true,
}) => {
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={(props: any) =>
        renderTabBar({
          ...props,
          setIndex,
        })
      }
      onIndexChange={setIndex}
      initialLayout={{ width }}
      swipeEnabled={swipeEnabled}
      style={{ marginBottom: 0, paddingBottom: 0 }}
    />
  );
};

export default TabViewComponent;
