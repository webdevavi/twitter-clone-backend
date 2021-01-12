import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
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

  @Field(() => Quack)
  quack: Quack;

  @Column()
  @Field()
  userId: number;

  @Field(() => User)
  user: User;
}
