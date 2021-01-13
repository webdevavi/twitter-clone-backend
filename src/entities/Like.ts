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
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quackId: number;

  @OneToMany(() => Quack, (quack) => quack._likes)
  quack: Quack;

  @Column()
  userId: number;

  @OneToMany(() => User, (user) => user._likes)
  user: User;
}
