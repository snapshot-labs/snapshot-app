import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";
import { Proposal } from "types/proposal";

type NotificationsState = {
  proposals: Proposal[];
};

const NotificationsContext = createContext<NotificationsState | undefined>(
  undefined
);
const NotificationsDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const NOTIFICATIONS_ACTIONS = {
  SET_PROPOSALS: "@notifications/SET_PROPOSALS",
};

const initialState = {
  proposals: [],
};

function notificationsReducer(
  state: NotificationsState,
  action: ContextAction
) {
  switch (action.type) {
    case NOTIFICATIONS_ACTIONS.SET_PROPOSALS:
      return {
        ...state,
        proposals: action.payload,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type NotificationsProviderProps = {
  children: ReactNode;
};

function NotificationsProvider({ children }: NotificationsProviderProps) {
  const [notifications, setNotifications] = useReducer(
    notificationsReducer,
    initialState
  );

  return (
    <NotificationsContext.Provider value={notifications}>
      <NotificationsDispatchContext.Provider value={setNotifications}>
        {children}
      </NotificationsDispatchContext.Provider>
    </NotificationsContext.Provider>
  );
}

function useNotificationsState() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("Unable to find NotificationsState");
  }

  return context;
}

function useNotificationsDispatch() {
  const context = useContext(NotificationsDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find NotificationsDispatchProvider");
  }

  return context;
}

export {
  NotificationsProvider,
  useNotificationsState,
  useNotificationsDispatch,
  NotificationsState,
  NOTIFICATIONS_ACTIONS,
};
