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
exports.scrapeMetatags = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const get_urls_1 = __importDefault(require("get-urls"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getLinks_1 = require("./getLinks");
const scrapeMetatags = (text, id) => {
    const urls = Array.from(get_urls_1.default(text));
    const exactUrls = Array.from(getLinks_1.getLinks(text));
    const requests = urls.map((url, index) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = yield node_fetch_1.default(url);
            const html = yield res.text();
            const $ = cheerio_1.default.load(html);
            const getMetatag = (name) => $(`meta[name="twitter:${name}"]`).attr("content") ||
                $(`meta[property="twitter:${name}"]`).attr("content") ||
                $(`meta[property="og:${name}"]`).attr("content") ||
                $(`meta[name=${name}]`).attr("content") ||
                $(name).first().text();
            const image = getMetatag("image");
            const imageURL = image
                ? image.startsWith("/")
                    ? url + image
                    : image
                : undefined;
            const favicon = $('link[rel="shortcut-icon"]').attr("href");
            const faviconURL = favicon
                ? favicon.startsWith("/")
                    ? url + favicon
                    : favicon
                : undefined;
            return {
                id: parseInt(`${id}${index}`),
                url,
                exactUrl: exactUrls[index],
                title: getMetatag("title"),
                favicon: faviconURL,
                description: getMetatag("description"),
                image: imageURL,
                author: getMetatag("author"),
            };
        }
        catch (_) {
            return { id: parseInt(`${id}${index}`), url, exactUrl: exactUrls[index] };
        }
    }));
    return Promise.all(requests);
};
exports.scrapeMetatags = scrapeMetatags;
//# sourceMappingURL=scrapeMetatags.js.map