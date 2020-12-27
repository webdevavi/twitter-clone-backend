import {
  likeLoader,
  likeLoaderByQuackId,
  likeLoaderByUserId,
} from "./utils/likeLoader";
import {
  requackLoader,
  requackLoaderByQuackId,
  requackLoaderByUserId,
} from "./utils/requackLoader";
import { userLoader } from "./utils/userLoader";

export type MyContext = {
  req: Express.Request;
  res: Express.Response;
  userLoader: ReturnType<typeof userLoader>;
  requackLoader: ReturnType<typeof requackLoader>;
  requackLoaderByQuackId: ReturnType<typeof requackLoaderByQuackId>;
  requackLoaderByUserId: ReturnType<typeof requackLoaderByUserId>;
  likeLoader: ReturnType<typeof likeLoader>;
  likeLoaderByQuackId: ReturnType<typeof likeLoaderByQuackId>;
  likeLoaderByUserId: ReturnType<typeof likeLoaderByUserId>;
};
