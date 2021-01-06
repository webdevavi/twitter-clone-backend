import { validUrl } from "./regexp";

export const getLinks = (text: string): string[] => {
  const links = new Set<string>();
  const matches = [...text.matchAll(validUrl)].map((match) => match[0]);
  matches.map((match) => links.add(match));
  return [...links];
};
