import DataLoader from "dataloader";
import { Quack } from "../entities/Quack";

export const quackLoader = () =>
  new DataLoader<number, Quack>(async (quackIds) => {
    const quacks = await Quack.findByIds(quackIds as number[]);
    const quackIdToquack: Record<number, Quack> = {};
    quacks.forEach((u) => {
      quackIdToquack[u.id] = u;
    });

    return quackIds.map((quackId) => quackIdToquack[quackId]);
  });
