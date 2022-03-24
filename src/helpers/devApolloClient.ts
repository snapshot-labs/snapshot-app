import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: `https://snap-hack-hub.herokuapp.com/graphql`,
});

const devApolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    addTypename: false,
  }),
  defaultOptions: {
    query: {
      fetchPolicy: "no-cache",
    },
  },
});

export default devApolloClient;
