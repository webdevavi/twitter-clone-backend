import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Link } from "./Link";
import { User } from "./User";

@Entity()
@ObjectType()
export class Quack extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Column({ type: "boolean", default: true })
  @Field()
  isVisible: boolean = true;

  @Column()
  @Field()
  text: string;

  @Field(() => String, { nullable: true })
  truncatedText: string;

  @Field(() => [Link], { nullable: true })
  links: Link[] | null;

  @Field(() => [User], { nullable: true })
  mentions: User[] | null;

  @Field(() => [String], { nullable: true })
  hashtags: string[] | null;

  @Column()
  @Field()
  quackedByUserId: number;

  @ManyToOne(() => User, (user) => user.quacks)
  @Field(() => User)
  quackedByUser: User;

  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  inReplyToQuackId: number;

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

  @Field(() => Int, { defaultValue: 0 })
  requacks: number = 0;

  @Field(() => Int, { defaultValue: 0 })
  likes: number = 0;

  @Field()
  requackStatus: Boolean;

  @Field()
  likeStatus: Boolean;
}
