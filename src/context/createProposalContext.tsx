import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";
import { VOTING_TYPES } from "constants/proposal";

type CreateProposalState = {
  title: string;
  body: string;
  votingType: string;
  choices: string[];
  start: number | undefined;
  end: number | undefined;
  snapshot: number | undefined;
};

const CreateProposalContext = createContext<CreateProposalState | undefined>(
  undefined
);
const CreateProposalDispatchContext = createContext<
  ContextDispatch | undefined
>(undefined);

const CREATE_PROPOSAL_ACTIONS = {
  UPDATE_TITLE_AND_BODY: "@createProposalActions/UPDATE_TITLE",
  UPDATE_CHOICES_AND_VOTING_TYPE:
    "@createProposalActions/UPDATE_CHOICES_AND_VOTING_TYPE",
  UPDATE_START_TIME: "@createProposalActions/UPDATE_START_TIME",
  UPDATE_END_TIME: "@createProposalActions/UPDATE_END_TIME",
  UPDATE_SNAPSHOT: "@createProposalActions/UPDATE_SNAPSHOT",
  DUPLICATE_PROPOSAL: "@createProposalActions/DUPLICATE_PROPOSAL",
  RESET_CREATE_PROPOSAL: "@createProposalActions/RESET_CREATE_PROPOSAL",
};

const initialState = {
  title: "",
  body: "",
  votingType: VOTING_TYPES.singleChoice,
  choices: [""],
  start: undefined,
  end: undefined,
  snapshot: undefined,
};

function createProposalReducer(
  state: CreateProposalState,
  action: ContextAction
) {
  switch (action.type) {
    case CREATE_PROPOSAL_ACTIONS.UPDATE_TITLE_AND_BODY:
      return {
        ...state,
        title: action.payload.title,
        body: action.payload.body,
      };
    case CREATE_PROPOSAL_ACTIONS.UPDATE_CHOICES_AND_VOTING_TYPE:
      return {
        ...state,
        votingType: action.payload.votingType,
        choices: action.payload.choices,
      };
    case CREATE_PROPOSAL_ACTIONS.UPDATE_START_TIME:
      return {
        ...state,
        start: action.payload.start,
      };
    case CREATE_PROPOSAL_ACTIONS.UPDATE_END_TIME:
      return {
        ...state,
        end: action.payload.end,
      };
    case CREATE_PROPOSAL_ACTIONS.UPDATE_SNAPSHOT:
      return {
        ...state,
        snapshot: action.payload.snapshot,
      };
    case CREATE_PROPOSAL_ACTIONS.DUPLICATE_PROPOSAL:
      return {
        ...state,
        title: action.payload.title ?? initialState.title,
        body: action.payload.body ?? initialState.body,
        votingType: action.payload.votingType ?? initialState.votingType,
        choices: action.payload.choices ?? initialState.choices,
        start: action.payload.start ?? initialState.start,
        end: action.payload.end ?? initialState.end,
      };
    case CREATE_PROPOSAL_ACTIONS.RESET_CREATE_PROPOSAL:
      return initialState;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

type CreateProposalProviderProps = {
  children: ReactNode;
};

function CreateProposalProvider({ children }: CreateProposalProviderProps) {
  const [createProposal, setCreateProposal] = useReducer(
    createProposalReducer,
    initialState
  );

  return (
    <CreateProposalContext.Provider value={createProposal}>
      <CreateProposalDispatchContext.Provider value={setCreateProposal}>
        {children}
      </CreateProposalDispatchContext.Provider>
    </CreateProposalContext.Provider>
  );
}

function useCreateProposalState() {
  const context = useContext(CreateProposalContext);
  if (context === undefined) {
    throw new Error("Unable to find CreateProposalState");
  }

  return context;
}

function useCreateProposalDispatch() {
  const context = useContext(CreateProposalDispatchContext);

  if (context === undefined) {
    throw new Error("Unable to find CreateProposalDispatchProvider");
  }

  return context;
}

export {
  CreateProposalProvider,
  useCreateProposalState,
  useCreateProposalDispatch,
  CreateProposalState,
  CREATE_PROPOSAL_ACTIONS,
};
