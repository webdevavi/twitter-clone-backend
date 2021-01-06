import { hashtags as hashtagRegex } from "./regexp";

export const getHashtags = (text: string, prefix: boolean = true): string[] => {
  const hashtags = new Set<string>();
  const matches = [...text.matchAll(hashtagRegex)].map((match) => match[0]);
  matches.map((match) => {
    if (prefix) {
      return hashtags.add(match);
    }
    return hashtags.add(match.replace(/#/g, ""));
  });
  return [...hashtags];
};
