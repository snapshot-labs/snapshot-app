import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "../types/context";
import storage from "../util/storage";

type AuthState = {
  followedSpaces: { space: { id: string } }[];
  connectedAddress: null | string | undefined;
  isWalletConnect: undefined | boolean;
  aliases: { [id: string]: string };
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const AUTH_ACTIONS = {
  SET_FOLLOWED_SPACES: "@auth/SET_FOLLOWED_SPACES",
  SET_CONNECTED_ADDRESS: "@auth/SET_CONNECTED_ADDRESS",
  LOGOUT: "@auth/LOGOUT",
  SET_ALIAS: "@auth/SET_ALIAS",
  SET_INITIAL_ALIASES: "@auth/SET_INITIAL_ALIASES",
};

const initialState = {
  connectedAddress: null,
  followedSpaces: [],
  isWalletConnect: false,
  aliases: {},
};

function authReducer(state: AuthState, action: ContextAction) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_FOLLOWED_SPACES:
      return { ...state, followedSpaces: action.payload };
    case AUTH_ACTIONS.SET_CONNECTED_ADDRESS:
      const connectedAddress = action.payload.connectedAddress;
      if (action.payload.addToStorage) {
        storage.save(storage.KEYS.connectedAddress, connectedAddress);
        if (action.payload.isWalletConnect) {
          storage.save(storage.KEYS.isWalletConnect, "true");
        }
      }
      return {
        ...state,
        connectedAddress,
        isWalletConnect: action.payload.isWalletConnect,
      };
    case AUTH_ACTIONS.SET_INITIAL_ALIASES:
      return { ...state, aliases: action.payload ?? {} };
    case AUTH_ACTIONS.SET_ALIAS:
      const aliases = Object.assign(action.payload, state.aliases);
      storage.save(storage.KEYS.aliases, JSON.stringify(aliases));
      return { ...state, aliases };
    case AUTH_ACTIONS.LOGOUT:
      storage.clearAll();
      return initialState;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useReducer(authReducer, initialState);

  return (
    <AuthContext.Provider value={auth}>
      <AuthDispatchContext.Provider value={setAuth}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}

function useAuthState() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("Unable to find AuthProvider");
  }

  return context;
}

function useAuthDispatch() {
  const context = useContext(AuthDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find AuthDispatchProvider");
  }

  return context;
}

export { AuthProvider, useAuthState, useAuthDispatch, AuthState, AUTH_ACTIONS };
