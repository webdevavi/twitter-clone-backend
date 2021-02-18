import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { DEFAULT_CP, DEFAULT_DP } from "../constants";
import { Block } from "./Block";
import { Follow } from "./Follow";
import { Like } from "./Like";
import { Quack } from "./Quack";
import { Requack } from "./Requack";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @Column()
  @Field()
  displayName: string;

  @Column({ default: DEFAULT_DP })
  @Field()
  displayPicture: string = DEFAULT_DP;

  @Column({ default: DEFAULT_CP })
  @Field()
  coverPicture: string = DEFAULT_CP;

  @Column({ unique: true })
  rawUsername: string;

  @Column()
  @Field()
  username: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ type: "boolean", default: false })
  @Field()
  isVerified: boolean = false;

  @Column()
  password: string;

  @Field(() => Int, { defaultValue: 0 })
  quacks: number = 0;

  @ManyToOne(() => Quack, (quack) => quack.quackedByUserId, {
    onDelete: "CASCADE",
  })
  _quacks: Quack[];

  @ManyToOne(() => Like, (like) => like.userId, {
    onDelete: "CASCADE",
  })
  _likes: Quack[];

  @ManyToOne(() => Requack, (requack) => requack.userId, {
    onDelete: "CASCADE",
  })
  _requacks: Quack[];

  @Field(() => Int, { defaultValue: 0 })
  followers: number = 0;

  @ManyToOne(() => Follow, (follow) => follow.userId, {
    onDelete: "CASCADE",
  })
  _followers: Follow[];

  @Field(() => Int, { defaultValue: 0 })
  followings: number = 0;

  @ManyToOne(() => Follow, (follow) => follow.followerId, {
    onDelete: "CASCADE",
  })
  _followings: Follow[];

  @Field(() => Boolean, { nullable: true })
  haveIBlockedThisUser: Boolean;

  @Field(() => Boolean, { nullable: true })
  amIBlockedByThisUser: Boolean;

  @Field(() => Boolean, { nullable: true })
  followStatus: Boolean;

  @Field(() => Boolean, { nullable: true })
  followBackStatus: Boolean;

  @ManyToOne(() => Block, (block) => block.userId, {
    onDelete: "CASCADE",
  })
  _blockedBys: Block[];

  @ManyToOne(() => Block, (block) => block.blockedByUserId, {
    onDelete: "CASCADE",
  })
  _blocks: Block[];
}
