import { likeLoaderByQuackId, likeLoaderByUserId } from "./utils/likeLoader";
import {
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "./utils/requackLoader";
import { userLoader } from "./utils/userLoader";

export type MyContext = {
  req: Express.Request;
  res: Express.Response;
  userLoader: ReturnType<typeof userLoader>;
  requackLoaderByQuackId: ReturnType<typeof requackLoaderByQuackId>;
  requackLoaderByUserId: ReturnType<typeof requackLoaderByUserId>;
  likeLoaderByQuackId: ReturnType<typeof likeLoaderByQuackId>;
  likeLoaderByUserId: ReturnType<typeof likeLoaderByUserId>;
};
