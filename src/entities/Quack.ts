import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Requack } from "./Requack";
import { User } from "./User";
import { Like } from "./Like";

@Entity()
@ObjectType()
export class Quack extends BaseEntity {
  @PrimaryColumn({ type: "text" })
  @Field()
  id: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Column()
  @Field()
  text: string;

  @Field(() => [String])
  urls: string[];

  @Field(() => [String])
  images: string[];

  @Column()
  @Field()
  quackedByUserId: string;

  @ManyToOne(() => User, (user) => user.quacks, {
    onDelete: "CASCADE",
  })
  quackedByUser: User;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  inReplyToQuackId: string;

  @ManyToOne(() => Quack, (quack) => quack.replies, { nullable: true })
  inReplyToQuack: Quack;

  @OneToMany(() => Quack, (quack) => quack.inReplyToQuack, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => [Quack], { nullable: true })
  replies: Quack[];

  @OneToMany(() => Requack, (requacks) => requacks.quack, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => [Requack])
  requacks: Requack[];

  @OneToMany(() => Like, (like) => like.quack, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => [Like])
  likes: Like[];
}
