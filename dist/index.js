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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const typeorm_1 = require("typeorm");
const config_1 = require("./config");
const constants_1 = require("./constants");
const Session_1 = require("./entities/Session");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield typeorm_1.createConnection(config_1.typeormConfig);
    const app = express_1.default();
    const sessionRepository = connection.getRepository(Session_1.Session);
    app.use(express_session_1.default(config_1.sessionConfig(sessionRepository)));
    app.use(cors_1.default(config_1.corsConfig));
    const apolloServer = new apollo_server_express_1.ApolloServer(yield config_1.apolloConfig());
    apolloServer.applyMiddleware({
        app,
        cors: true,
    });
    app.listen(constants_1.PORT, () => {
        console.log(`The server has started on port ${constants_1.PORT}.`);
        if (!constants_1.__prod__) {
            const url = `http://localhost:${constants_1.PORT}/graphql`;
            console.log(`You can debug the graphql server at ${url}`);
            require("open")(url);
        }
    });
});
main().catch((error) => console.log(error));
//# sourceMappingURL=index.js.map