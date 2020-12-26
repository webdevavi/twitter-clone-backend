"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const constants_1 = require("../constants");
exports.typeormConfig = {
    url: constants_1.DATABASE_URL,
    type: "postgres",
    database: constants_1.DATABASE_NAME,
    username: constants_1.DATABASE_USER,
    password: constants_1.DATABASE_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [],
};
//# sourceMappingURL=typeorm.config.js.map