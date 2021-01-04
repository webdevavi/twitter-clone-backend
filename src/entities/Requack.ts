import { Field, Int, ObjectType } from "type-graphql";
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
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  quackId: number;

  @ManyToOne(() => Quack, (quack) => quack.requacks)
  @Field(() => Quack)
  quack: Quack;

  @Column()
  @Field()
  userId: number;

  @ManyToOne(() => User, (user) => user.requacks)
  @Field(() => User)
  user: User;
}
