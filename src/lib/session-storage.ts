import Shopify from "@shopify/shopify-api";
import { Session } from "@shopify/shopify-api/dist/auth/session";
import redis from "./redis";

const storeCallback = async (session: Session) => {
  try {
    return !!(await redis.set(session.id, JSON.stringify(session)));
  } catch (err) {
    throw new Error(err);
  }
};

const loadCallback = async (id: string) => {
  try {
    let reply = await redis.get(id);
    if (reply) {
      return JSON.parse(reply) as Session;
    } else {
      return undefined;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const deleteCallback = async (id: string) => {
  try {
    return !!(await redis.del(id));
  } catch (err) {
    throw new Error(err);
  }
};

const sessionStorage = new Shopify.Session.CustomSessionStorage(
  storeCallback,
  loadCallback,
  deleteCallback
);

export default sessionStorage;
