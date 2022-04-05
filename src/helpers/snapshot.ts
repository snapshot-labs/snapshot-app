import { getScores } from "@snapshot-labs/snapshot.js/src/utils";
import voting from "./voting";
import { Space } from "types/explore";
import { Proposal } from "types/proposal";
import { ethers } from "ethers";

export async function getResults(space: any, proposal: any, votes: any) {
  try {
    const voters = votes.map((vote: any) => vote.voter);
    const strategies = proposal.strategies ?? space.strategies;
    /* Get scores */
    if (proposal.state !== "pending") {
      const scores = await getScores(
        space?.id,
        strategies,
        space?.network,
        voters,
        parseInt(proposal.snapshot)
      );

      votes = votes
        .map((vote: any) => {
          vote.scores = strategies.map(
            (strategy: any, i: any) => scores[i][vote.voter] || 0
          );
          vote.balance = vote.scores.reduce((a: number, b: number) => a + b, 0);
          return vote;
        })
        .sort((a: any, b: any) => b.balance - a.balance)
        .filter((vote: any) => vote.balance > 0);
    }

    //@ts-ignore
    const votingClass = new voting[proposal.type](proposal, votes, strategies);
    const results = {
      resultsByVoteBalance: votingClass.resultsByVoteBalance(),
      resultsByStrategyScore: votingClass.resultsByStrategyScore(),
      sumOfResultsBalance: votingClass.sumOfResultsBalance(),
    };

    return { votes, results };
  } catch (e) {
    console.log("GET RESULTS ERROR", e);
    return { votes, results: {} };
  }
}

export async function getPower(
  space: Space,
  address: string,
  proposal: Proposal | any
) {
  try {
    const strategies = proposal.strategies ?? space.strategies;
    const checksumAddress = ethers.utils.getAddress(address);
    let scores: any = await getScores(
      space.id ?? "",
      strategies,
      space.network,
      [checksumAddress],
      proposal.snapshot !== "latest"
        ? parseInt(proposal.snapshot)
        : proposal.snapshot
    );
    const scoresByStrategy = strategies.map(
      (strategy, i) => scores[i][checksumAddress] || 0
    );

    return {
      scoresByStrategy,
      totalScore: scoresByStrategy.reduce((a, b: any) => a + b, 0),
    };
  } catch (e) {
    console.log("POWER ERROR", e);
    return e;
  }
}
