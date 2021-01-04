"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.NewsResolver = void 0;
const axios_1 = __importDefault(require("axios"));
const type_graphql_1 = require("type-graphql");
const constants_1 = require("../constants");
const News_1 = require("../entities/News");
let NewsResolver = class NewsResolver {
    news(section) {
        return __awaiter(this, void 0, void 0, function* () {
            if (section !== "business" &&
                section !== "health" &&
                section !== "movies" &&
                section !== "science" &&
                section !== "sports" &&
                section !== "world") {
                throw Error(`${section} is not a valid section type.`);
            }
            const url = constants_1.NYTIMES_ENDPOINT + "/" + section + ".json?api-key=" + constants_1.NYTIMES_API_KEY;
            try {
                const response = yield axios_1.default.get(url);
                if (response.status === 200) {
                    yield News_1.News.delete({ section });
                    const newsList = yield Promise.all(response.data.results.map((result) => __awaiter(this, void 0, void 0, function* () {
                        const thumbnail = result.multimedia.find((media) => media.format === "Standard Thumbnail");
                        const news = News_1.News.create({
                            publishedAt: new Date(result.published_date),
                            section,
                            title: result.title,
                            abstract: result.abstract,
                            author: result.byline,
                            thumbnailUrl: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.url,
                            caption: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.caption,
                            url: result.url,
                            shortUrl: result.short_url,
                        });
                        yield news.save();
                        return news;
                    })));
                    return newsList;
                }
                else
                    return yield News_1.News.find({ section });
            }
            catch (_) {
                return yield News_1.News.find({ section });
            }
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [News_1.News], { nullable: true }),
    __param(0, type_graphql_1.Arg("section")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsResolver.prototype, "news", null);
NewsResolver = __decorate([
    type_graphql_1.Resolver(News_1.News)
], NewsResolver);
exports.NewsResolver = NewsResolver;
//# sourceMappingURL=news.js.map