import {
  ApolloProvider as RealApolloProvider,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
} from '@apollo/client';

import { AppProvider } from '@shopify/polaris';
import { Provider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '@components/ClientRouter';
import { AppWrapper } from '@lib/context';
import { ClientApplication } from '@shopify/app-bridge';
import { NextPageContext } from 'next';

interface IAppState {
  appInfo: any;
  loading: any;
  modal: any;
  navigation: any;
  pos: any;
  resourcePicker: any;
  staffMember: any;
  titleBar: any;
  toast: any;
}

const userLoggedInFetch = (app: ClientApplication<IAppState>) => {
  const fetchFunction = authenticatedFetch(app);

  return async (
    uri: RequestInfo,
    options: RequestInit | undefined
  ): Promise<Response> => {
    const response = await fetchFunction(uri, options);
    if (
      response.headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1'
    ) {
      const authUrlHeader = response.headers.get(
        'X-Shopify-API-Request-Failure-Reauthorize-Url'
      );

      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/api/auth`);
      return Promise.resolve(new Response());
    }

    return response;
  };
};

function ApolloProvider({ children }: { children: React.ReactNode }) {
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
        uri: '/api/graphql',
        fetch: userLoggedInFetch(app),
        credentials: 'include',
      })
    ),
  });

  return <RealApolloProvider client={client}>{children}</RealApolloProvider>;
}

interface IAppProps {
  Component: any;
  pageProps: any;
  host: any;
}

const MyApp = (props: IAppProps): JSX.Element => {
  const { Component, pageProps, host } = props;

  let savedHost = host;

  if (typeof window !== 'undefined') {
    if (savedHost) {
      window.localStorage.setItem('shopify-host', savedHost);
    } else {
      savedHost = window.localStorage.getItem('shopify-host');
    }
  }

  return (
    <AppProvider i18n={translations}>
      <Provider
        config={{
          apiKey: process.env.SHOPIFY_API_KEY ?? '',
          host: savedHost,
          forceRedirect: true,
        }}
      >
        <ClientRouter />
        <ApolloProvider>
          <AppWrapper>
            <Component {...pageProps} />
          </AppWrapper>
        </ApolloProvider>
      </Provider>
    </AppProvider>
  );
};

MyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => ({
  host: ctx.query.host,
});

export default MyApp;
