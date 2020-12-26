"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const constants_1 = require("../constants");
const Cache_1 = require("../entities/Cache");
const Follow_1 = require("../entities/Follow");
const Like_1 = require("../entities/Like");
const Requack_1 = require("../entities/Requack");
const Quack_1 = require("../entities/Quack");
const User_1 = require("../entities/User");
exports.typeormConfig = {
    url: constants_1.DATABASE_URL,
    type: "postgres",
    database: constants_1.DATABASE_NAME,
    username: constants_1.DATABASE_USER,
    password: constants_1.DATABASE_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [Quack_1.Quack, User_1.User, Follow_1.Follow, Requack_1.Requack, Like_1.Like, Cache_1.Cache],
};
//# sourceMappingURL=typeorm.config.js.map