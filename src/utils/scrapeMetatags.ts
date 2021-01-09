import cheerio from "cheerio";
import getUrls from "get-urls";
import fetch from "node-fetch";
import { Link } from "../entities/Link";
import { getLinks } from "./getLinks";

export const scrapeMetatags = (
  text: string,
  id: number
): Promise<Link[] | null> => {
  const urls = Array.from(getUrls(text));
  const exactUrls = Array.from(getLinks(text));

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
      } as Link;
    } catch (_) {
      return { id: parseInt(`${id}${index}`), url, exactUrl: exactUrls[index] };
    }
  });

  return Promise.all(requests);
};
