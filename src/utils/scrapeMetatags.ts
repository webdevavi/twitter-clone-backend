import cheerio from "cheerio";
import getUrls from "get-urls";
import fetch from "node-fetch";
import { Link } from "../entities/Link";

export const scrapeMetatags = (text: string): Promise<Link[] | null> => {
  const urls = Array.from(getUrls(text));

  const requests = urls.map(async (url, index) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      const getMetatag = (name: string) =>
        $(`meta[name="twitter:${name}"]`).attr("content") ||
        $(`meta[property="twitter:${name}"]`).attr("content") ||
        $(`meta[property="og:${name}"]`).attr("content") ||
        $(`meta[name=${name}]`).attr("content") ||
        $(name).first().text();

      return {
        id: index,
        url,
        title: getMetatag("title"),
        favicon: $('link[rel="shortcut-icon"]').attr("href"),
        description: getMetatag("description"),
        image: getMetatag("image"),
        author: getMetatag("autho"),
      } as Link;
    } catch (_) {
      return { id: index, url };
    }
  });

  return Promise.all(requests);
};
