import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Block extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToMany(() => User, (user) => user._blockedBys)
  user: User;

  @Column()
  blockedByUserId: number;

  @OneToMany(() => User, (user) => user._blocks)
  blockedByUser: User;
}
