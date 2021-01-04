import DataLoader from "dataloader";
import { In } from "typeorm";
import { Follow } from "../entities/Follow";

export const followLoaderByUserId = () =>
  new DataLoader<string, Follow[]>(async (userIds) => {
    const follows = await Follow.find({
      where: {
        userId: In(userIds as string[]),
      },
    });
    return userIds.map((userId) =>
      follows.filter((follow) => follow.userId === userId)
    );
  });

export const followLoaderByFollowerId = () =>
  new DataLoader<string, Follow[]>(async (followerIds) => {
    const follows = await Follow.find({
      where: {
        followerId: In(followerIds as string[]),
      },
    });
    return followerIds.map((followerId) =>
      follows.filter((follow) => follow.followerId === followerId)
    );
  });

export const followLoader = () =>
  new DataLoader<{ userId: string; followerId: string }, Follow[]>(
    async (keys) => {
      const follows = await Follow.find({
        where: {
          userId: In(keys.map((key) => key.userId)),
          followerId: In(keys.map((key) => key.followerId)),
        },
      });
      return keys.map((key) =>
        follows.filter(
          (follow) =>
            follow.userId === key.userId && follow.followerId === key.followerId
        )
      );
    }
  );
