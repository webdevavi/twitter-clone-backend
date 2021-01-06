import { Field, ObjectType } from "type-graphql";
import { Quack } from "../entities/Quack";

@ObjectType()
export class PaginatedQuacks {
  @Field(() => [Quack], { nullable: true })
  quacks: Quack[] | null;

  @Field(() => Boolean)
  hasMore: boolean;
}
