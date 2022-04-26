import gql from "graphql-tag";

export const PROPOSAL_QUERY = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      type
      strategies {
        name
        params
      }
      space {
        id
        name
      }
    }
  }
`;

export const PROPOSALS_QUERY = gql`
  query Proposals(
    $first: Int!
    $skip: Int!
    $state: String!
    $space: String
    $space_in: [String]
    $author_in: [String]
    $start_gt: Int
    $end_gt: Int
  ) {
    proposals(
      first: $first
      skip: $skip
      where: {
        space: $space
        state: $state
        space_in: $space_in
        author_in: $author_in
        start_gt: $start_gt
        end_gt: $end_gt
      }
    ) {
      id
      ipfs
      title
      body
      start
      end
      state
      author
      created
      choices
      snapshot
      network
      space {
        id
        name
        members
        avatar
        symbol
        network
        strategies {
          name
          network
          params
        }
      }
      strategies {
        name
        params
        network
      }
      type
      scores_state
      scores_total
      scores
      votes
      quorum
    }
  }
`;

export const PROPOSAL_VOTES_QUERY = gql`
  query ($id: String! $voteLimit: Int) {
    proposal(id: $id) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      type
      scores_state
      scores_total
      scores
      votes
      quorum
      strategies {
        name
        params
        network
      }
      space {
        id
        name
        members
        avatar
        symbol
        network
        strategies {
          name
          params
          network
        }
      }
    }
    votes(
      first: $voteLimit
      where: { proposal: $id }
      orderBy: "vp"
      orderDirection: desc
    ) {
      id
      voter
      vp
      vp_by_strategy
      created
      choice
    }
  }
`;

export const FOLLOWS_QUERY = gql`
  query Follows($space_in: [String], $follower_in: [String]) {
    follows(where: { space_in: $space_in, follower_in: $follower_in }) {
      id
      follower
      space {
        network
        id
        name
        symbol
        avatar
        members
        strategies {
          name
          params
          network
        }
      }
    }
  }
`;

export const ALIASES_QUERY = gql`
  query Aliases($address: String!, $alias: String!) {
    aliases(where: { address: $address, alias: $alias }) {
      address
      alias
    }
  }
`;

export const SPACES_QUERY = gql`
  query Spaces($id_in: [String]) {
    spaces(where: { id_in: $id_in }) {
      id
      name
      about
      network
      symbol
      network
      terms
      skin
      avatar
      twitter
      github
      private
      domain
      members
      admins
      categories
      plugins
      followersCount
      voting {
        delay
        period
        type
        quorum
        hideAbstain
      }
      strategies {
        name
        params
        network
      }
      validation {
        name
        params
      }
      filters {
        minScore
        onlyMembers
      }
    }
  }
`;

export const SUBSCRIPTIONS_QUERY = gql`
  query Subscriptions($space: String, $address: String) {
    subscriptions(where: { space: $space, address: $address }) {
      id
      address
      space {
        id
      }
    }
  }
`;

export const USER_VOTES_QUERY = gql`
  query Votes($voter: String) {
    votes(where: { voter: $voter }) {
      id
      voter
      created
      choice
      vp
      vp_by_strategy
      proposal {
        type
        id
        ipfs
        title
        body
        start
        end
        state
        author
        created
        choices
        space {
          id
          name
          members
          avatar
          symbol
        }
        scores_state
        scores_total
        scores
        votes
        snapshot
        strategies {
          name
          params
          network
        }
      }
    }
  }
`;

export const WALLET_FOLLOWS = gql`
  query WalletFollows($follower: String) {
    walletFollows(where: { follower: $follower }) {
      id
      follower
      wallet
      created
    }
  }
`;

export const WALLET_FOLLOWERS = gql`
  query WalletFollows($wallet: String) {
    walletFollows(where: { wallet: $wallet }) {
      id
      follower
      wallet
      created
    }
  }
`;

export const ALL_WALLET_FOLLOWS = gql`
  query WalletFollows {
    walletFollows {
      id
      follower
      wallet
      created
    }
  }
`;

export const DELEGATORS = gql`
  query DelegatorFor($delegator: String) {
    delegations(where: { delegator: $delegator }) {
      space
    }
  }
`;

export const PROPOSAL_VOTERS = gql`
  query Votes($proposal: String) {
    votes(
      first: 5
      skip: 0
      where: { proposal: $proposal }
      orderBy: "vp"
      orderDirection: desc
    ) {
      id
      voter
      vp
      vp_by_strategy
    }
  }
`;
