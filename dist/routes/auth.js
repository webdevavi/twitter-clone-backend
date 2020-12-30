"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
exports.router = express_1.Router();
exports.router.get("/", (_, res) => {
    res.send(`
    <h1>Welcome to Quacker's REST API</h1>
    `);
});
exports.router.post("/refresh_token", (req, res) => { });
//# sourceMappingURL=auth.js.map