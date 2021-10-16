export type Proposal = {
  author: string;
  body: string;
  created: number;
  end: number;
  id: string;
  space: { id: string; name: string; members: []; avatar: string };
  start: number;
  state: string;
  title: string;
  snapshot: string;
  type: string;
  strategies: any;
  choices?: string[]
};
