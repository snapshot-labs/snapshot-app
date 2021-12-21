import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";
import { Proposal } from "types/proposal";
import storage from "helpers/storage";
import uniqBy from "lodash/uniqBy";
import forEach from "lodash/forEach";

type NotificationsState = {
  proposals: Proposal[];
  lastViewedNotification: null | number;
  lastViewedProposal: null | string;
};

const NotificationsContext = createContext<NotificationsState | undefined>(
  undefined
);
const NotificationsDispatchContext = createContext<ContextDispatch | undefined>(
  undefined
);

const NOTIFICATIONS_ACTIONS = {
  SET_PROPOSALS: "@notifications/SET_PROPOSALS",
  SET_LAST_VIEWED_NOTIFICATION: "@notification/SET_LAST_VIEWED_NOTIFICATION",
};

const initialState = {
  proposals: [],
  lastViewedProposal: null,
  lastViewedNotification: null,
};

function notificationsReducer(
  state: NotificationsState,
  action: ContextAction
) {
  switch (action.type) {
    case NOTIFICATIONS_ACTIONS.SET_PROPOSALS:
      const proposalsMap: { [id: string]: number } = {};
      const newProposals: Proposal[] = [];

      forEach(action.payload, (proposal: Proposal) => {
        if (proposalsMap[proposal.id] === undefined) {
          newProposals.push(proposal);
        }
        proposalsMap[proposal.id] = newProposals.length - 1;
      });

      forEach(state.proposals, (proposal: Proposal) => {
        const oldIndex = proposalsMap[proposal.id];
        if (oldIndex !== undefined) {
          newProposals.splice(oldIndex, 1);
        }
        newProposals.push(proposal);
      });

      return {
        ...state,
        proposals: newProposals,
      };
    case NOTIFICATIONS_ACTIONS.SET_LAST_VIEWED_NOTIFICATION:
      if (action.payload?.saveToStorage) {
        storage.save(
          storage.KEYS.lastViewedNotification,
          `${action.payload?.time}`
        );
        storage.save(
          storage.KEYS.lastViewedProposal,
          `${action.payload?.lastViewedProposal}`
        );
      }
      return {
        ...state,
        lastViewedNotification: action.payload?.time,
        lastViewedProposal: action.payload?.lastViewedProposal,
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
