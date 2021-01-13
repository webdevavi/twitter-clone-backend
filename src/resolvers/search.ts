import { Arg, Ctx, Int, Query, Resolver, UseMiddleware } from "type-graphql";
import { getConnection } from "typeorm";
import { Like } from "../entities/Like";
import { Quack } from "../entities/Quack";
import { Requack } from "../entities/Requack";
import { User } from "../entities/User";
import { partialAuth } from "../middleware/partialAuth";
import { SearchResponse } from "../response/SearchResponse";
import { MyContext } from "../types";
import { paginate } from "../utils/paginate";
import { Parser } from "../utils/searchQueryParser";

@Resolver()
export class SearchResolver {
  @Query(() => SearchResponse)
  @UseMiddleware(partialAuth)
  async search(
    @Arg("query") query: string,
    @Arg("type", () => String, { nullable: true, defaultValue: "quack" })
    type: "quack" | "user",
    @Arg("fromFollowing", () => Boolean, {
      nullable: true,
      defaultValue: false,
    })
    fromFollowing: boolean = false,
    @Arg("limit", () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg("lastIndex", () => Int, { nullable: true, defaultValue: 0 })
    lastIndex: number,
    @Ctx()
    {
      payload: { user },
      blockLoaderByUserId,
      followLoaderByFollowerId,
    }: MyContext
  ): Promise<SearchResponse> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const pq = new Parser(query).parsedSearchQuery;

    let myFollowingUserIds: number[] = [];

    if (fromFollowing) {
      if (!user) {
        throw Error(
          "Access denied! You need to be authorized to perform this action!"
        );
      }

      myFollowingUserIds = (await followLoaderByFollowerId.load(user.id)).map(
        (follow) => follow.userId
      );
    }

    if (type === "quack") {
      const q = getConnection()
        .createQueryBuilder()
        .select("q.*")
        .from(Quack, "q")
        .where(`q."isVisible" = true`);

      if (user) {
        const ids = (await blockLoaderByUserId.load(user.id)).map(
          (block) => block.blockedByUserId
        );
        if (ids.length > 0) {
          q.andWhere(`q."quackedByUserId" not in (${ids.join(", ")})`);
        }
      }

      if (fromFollowing) {
        if (myFollowingUserIds.length === 0) {
          return {
            paginatedQuacks: {
              quacks: null,
              hasMore: false,
            },
          };
        }
        q.andWhere(`q."quackedByUserId" in (${myFollowingUserIds.join(", ")})`);
      }

      if (pq.words?.like) {
        q.andWhere(`q.text ~* '.*${pq.words.like}.*'`);
      }

      if (pq.words?.notTheseWords && pq.words?.notTheseWords.length > 0) {
        q.andWhere(`q.text !~* '(${pq.words.notTheseWords.join("|")})'`);
      }

      if (pq.words?.exactPhrase) {
        q.andWhere(`q.text ~* '${pq.words.exactPhrase}'`);
      }

      if (pq.words?.hashtags && pq.words.hashtags.length > 0) {
        q.andWhere(`q.text ~* '(${pq.words.hashtags.join("|")})'`);
      }

      if (pq.words?.or && pq.words.or.length > 0) {
        q.andWhere(`q.text ~* '(${pq.words.or.join("|")})'`);
      }

      if (pq.filters?.filterOut && pq.filters.filterOut.length > 0) {
        pq.filters.filterOut.map((filter) => {
          if (filter === "replies") {
            q.andWhere(`q."inReplyToQuackId" is null`);
          }
          if (filter === "links") {
            q.andWhere("q.text !~* '\\w+\\.\\w+'");
          }
        });
      }

      if (pq.filters?.filterIn && pq.filters.filterIn.length > 0) {
        pq.filters.filterIn.map((filter) => {
          if (filter === "replies") {
            q.andWhere(`q."inReplyToQuackId" is not null`);
          }
          if (filter === "links") {
            q.andWhere("q.text ~* '\\w+\\.\\w+'");
          }
        });
      }

      if (
        pq.accounts?.fromTheseUsernames &&
        pq.accounts.fromTheseUsernames.length > 0
      ) {
        q.innerJoin(User, "fu", `fu.id = q."quackedByUserId"`);
        q.andWhere(
          `fu.username ~* '(${pq.accounts.fromTheseUsernames.join("|")})'`
        );
      }

      if (
        pq.accounts?.toTheseUsernames &&
        pq.accounts.toTheseUsernames.length > 0
      ) {
        q.andWhere(`q."inReplyToQuackId" is not null`)
          .innerJoin(Quack, "rq", `rq.id = q."inReplyToQuackId"`)
          .innerJoin(User, "tu", `tu.id = rq."quackedByUserId"`)
          .andWhere(
            `tu.username ~* '(${pq.accounts.toTheseUsernames.join("|")})'`
          );
      }

      if (pq.accounts?.mentions && pq.accounts.mentions.length > 0) {
        q.andWhere(`q.text ~* '(${pq.accounts.mentions.join("|")})'`);
      }

      if (pq.dates?.sinceDate && pq.dates.untilDate) {
        q.andWhere(
          `q."createdAt" between '${pq.dates.sinceDate}' and '${pq.dates.untilDate}'`
        );
      }

      if (pq.dates?.sinceDate && !pq.dates.untilDate) {
        q.andWhere(
          `q."createdAt" between '${pq.dates.sinceDate}' and current_date`
        );
      }

      if (!pq.dates?.sinceDate && pq.dates?.untilDate) {
        q.andWhere(
          `q."createdAt" between '1900-01-01' and '${pq.dates.untilDate}'`
        );
      }

      if (
        typeof pq.engagement?.minLikes === "number" &&
        pq.engagement.minLikes > 0
      ) {
        q.innerJoin(Like, "lk", `lk."quackId" = q.id`)
          .groupBy("q.id")
          .andHaving(`count(lk.id) >= ${pq.engagement.minLikes}`);
      }

      if (
        typeof pq.engagement?.minRequacks === "number" &&
        pq.engagement.minRequacks > 0
      ) {
        q.innerJoin(Requack, "rqk", `rqk."quackId" = q.id`)
          .groupBy("q.id")
          .andHaving(`count(rqk.id) >= ${pq.engagement.minRequacks}`);
      }

      if (
        typeof pq.engagement?.minReplies === "number" &&
        pq.engagement.minReplies > 0
      ) {
        q.innerJoin(Quack, "rpl", `rpl."inReplyToQuackId" = q.id`)
          .groupBy("q.id")
          .andHaving(`count(rpl.id) >= ${pq.engagement.minReplies}`);
      }

      const { data: quacks, hasMore } = await paginate<Quack>({
        queryBuilder: q,
        limit,
        index: "q.id",
        lastIndex,
      });

      return {
        paginatedQuacks: {
          quacks,
          hasMore,
        },
      };
    } else if (type === "user") {
      const u = getConnection()
        .createQueryBuilder()
        .select("u.*")
        .from(User, "u")
        .andWhere(`u."amIDeactivated" = false`)
        .take(realLimitPlusOne)
        .orderBy({ "u.id": "DESC" });

      if (lastIndex) {
        u.andWhere(`u.id < ${lastIndex}`);
      }

      if (user) {
        const ids = (await blockLoaderByUserId.load(user.id)).map(
          (block) => block.blockedByUserId
        );
        if (ids.length > 0) {
          u.andWhere(`q.id not in (${ids.join(", ")})`);
        }
      }

      if (fromFollowing) {
        if (myFollowingUserIds.length === 0) {
          return {
            paginatedUsers: {
              users: null,
              hasMore: false,
            },
          };
        }
        u.andWhere(`u.id in (${myFollowingUserIds.join(", ")})`);
      }

      if (pq.words?.like) {
        u.andWhere(
          `concat(u.username, ' ', u."displayName") ~* '.*${pq.words.like}.*'`
        );
      }

      if (pq.words?.notTheseWords && pq.words?.notTheseWords.length > 0) {
        u.andWhere(
          `concat(u.username, ' ', u."displayName") !~* '(${pq.words.notTheseWords.join(
            "|"
          )})'`
        );
      }

      if (pq.words?.exactPhrase) {
        u.andWhere(
          `concat(u.username, ' ', u."displayName") ~* '${pq.words.exactPhrase}'`
        );
      }

      if (pq.words?.or && pq.words.or.length > 0) {
        u.andWhere(
          `concat(u.username, ' ', u."displayName") ~* '(${pq.words.or.join(
            "|"
          )})'`
        );
      }

      const { data: users, hasMore } = await paginate<User>({
        queryBuilder: u,
        limit,
        index: "u.id",
        lastIndex,
      });

      return {
        paginatedUsers: {
          users,
          hasMore,
        },
      };
    }

    return {};
  }
}
