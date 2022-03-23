import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";
import storage from "helpers/storage";
import { Wallet } from "ethers";
import WalletConnect from "@walletconnect/client";
import {
  initialWalletConnectValues,
  setWalletConnectListeners,
} from "helpers/walletConnectUtils";
import colors, { getColorScheme } from "constants/colors";
import { CUSTOM_WALLET_NAME, SNAPSHOT_WALLET } from "constants/wallets";

type AuthState = {
  followedSpaces: { space: { id: string } }[];
  connectedAddress: string;
  isWalletConnect: undefined | boolean;
  aliases: { [id: string]: string };
  androidAppUrl: string | null;
  aliasWallet: Wallet | null;
  savedWallets: { [id: string]: { name: string; address: string } };
  wcConnector: WalletConnect;
  refreshFeed: null | { spaceId: string };
  theme: string | "light" | "dark";
  colors: any;
  snapshotWallets: string[];
  subscriptions: any;
  votedProposals: any;
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
  SET_CONNECTED_ANDROID_APP_URL: "@auth/SET_CONNECTED_ANDROID_APP_URL",
  SET_ALIAS_WALLET: "@auth/SET_ALIAS_WALLET",
  SET_SAVED_WALLETS: "@auth/SET_SAVED_WALLETS",
  SET_OVERWRITE_SAVED_WALLETS: "@auth/SET_OVERWRITE_SAVED_WALLETS",
  SET_WC_CONNECTOR: "@auth/SET_WC_CONNECTOR",
  SET_REFRESH_FEED: "@auth/SET_REFRESH_FEED",
  SET_THEME: "@auth/SET_THEME",
  SET_SNAPSHOT_WALLETS: "@auth/SET_SNAPSHOT_WALLETS",
  SET_SUBSCRIPTIONS: "@auth/SET_SUBSCRIPTIONS",
  SET_VOTED_PROPOSALS: "@auth/SET_VOTED_PROPOSALS",
};

const initialState = {
  connectedAddress: null,
  followedSpaces: [],
  isWalletConnect: false,
  aliases: {},
  androidAppUrl: null,
  aliasWallet: null,
  savedWallets: {},
  wcConnector: null,
  refreshFeed: null,
  snapshotWallets: [],
  theme: "light",
  subscriptions: {},
  votedProposals: {},
  colors,
};

function authReducer(state: AuthState, action: ContextAction) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_FOLLOWED_SPACES:
      return { ...state, followedSpaces: action.payload };
    case AUTH_ACTIONS.SET_CONNECTED_ADDRESS: {
      const connectedAddress = action.payload.connectedAddress;
      const savedWallets = { ...state.savedWallets };
      if (action.payload.addToStorage) {
        storage.save(storage.KEYS.connectedAddress, connectedAddress);
        if (action.payload.isWalletConnect) {
          storage.save(storage.KEYS.isWalletConnect, "true");
        }
      }

      if (action.payload.addToSavedWallets) {
        savedWallets[action.payload.connectedAddress.toLowerCase()] = {
          name: action.payload.isSnapshotWallet
            ? SNAPSHOT_WALLET
            : CUSTOM_WALLET_NAME,
          address: connectedAddress,
        };
        storage.save(storage.KEYS.savedWallets, JSON.stringify(savedWallets));
      }

      console.log({ savedWallets });

      return {
        ...state,
        connectedAddress,
        isWalletConnect: action.payload.isWalletConnect,
        savedWallets,
      };
    }
    case AUTH_ACTIONS.SET_INITIAL_ALIASES:
      return { ...state, aliases: action.payload ?? {} };
    case AUTH_ACTIONS.SET_ALIAS:
      const aliases = Object.assign(state.aliases, action.payload);
      storage.save(storage.KEYS.aliases, JSON.stringify(aliases));
      return { ...state, aliases };
    case AUTH_ACTIONS.SET_CONNECTED_ANDROID_APP_URL:
      storage.save(storage.KEYS.androidAppUrl, action.payload);
      return { ...state, androidAppUrl: action.payload };
    case AUTH_ACTIONS.SET_ALIAS_WALLET:
      return { ...state, aliasWallet: action.payload };
    case AUTH_ACTIONS.SET_SNAPSHOT_WALLETS:
      return { ...state, snapshotWallets: action.payload };
    case AUTH_ACTIONS.SET_SUBSCRIPTIONS:
      return { ...state, subscriptions: action.payload };
    case AUTH_ACTIONS.SET_SAVED_WALLETS:
      let savedWallets = { ...state.savedWallets };
      if (action.payload) {
        savedWallets = { ...savedWallets, ...action.payload };
      }
      return { ...state, savedWallets };
    case AUTH_ACTIONS.SET_WC_CONNECTOR:
      let wcConnector;
      if (action.payload.newConnector) {
        wcConnector = action.payload.newConnector;
        setWalletConnectListeners(
          wcConnector,
          action.payload.androidAppUrl,
          action.payload.walletService
        );
      } else {
        if (action.payload.session) {
          wcConnector = new WalletConnect({
            ...initialWalletConnectValues,
            session: action.payload.session,
          });
          setWalletConnectListeners(
            wcConnector,
            action.payload.androidAppUrl,
            action.payload.walletService
          );
        }
      }

      if (wcConnector) {
        wcConnector.send = async (type: string, params: any) => {
          //@ts-ignore
          return await wcConnector.signPersonalMessage(params);
        };
      }

      return {
        ...state,
        wcConnector,
      };
    case AUTH_ACTIONS.SET_OVERWRITE_SAVED_WALLETS:
      return { ...state, savedWallets: action.payload };
    case AUTH_ACTIONS.SET_REFRESH_FEED:
      return { ...state, refreshFeed: action.payload };
    case AUTH_ACTIONS.SET_THEME:
      const colors = getColorScheme(action.payload);
      storage.save(storage.KEYS.theme, action.payload);
      return { ...state, theme: action.payload, colors };
    case AUTH_ACTIONS.SET_VOTED_PROPOSALS:
      return { ...state, votedProposals: action.payload };
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
