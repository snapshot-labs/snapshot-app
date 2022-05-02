import React, { createContext, useReducer, useContext, ReactNode } from "react";
import { ContextAction, ContextDispatch } from "types/context";

type CreateProposalState = {
  title: string;
  body: string;
};

const CreateProposalContext = createContext<CreateProposalState | undefined>(
  undefined
);
const CreateProposalDispatchContext = createContext<
  ContextDispatch | undefined
>(undefined);

const CREATE_PROPOSAL_ACTIONS = {
  UPDATE_TITLE_AND_BODY: "@createProposalActions/UPDATE_TITLE",
};

const initialState = {
  title: "",
  body: "",
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
