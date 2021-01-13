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
    const userIdToFollow: Record<number, Follow[]> = {};
    follows.forEach((f) => {
      userIdToFollow[f.userId] = userIdToFollow[f.userId]
        ? [...userIdToFollow[f.userId], f]
        : [f];
    });

    return userIds.map((userId) => userIdToFollow[userId]);
  });

export const followLoaderByFollowerId = () =>
  new DataLoader<number, Follow[]>(async (followerIds) => {
    const follows = await Follow.find({
      where: {
        followerId: In(followerIds as number[]),
      },
    });

    const followerIdToFollow: Record<number, Follow[]> = {};
    follows.forEach((f) => {
      followerIdToFollow[f.followerId] = followerIdToFollow[f.followerId]
        ? [...followerIdToFollow[f.followerId], f]
        : [f];
    });

    return followerIds.map((followerId) => followerIdToFollow[followerId]);
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
