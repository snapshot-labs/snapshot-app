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
      space {
        id
        name
        members
        avatar
        symbol
      }
      type
      scores_state
      scores_total
      scores
      votes
    }
  }
`;

export const PROPOSAL_VOTES_QUERY = gql`
  query ($id: String!) {
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
        symbol
      }
    }
    votes(first: 10000, where: { proposal: $id }) {
      id
      voter
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
      voting {
        delay
        period
        type
        quorum
      }
      strategies {
        name
        params
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
        }
      }
    }
  }
`;
