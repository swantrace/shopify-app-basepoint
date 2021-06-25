import Koa from "koa";
import Router from "@koa/router";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import Shopify, { ApiVersion } from "@shopify/shopify-api";

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: "2021-07",
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
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
      const { shop } = ctx.state.shopify;
      const host = ctx.query.host;
      ctx.redirect(`/?shop=${shop}&host=${host}`);
    },
  })
);

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

app.use(router.routes()).use(router.allowedMethods());

export default app.callback();
export const config = {
  api: {
    bodyParser: false,
  },
};
