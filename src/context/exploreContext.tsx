import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "../types/context";
import { Space, Strategy } from "../types/explore";

type ExploreState = {
  networks: { [id: string]: number };
  plugins: {};
  skins: { [id: string]: number };
  strategies: { [id: string]: number };
  fullStrategies: { [id: string]: Strategy };
  spaces: { [id: string]: Space };
  profiles: { [id: string]: any };
  categories: { [id: string]: number };
};

const ExploreContext = createContext<ExploreState | undefined>(undefined);
const ExploreDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const EXPLORE_ACTIONS = {
  SET_EXPLORE: "@explore/SET_EXPLORE",
  SET_FULL_STRATEGIES: "@explore/SET_FULL_STRATEGIES",
  UPDATE_SPACES: "@explore/UPDATE_SPACES",
  SET_PROFILES: "@explore/SET_PROFILES",
};

const initialState = {
  networks: {},
  plugins: {},
  skins: {},
  strategies: {},
  spaces: {},
  fullStrategies: {},
  profiles: {},
  categories: {},
};

function exploreReducer(state: ExploreState, action: ContextAction) {
  switch (action.type) {
    case EXPLORE_ACTIONS.SET_EXPLORE:
      const categories: any = {};
      for (let key in action.payload?.spaces) {
        action.payload.spaces[key]?.categories?.forEach((category: string) => {
          if (categories[category] !== undefined) {
            categories[category] = categories[category] + 1;
          } else {
            categories[category] = 1;
          }
        });
      }

      return { ...state, ...action.payload, categories };
    case EXPLORE_ACTIONS.UPDATE_SPACES:
      const newSpaces = { ...state.spaces };
      if (Array.isArray(action.payload)) {
        action.payload.forEach((space) => {
          const currentSpace = newSpaces[space.id];
          if (currentSpace) {
            newSpaces[space.id] = {
              ...currentSpace,
              ...space,
            };
          } else {
            newSpaces[space.id] = space;
          }
        });
      }

      return { ...state, spaces: newSpaces };
    case EXPLORE_ACTIONS.SET_FULL_STRATEGIES:
      return { ...state, fullStrategies: action.payload };
    case EXPLORE_ACTIONS.SET_PROFILES:
      return { ...state, profiles: { ...state.profiles, ...action.payload } };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type ExploreProviderProps = {
  children: ReactNode;
};

function ExploreProvider({ children }: ExploreProviderProps) {
  const [explore, setExplore] = useReducer(exploreReducer, initialState);

  return (
    <ExploreContext.Provider value={explore}>
      <ExploreDispatchContext.Provider value={setExplore}>
        {children}
      </ExploreDispatchContext.Provider>
    </ExploreContext.Provider>
  );
}

function useExploreState() {
  const context = useContext(ExploreContext);
  if (context === undefined) {
    throw new Error("Unable to find AuthProvider");
  }

  return context;
}

function useExploreDispatch() {
  const context = useContext(ExploreDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find AuthDispatchProvider");
  }

  return context;
}

export {
  ExploreProvider,
  useExploreState,
  useExploreDispatch,
  ExploreState,
  EXPLORE_ACTIONS,
};
