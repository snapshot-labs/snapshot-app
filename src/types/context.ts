export type ContextAction = {
  type: string;
  payload?: any;
};

export type ContextDispatch = (action: ContextAction) => void;
