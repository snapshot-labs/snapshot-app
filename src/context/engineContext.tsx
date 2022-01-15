import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";

type EngineState = {
  keyRingController: any;
  preferencesController: any;
  accountTrackerController: any;
  seedPhraseBackedUp: boolean;
  backUpSeedPhraseVisible: boolean;
  passwordSetup: boolean;
};

const EngineContext = createContext<EngineState | undefined>(undefined);
const EngineDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const ENGINE_ACTIONS = {
  INIT_ENGINE: "@engine/INIT_ENGINE",
  SEEDPHRASE_BACKED_UP: "@engine/SEEDPHRASE_BACKED_UP",
  PASSWORD_UNSET: "@engine/PASSWORD_UNSET",
  PASSWORD_SET: "@engine/PASSWORD_SET",
  SEEDPHRASE_NOT_BACKED_UP: "@engine/SEEDPHRASE_NOT_BACKED_UP",
};

const initialState = {
  keyRingController: {},
  preferencesController: {},
  seedPhraseBackedUp: false,
  backUpSeedPhraseVisible: false,
  passwordSetup: false,
};

function engineReducer(state: EngineState, action: ContextAction) {
  switch (action.type) {
    case ENGINE_ACTIONS.INIT_ENGINE:
      return {
        ...state,
        keyRingController: action.payload.keyRingController,
        preferencesController: action.payload.preferencesController,
        accountTrackerController: action.payload.accountTrackerController,
      };
    case ENGINE_ACTIONS.SEEDPHRASE_BACKED_UP:
      return {
        ...state,
        seedPhraseBackedUp: true,
        backUpSeedPhraseVisible: false,
      };
    case ENGINE_ACTIONS.SEEDPHRASE_NOT_BACKED_UP:
      return {
        ...state,
        seedPhraseBackedUp: false,
        backUpSeedPhraseVisible: true,
      };
    case ENGINE_ACTIONS.PASSWORD_SET:
      return {
        ...state,
        passwordSetup: true,
      };
    case ENGINE_ACTIONS.PASSWORD_UNSET:
      return {
        ...state,
        passwordSetup: false,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type EngineProviderProps = {
  children: ReactNode;
};

function EngineProvider({ children }: EngineProviderProps) {
  const [engine, setEngine] = useReducer(engineReducer, initialState);

  return (
    <EngineContext.Provider value={engine}>
      <EngineDispatchContext.Provider value={setEngine}>
        {children}
      </EngineDispatchContext.Provider>
    </EngineContext.Provider>
  );
}

function useEngineState() {
  const context = useContext(EngineContext);
  if (context === undefined) {
    throw new Error("Unable to find EngineState");
  }

  return context;
}

function useEngineDispatch() {
  const context = useContext(EngineDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find EngineDispatchProvider");
  }

  return context;
}

export {
  EngineProvider,
  useEngineState,
  useEngineDispatch,
  EngineState,
  ENGINE_ACTIONS,
};
