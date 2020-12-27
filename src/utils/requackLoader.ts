import DataLoader from "dataloader";
import { In } from "typeorm";
import { Requack } from "../entities/Requack";

export const requackLoaderByQuackId = () =>
  new DataLoader<string, Requack[]>(async (quackids) => {
    const requacks = await Requack.find({
      where: {
        quackId: In(quackids as string[]),
      },
    });
    return quackids.map((quackId) =>
      requacks.filter((requack) => requack.quackId === quackId)
    );
  });

export const requackLoaderByUserId = () =>
  new DataLoader<string, Requack[]>(async (userIds) => {
    const requacks = await Requack.find({
      where: {
        userId: In(userIds as string[]),
      },
    });
    return userIds.map((userId) =>
      requacks.filter((requack) => requack.userId === userId)
    );
  });
