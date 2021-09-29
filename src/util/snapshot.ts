import { getScores } from "@snapshot-labs/snapshot.js/src/utils";
import getProvider from "@snapshot-labs/snapshot.js/src/utils/provider";
import voting from "./voting";

export async function getResults(space, proposal, votes) {
  try {
    const voters = votes.map((vote) => vote.voter);
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
            (strategy, i) => scores[i][vote.voter] || 0
          );
          vote.balance = vote.scores.reduce((a, b: any) => a + b, 0);
          return vote;
        })
        .sort((a, b) => b.balance - a.balance)
        .filter((vote) => vote.balance > 0);
      console.log("SORTED VOTES", votes[0]);
    }

    /* Get results */
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
