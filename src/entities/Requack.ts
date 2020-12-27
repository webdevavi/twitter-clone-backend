import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Quack } from "./Quack";
import { User } from "./User";

@Entity()
@ObjectType()
export class Requack extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  quackId: string;

  @ManyToOne(() => Quack, (quack) => quack.requacks)
  @Field(() => Quack)
  quack: Quack;

  @Column()
  @Field()
  userId: string;

  @ManyToOne(() => User, (user) => user.requacks)
  @Field(() => User)
  user: User;
}
