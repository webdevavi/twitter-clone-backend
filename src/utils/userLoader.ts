import DataLoader from "dataloader";
import { In } from "typeorm";
import { User } from "../entities/User";

export const userLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });

export const userLoaderByUsername = () =>
  new DataLoader<string, User>(async (usernames) => {
    const users = await User.find({
      where: {
        rawUsername: In(usernames.map((username) => username.toLowerCase())),
      },
    });
    const usernameToUser: Record<string, User> = {};
    users.forEach((u) => {
      usernameToUser[u.username.toLowerCase()] = u;
    });

    return usernames.map((username) => usernameToUser[username]);
  });
