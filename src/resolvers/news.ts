import axios from "axios";
import { Arg, Query, Resolver, Int } from "type-graphql";
import { NYTIMES_API_KEY, NYTIMES_ENDPOINT } from "../constants";
import { News } from "../entities/News";
import { NewsSection } from "../types";

@Resolver(News)
export class NewsResolver {
  @Query(() => [News], { nullable: true })
  async news(
    @Arg("section")
    section: NewsSection,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 40 })
    limit: number | null
  ): Promise<News[] | null> {
    if (
      section !== "business" &&
      section !== "health" &&
      section !== "movies" &&
      section !== "science" &&
      section !== "sports" &&
      section !== "world"
    ) {
      throw Error(`${section} is not a valid section type.`);
    }
    const url = `${NYTIMES_ENDPOINT}/${section}.json?api-key=${NYTIMES_API_KEY}`;

    try {
      const response = await axios.get(url);

      if (response.status === 200) {
        await News.delete({ section });

        const newsList: News[] = await Promise.all(
          (response.data.results as Array<Record<string, any>>).map(
            async (result) => {
              const thumbnail = (result.multimedia as {
                format: string;
                url: string;
                caption: string;
              }[])?.find((media) => media.format === "Standard Thumbnail");

              const cover = (result.multimedia as {
                format: string;
                url: string;
                caption: string;
              }[])?.find((media) => media.format === "mediumThreeByTwo210");

              const news = News.create({
                publishedAt: new Date(result.published_date),
                section,
                title: result.title,
                abstract: result.abstract,
                author: result.byline,
                thumbnailUrl: thumbnail?.url,
                cover: cover?.url,
                caption: thumbnail?.caption,
                url: result.url,
                shortUrl: result.short_url,
              });

              await news.save();
              return news;
            }
          )
        );
        return newsList.slice(0, limit ?? 40);
      } else return await News.find({ section });
    } catch (_) {
      return await News.find({ section });
    }
  }
}
