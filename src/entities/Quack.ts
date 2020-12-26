import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Requack } from "./Requack";
import { User } from "./User";
import { Like } from "./Like";

@Entity()
@ObjectType()
export class Quack extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  text: string;

  @Field(() => String, { nullable: true })
  truncatedText: string;

  @Field(() => [String], { nullable: true })
  urls: string[];

  @Column()
  @Field()
  quackedByUserId: string;

  @ManyToOne(() => User, (user) => user.quacks)
  @Field(() => User)
  quackedByUser: User;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  inReplyToQuackId: string;

  @ManyToOne(() => Quack, (quack) => quack.replies, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @Field(() => Quack, { nullable: true })
  inReplyToQuack: Quack;

  @OneToMany(() => Quack, (quack) => quack.inReplyToQuack, {
    nullable: true,
  })
  @Field(() => [Quack], { nullable: true })
  replies: Quack[];

  @OneToMany(() => Requack, (requacks) => requacks.quack, {
    nullable: true,
  })
  @Field(() => [Requack], { nullable: true })
  requacks: Requack[];

  @OneToMany(() => Like, (like) => like.quack, {
    nullable: true,
  })
  @Field(() => [Like], { nullable: true })
  likes: Like[];
}
