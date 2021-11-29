export type Proposal = {
  author: string;
  body: string;
  created: number;
  end: number;
  id: string;
  space: {
    id: string;
    name: string;
    members: [];
    avatar: string;
    symbol: string;
  };
  start: number;
  state: string;
  title: string;
  snapshot: string;
  type: string;
  strategies: any;
  choices?: string[];
  votes: number;
  scores_state: string;
  scores_total: number;
  scores: number[];
};
