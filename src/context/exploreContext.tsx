import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "../types/context";
import { Space } from "../types/explore";

type ExploreState = {
  networks: {};
  plugins: {};
  skins: {};
  strategies: {};
  spaces: { [id: string]: Space };
};

const ExploreContext = createContext<ExploreState | undefined>(undefined);
const ExploreDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const EXPLORE_ACTIONS = {
  SET_EXPLORE: "@explore/EXPLORE",
};

const initialState = {
  networks: {},
  plugins: {},
  skins: {},
  strategies: {},
  spaces: {},
};

function exploreReducer(state: ExploreState, action: ContextAction) {
  switch (action.type) {
    case EXPLORE_ACTIONS.SET_EXPLORE:
      return { ...state, ...action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type ExploreProviderProps = {
  children: ReactNode;
};

function ExploreProvider({ children }: ExploreProviderProps) {
  const [auth, setAuth] = useReducer(exploreReducer, initialState);

  return (
    <ExploreContext.Provider value={auth}>
      <ExploreDispatchContext.Provider value={setAuth}>
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
