import DataLoader from "dataloader";
import { In } from "typeorm";
import { Block } from "../entities/Block";

export const blockLoaderByUserId = () =>
  new DataLoader<string, Block[]>(async (userIds) => {
    const blocks = await Block.find({
      where: {
        userId: In(userIds as string[]),
      },
    });
    return userIds.map((userId) =>
      blocks.filter((block) => block.userId === userId)
    );
  });

export const blockLoaderByBlockedByUserId = () =>
  new DataLoader<string, Block[]>(async (blockedByUserIds) => {
    const blocks = await Block.find({
      where: {
        blockedByUserId: In(blockedByUserIds as string[]),
      },
    });
    return blockedByUserIds.map((blockedByUserId) =>
      blocks.filter((block) => block.blockedByUserId === blockedByUserId)
    );
  });

export const blockLoader = () =>
  new DataLoader<{ userId: string; blockedByUserId: string }, Block[]>(
    async (keys) => {
      const blocks = await Block.find({
        where: {
          userId: In(keys.map((key) => key.userId)),
          blockedByUserId: In(keys.map((key) => key.blockedByUserId)),
        },
      });
      return keys.map((key) =>
        blocks.filter(
          (block) =>
            block.userId === key.userId &&
            block.blockedByUserId === key.blockedByUserId
        )
      );
    }
  );
