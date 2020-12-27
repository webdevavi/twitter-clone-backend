import DataLoader from "dataloader";
import { In } from "typeorm";
import { Like } from "../entities/Like";

export const likeLoaderByQuackId = () =>
  new DataLoader<string, Like[]>(async (quackids) => {
    const likes = await Like.find({
      where: {
        quackId: In(quackids as string[]),
      },
    });
    return quackids.map((quackId) =>
      likes.filter((like) => like.quackId === quackId)
    );
  });

export const likeLoaderByUserId = () =>
  new DataLoader<string, Like[]>(async (userIds) => {
    const likes = await Like.find({
      where: {
        userId: In(userIds as string[]),
      },
    });
    return userIds.map((userId) =>
      likes.filter((like) => like.userId === userId)
    );
  });

export const likeLoader = () =>
  new DataLoader<{ quackId: string; userId: string }, Like[]>(async (keys) => {
    const likes = await Like.find({
      where: {
        quackId: In(keys.map((key) => key.quackId)),
        userId: In(keys.map((key) => key.userId)),
      },
    });
    return keys.map((key) =>
      likes.filter(
        (like) => like.quackId === key.quackId && like.userId === key.userId
      )
    );
  });
