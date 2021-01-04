import DataLoader from "dataloader";
import { In } from "typeorm";
import { Follow } from "../entities/Follow";

export const followLoaderByUserId = () =>
  new DataLoader<number, Follow[]>(async (userIds) => {
    const follows = await Follow.find({
      where: {
        userId: In(userIds as number[]),
      },
    });
    return userIds.map((userId) =>
      follows.filter((follow) => follow.userId === userId)
    );
  });

export const followLoaderByFollowerId = () =>
  new DataLoader<number, Follow[]>(async (followerIds) => {
    const follows = await Follow.find({
      where: {
        followerId: In(followerIds as number[]),
      },
    });
    return followerIds.map((followerId) =>
      follows.filter((follow) => follow.followerId === followerId)
    );
  });

export const followLoader = () =>
  new DataLoader<{ userId: number; followerId: number }, Follow[]>(
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
