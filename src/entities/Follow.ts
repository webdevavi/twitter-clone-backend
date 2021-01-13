import { ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
@ObjectType()
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToMany(() => User, (user) => user._followers)
  user: User;

  @Column()
  followerId: number;

  @OneToMany(() => User, (user) => user._followings)
  follower: User;
}
