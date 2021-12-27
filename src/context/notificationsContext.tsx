import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";
import { Proposal } from "types/proposal";
import { NOTIFICATION_EVENTS } from "constants/proposal";
import storage from "helpers/storage";
import forEach from "lodash/forEach";
import concat from "lodash/concat";
import isEmpty from "lodash/isEmpty";
import moment from "moment-timezone";

type NotificationsState = {
  proposals: { [id: string]: Proposal };
  lastViewedNotification: null | number;
  lastViewedProposal: null | string;
  proposalTimes: { id: string; time: number; event: string }[];
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
  proposals: {},
  proposalTimes: [],
  lastViewedProposal: null,
  lastViewedNotification: null,
};

function notificationsReducer(
  state: NotificationsState,
  action: ContextAction
) {
  switch (action.type) {
    case NOTIFICATIONS_ACTIONS.SET_PROPOSALS:
      const { proposals, proposalTimes } = action.payload;
      const today = parseInt((moment().valueOf() / 1e3).toFixed());
      const proposalsMap: { [id: string]: Proposal } = {};
      const startProposalTimes: { [id: string]: boolean } = {};
      const endProposalTimes: { [id: string]: boolean } = {};

      forEach(proposals, (proposal: Proposal) => {
        proposalsMap[proposal.id] = proposal;
      });

      const newProposalTimes = concat(state.proposalTimes, proposalTimes);

      newProposalTimes.sort((a, b) => {
        return Math.abs(today - a.time) - Math.abs(today - b.time);
      });

      const updatedProposalTimes: {
        id: string;
        time: number;
        event: string;
      }[] = [];

      forEach(newProposalTimes, (proposalTime) => {
        if (proposalTime.event === NOTIFICATION_EVENTS.PROPOSAL_START) {
          if (startProposalTimes[proposalTime.id] !== true) {
            updatedProposalTimes.push(proposalTime);
            startProposalTimes[proposalTime.id] = true;
          }
        } else if (proposalTime.event === NOTIFICATION_EVENTS.PROPOSAL_END) {
          if (endProposalTimes[proposalTime.id] !== true) {
            updatedProposalTimes.push(proposalTime);
            endProposalTimes[proposalTime.id] = true;
          }
        }
      });

      return {
        ...state,
        proposals: proposalsMap,
        proposalTimes: updatedProposalTimes,
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
