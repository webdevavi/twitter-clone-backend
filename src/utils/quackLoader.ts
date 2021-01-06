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
      inReplyToQuackIdToQuack[u.id] = u;
    });

    return inReplyToQuackIds.map(
      (inReplyToQuackId) => inReplyToQuackIdToQuack[inReplyToQuackId]
    );
  });
