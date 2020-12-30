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
const express_1 = __importDefault(require("express"));
const constants_1 = require("./constants");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = express_1.default();
    app.get(".well-known/acme-challenge/VeX5Ry7AHsmfkmh4zvwzM5QkzNkxG481uZtxAXvMxV4", (_, res) => res.send("VeX5Ry7AHsmfkmh4zvwzM5QkzNkxG481uZtxAXvMxV4.8OagZ1r5d5ryybc2ain9wkfU-s-9M8T4zELxEtMscQI"));
    app.listen(constants_1.PORT, () => {
        console.log(`The server has started on port ${constants_1.PORT}.`);
        if (!constants_1.__prod__) {
            const url = `http://localhost:${constants_1.PORT}/graphql`;
            console.log(`You can debug the graphql server at ${url}`);
        }
    });
});
main().catch((error) => console.log(error));
//# sourceMappingURL=index.js.map