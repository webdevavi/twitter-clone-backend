"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apolloConfig = void 0;
const type_graphql_1 = require("type-graphql");
const block_1 = require("../resolvers/block");
const follow_1 = require("../resolvers/follow");
const like_1 = require("../resolvers/like");
const news_1 = require("../resolvers/news");
const quack_1 = require("../resolvers/quack");
const requack_1 = require("../resolvers/requack");
const user_1 = require("../resolvers/user");
const authChecker_1 = require("../utils/authChecker");
const blockLoader_1 = require("../utils/blockLoader");
const followLoader_1 = require("../utils/followLoader");
const likeLoader_1 = require("../utils/likeLoader");
const requackLoader_1 = require("../utils/requackLoader");
const userLoader_1 = require("../utils/userLoader");
const apolloConfig = ({ redis, }) => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [
                user_1.UserResolver,
                follow_1.FollowResolver,
                quack_1.QuackResolver,
                block_1.BlockResolver,
                requack_1.RequackResolver,
                like_1.LikeResolver,
                news_1.NewsResolver,
            ],
            validate: false,
            authChecker: authChecker_1.authChecker,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            cache: redis,
            userLoader: userLoader_1.userLoader(),
            requackLoader: requackLoader_1.requackLoader(),
            requackLoaderByUserId: requackLoader_1.requackLoaderByUserId(),
            requackLoaderByQuackId: requackLoader_1.requackLoaderByQuackId(),
            likeLoader: likeLoader_1.likeLoader(),
            likeLoaderByQuackId: likeLoader_1.likeLoaderByQuackId(),
            likeLoaderByUserId: likeLoader_1.likeLoaderByUserId(),
            blockLoader: blockLoader_1.blockLoader(),
            blockLoaderByUserId: blockLoader_1.blockLoaderByUserId(),
            blockLoaderByBlockedByUserId: blockLoader_1.blockLoaderByBlockedByUserId(),
            followLoader: followLoader_1.followLoader(),
            followLoaderByUserId: followLoader_1.followLoaderByUserId(),
            followLoaderByFollowerId: followLoader_1.followLoaderByFollowerId(),
            payload: {},
        }),
    });
});
exports.apolloConfig = apolloConfig;
//# sourceMappingURL=apollo.config.js.map