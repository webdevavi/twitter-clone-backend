"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const constants_1 = require("../constants");
const Block_1 = require("../entities/Block");
const Follow_1 = require("../entities/Follow");
const Like_1 = require("../entities/Like");
const Quack_1 = require("../entities/Quack");
const Requack_1 = require("../entities/Requack");
const User_1 = require("../entities/User");
const typeormConfig = () => {
    const commonProps = {
        type: "postgres",
        logging: true,
        synchronize: true,
        entities: [Quack_1.Quack, User_1.User, Follow_1.Follow, Requack_1.Requack, Like_1.Like, Block_1.Block],
    };
    if (constants_1.__prod__) {
        return Object.assign({ url: constants_1.DATABASE_URL }, commonProps);
    }
    else {
        return Object.assign({ database: constants_1.DATABASE_NAME, user: constants_1.DATABASE_USER, password: constants_1.DATABASE_PASSWORD }, commonProps);
    }
};
exports.typeormConfig = typeormConfig;
//# sourceMappingURL=typeorm.config.js.map