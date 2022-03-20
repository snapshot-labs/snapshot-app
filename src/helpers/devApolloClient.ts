import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: `http://localhost:8000/graphql`,
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
