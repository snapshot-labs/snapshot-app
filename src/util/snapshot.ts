import { getScores } from "@snapshot-labs/snapshot.js/src/utils";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import voting from "./voting";
import { Space } from "../types/explore";
import { Proposal } from "../types/proposal";

export async function getResults(space: any, proposal: any, votes: any) {
  try {
    const voters = votes.map((vote: any) => vote.voter);
    const provider = getProvider(space.network);
    const strategies = proposal.strategies ?? space.strategies;
    /* Get scores */
    if (proposal.state !== "pending") {
      const scores = await getScores(
        space.id,
        strategies,
        space.network,
        provider,
        voters,
        parseInt(proposal.snapshot)
      );

      votes = votes
        .map((vote: any) => {
          vote.scores = strategies.map(
            (strategy: any, i: any) => scores[i][vote.voter] || 0
          );
          vote.balance = vote.scores.reduce((a, b: any) => a + b, 0);
          return vote;
        })
        .sort((a: any, b: any) => b.balance - a.balance)
        .filter((vote: any) => vote.balance > 0);
    }

    /* Get results */
    //@ts-ignore
    const votingClass = new voting[proposal.type](proposal, votes, strategies);
    const results = {
      resultsByVoteBalance: votingClass.resultsByVoteBalance(),
      resultsByStrategyScore: votingClass.resultsByStrategyScore(),
      sumOfResultsBalance: votingClass.sumOfResultsBalance(),
    };

    return { votes, results };
  } catch (e) {
    console.log("GET RESULTS ERROR", votes);
    return e;
  }
}

export async function getPower(
  space: Space,
  address: string,
  proposal: Proposal
) {
  try {
    const strategies = proposal.strategies ?? space.strategies;
    let scores: any = await getScores(
      space.id ?? "",
      strategies,
      space.network,
      getProvider(space.network),
      [address],
      parseInt(proposal.snapshot)
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return {
      scores,
      totalScore: scores.reduce((a, b: any) => a + b, 0),
    };
  } catch (e) {
    console.log(e);
    return e;
  }
}
