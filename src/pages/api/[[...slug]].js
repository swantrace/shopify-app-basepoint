import Koa from "koa";
import Router from "@koa/router";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify from "@shopify/shopify-api";
import sessionStorage from "@src/lib/session-storage";

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: "2021-07",
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: sessionStorage,
});

const ACTIVE_SHOPIFY_SHOPS = {};

const app = new Koa();
const router = new Router();
app.keys = [Shopify.Context.API_SECRET_KEY];
app.use(
  createShopifyAuth({
    prefix: "/api",
    async afterAuth(ctx) {
      // Access token and shop available in ctx.state.shopify
      const { shop, accessToken, scope } = ctx.state.shopify;
      const host = ctx.query.host;

      ACTIVE_SHOPIFY_SHOPS[shop] = scope;
      global.ACTIVE_SHOPIFY_SHOPS = ACTIVE_SHOPIFY_SHOPS;

      const response = await Shopify.Webhooks.Registry.register({
        shop,
        accessToken,
        path: "/api/webhooks",
        topic: "APP_UNINSTALLED",
        webhookHandler: async (topic, shop, body) =>
          delete ACTIVE_SHOPIFY_SHOPS[shop],
      });

      if (!response.success) {
        console.log(
          `Failed to register APP_UNINSTALLED webhook: ${response.result}`
        );
      }

      // Redirect to app with shop parameter upon auth
      ctx.redirect(`/?shop=${shop}&host=${host}`);
    },
  })
);

router.post("/api/webhooks", async (ctx) => {
  try {
    await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
    console.log(`Webhook processed, returned status code 200`);
  } catch (error) {
    console.log(`Failed to process webhook: ${error}`);
  }
});

router.post(
  "/api/graphql",
  verifyRequest({
    returnHeader: true,
    authRoute: "/api/auth",
    fallbackRoute: "/api/auth",
  }),
  async (ctx, next) => {
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  }
);

router.get(
  "/api/verifyRequest",
  verifyRequest({ authRoute: "/api/auth", fallbackRoute: "/api/auth" }),
  async (ctx, next) => {
    ctx.body = "true";
  }
);

app.use(router.routes()).use(router.allowedMethods());

export default app.callback();
export const config = {
  api: {
    bodyParser: false,
  },
};
