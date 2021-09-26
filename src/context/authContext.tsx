import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "../types/context";

type AuthState = {
  followedSpaces: { space: { id: string } }[];
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const AuthDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const AUTH_ACTIONS = {
  SET_FOLLOWED_SPACES: "@auth/SET_FOLLOWED_SPACES",
};

const initialState = {
  followedSpaces: [],
};

function authReducer(state: AuthState, action: ContextAction) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_FOLLOWED_SPACES:
      return { ...state, followedSpaces: action.payload };
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
