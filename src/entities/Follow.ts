import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
@ObjectType()
export class Follow extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  userId: string;

  @ManyToOne(() => User, (user) => user.followers)
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  followerId: string;

  @ManyToOne(() => User, (user) => user.followings)
  @Field(() => User)
  follower: User;
}
