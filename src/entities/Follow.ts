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
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  @Field()
  userId: number;

  @ManyToOne(() => User, (user) => user.followers)
  @Field(() => User)
  user: User;

  @Column()
  @Field()
  followerId: number;

  @ManyToOne(() => User, (user) => user.followings)
  @Field(() => User)
  follower: User;
}
