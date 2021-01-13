import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quack } from "./Quack";
import { User } from "./User";

@Entity()
export class Requack extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quackId: number;

  @OneToMany(() => Quack, (quack) => quack._requacks)
  quack: Quack;

  @Column()
  userId: number;

  @OneToMany(() => User, (user) => user._requacks)
  user: User;
}
