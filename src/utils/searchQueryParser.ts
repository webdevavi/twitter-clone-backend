import {
  notTheseWords,
  hashtags,
  mentions,
  fromTheseUsernames,
  toTheseUsernames,
  filterOut,
  filterIn,
  minReplies,
  minLikes,
  minRequacks,
  untilDate,
  sinceDate,
  exactPhrase,
  or,
} from "./regexp";

interface Query {
  words?: {
    like?: string;
    exactPhrase?: string;
    or?: string[];
    notTheseWords?: string[];
    hashtags?: string[];
  };
  accounts?: {
    fromTheseUsernames?: string[];
    toTheseUsernames?: string[];
    mentions?: string[];
  };
  filters?: {
    filterIn?: string[];
    filterOut?: string[];
  };
  engagement?: {
    minReplies?: number;
    minLikes?: number;
    minRequacks?: number;
  };
  dates?: {
    sinceDate?: Date;
    untilDate?: Date;
  };
}

export class Parser {
  constructor(public string: String) {}

  get parsedSearchQuery(): Query {
    return {
      filters: {
        filterOut: this.filterQuery<string>(filterOut, (o) => {
          return o.replace(/(\(|\)|-filter:)/gi, "")?.trim();
        }),
        filterIn: this.filterQuery<string>(filterIn, (o) => {
          return o.replace(/(\(|\)|filter:)/gi, "")?.trim();
        }),
      },

      accounts: {
        fromTheseUsernames: this.filterQuery<string>(fromTheseUsernames, (o) =>
          o.replace(/(\(|\)|from:)/gi, "")?.trim()
        ),
        toTheseUsernames: this.filterQuery<string>(toTheseUsernames, (o) =>
          o.replace(/(\(|\)|to:)/gi, "")?.trim()
        ),
        mentions: this.filterQuery<string>(mentions, (o) =>
          o.replace(/(\(|\)|@)/gi, "")?.trim()
        ),
      },
      engagement: {
        minReplies: parseInt(
          this.filterQuery<string>(minReplies, (o) =>
            o.replace(/(\(|\)|min_replies:)/gi, "")
          )[0]?.trim()
        ),
        minLikes: parseInt(
          this.filterQuery<string>(minLikes, (o) =>
            o.replace(/(\(|\)|min_likes:)/gi, "")
          )[0]?.trim()
        ),
        minRequacks: parseInt(
          this.filterQuery<string>(minRequacks, (o) =>
            o.replace(/(\(|\)|min_requacks:)/gi, "")
          )[0]?.trim()
        ),
      },
      dates: {
        sinceDate: new Date(
          this.filterQuery<string>(sinceDate, (o) =>
            o.replace(/(\(|\)|since:)/gi, "")
          )[0]?.trim()
        ),
        untilDate: new Date(
          this.filterQuery<string>(untilDate, (o) =>
            o.replace(/(\(|\)|until:)/gi, "")
          )[0]?.trim()
        ),
      },
      words: {
        exactPhrase: this.filterQuery<string>(exactPhrase, (o) =>
          o.replace(/(\(|\)|")/g, "")
        )[0]?.trim(),
        or: this.filterQuery<string[]>(or, (o) => {
          return o
            .replace(/(\(|\)|or)/gi, "")
            .replace(/\s+/g, " ")
            .split(" ")
            .map((i) => i.trim());
        })
          .flat(999)
          .filter((o) => o.length > 0),
        notTheseWords: this.filterQuery<string>(notTheseWords, (o) =>
          o.replace(/(\(|\)|-)/gi, "")?.trim()
        ),
        hashtags: this.filterQuery<string>(hashtags, (o) =>
          o.replace(/(\(|\)|#)/gi, "")?.trim()
        ),
        like: this.string.replace(/\s+/g, " ").trim().toLowerCase(),
      },
    };
  }

  private filterQuery<T>(regex: RegExp, next: (o: string) => T) {
    const matches = [...this.string.matchAll(regex)].map((match) => match[0]);
    return matches.map((o) => {
      this.string = this.string.replace(
        RegExp(this.escapeBrackets(o), "g"),
        ""
      );
      return next(o);
    });
  }

  private escapeBrackets(o: string) {
    return o.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }
}
