import { mentions as mentionRegex } from "./regexp";

export const getMentions = (text: string, prefix: boolean = true): string[] => {
  const mentions = new Set<string>();
  const matches = [...text.matchAll(mentionRegex)].map((match) => match[0]);
  matches.map((match) => {
    if (prefix) {
      return mentions.add(match);
    }
    return mentions.add(match.replace(/@/g, ""));
  });
  return [...mentions];
};
