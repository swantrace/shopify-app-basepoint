import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/dist/styles.css";
import translations from "@shopify/polaris/locales/en.json";
import ClientRouter from "../components/ClientRouter";
import { useRef } from "react";

const userLoggedInFetch = (app) => {
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    const response = await fetchFunction(uri, options);
    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/api/auth`);
      return null;
    }

    return response;
  };
};

function MyProvider(props) {
  const app = useAppBridge();

  const client = new ApolloClient({
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            products: {
              keyArgs: false,
              merge(...args) {
                return args[1];
              },
            },
          },
        },
      },
    }),
    link: new ApolloLink((operation, forward) =>
      forward(operation).map((response) => {
        if (response.data) {
          response.data.extensions = response.extensions;
        }
        return response;
      })
    ).concat(
      new HttpLink({
        uri: "/api/graphql",
        fetch: userLoggedInFetch(app),
        credentials: "include",
      })
    ),
  });

  const Component = props.Component;

  return (
    <ApolloProvider client={client}>
      <Component {...props} />
    </ApolloProvider>
  );
}

const MyApp = (props) => {
  const { Component, pageProps, host } = props;
  const { current: savedHost } = useRef(host);
  console.log("savedHost", savedHost);
  return (
    <AppProvider i18n={translations}>
      <Provider
        config={{
          apiKey: process.env.SHOPIFY_API_KEY,
          host: savedHost,
          forceRedirect: true,
        }}
      >
        <ClientRouter />
        <MyProvider Component={Component} {...pageProps} />
      </Provider>
    </AppProvider>
  );
};

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  };
};

export default MyApp;
