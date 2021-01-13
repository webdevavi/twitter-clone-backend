import DataLoader from "dataloader";
import { In } from "typeorm";
import { Quack } from "../entities/Quack";

export const quackLoader = () =>
  new DataLoader<number, Quack>(async (quackIds) => {
    const quacks = await Quack.findByIds(quackIds as number[], {
      where: {
        isVisible: true,
      },
    });
    const quackIdToquack: Record<number, Quack> = {};
    quacks.forEach((u) => {
      quackIdToquack[u.id] = u;
    });

    return quackIds.map((quackId) => quackIdToquack[quackId]);
  });

export const quackLoaderByInReplyToQuackId = () =>
  new DataLoader<number, Quack>(async (inReplyToQuackIds) => {
    const quacks = await Quack.find({
      where: {
        inReplyToQuackId: In(inReplyToQuackIds as number[]),
        isVisible: true,
      },
    });
    const inReplyToQuackIdToQuack: Record<number, Quack> = {};
    quacks.forEach((u) => {
      inReplyToQuackIdToQuack[u.inReplyToQuackId] = u;
    });

    return inReplyToQuackIds.map(
      (inReplyToQuackId) => inReplyToQuackIdToQuack[inReplyToQuackId]
    );
  });

export const quackLoaderByUserId = () =>
  new DataLoader<number, Quack[]>(async (userIds) => {
    const quacks = await Quack.find({
      where: {
        quackedByUserId: In(userIds as number[]),
        isVisible: true,
      },
    });
    console.log(quacks.length);
    const userIdToQuack: Record<number, Quack[]> = {};
    quacks.forEach((u) => {
      userIdToQuack[u.quackedByUserId] = userIdToQuack[u.quackedByUserId]
        ? [...userIdToQuack[u.quackedByUserId], u]
        : [u];
    });

    return userIds.map((userId) => userIdToQuack[userId]);
  });
