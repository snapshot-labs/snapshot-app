import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "../types/context";
import storage from "../util/storage";

type AuthState = {
  followedSpaces: { space: { id: string } }[];
  connectedAddress: null | string;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const AUTH_ACTIONS = {
  SET_FOLLOWED_SPACES: "@auth/SET_FOLLOWED_SPACES",
  SET_CONNECTED_ADDRESS: "@auth/SET_CONNECTED_ADDRESS",
  LOGOUT: "@auth/LOGOUT",
};

const initialState = {
  connectedAddress: null,
  followedSpaces: [],
};

function authReducer(state: AuthState, action: ContextAction) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_FOLLOWED_SPACES:
      return { ...state, followedSpaces: action.payload };
    case AUTH_ACTIONS.SET_CONNECTED_ADDRESS:
      const connectedAddress = action.payload.connectedAddress;
      if (action.payload.addToStorage) {
        storage.save(storage.KEYS.connectedAddress, connectedAddress);
      }
      return { ...state, connectedAddress };
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
