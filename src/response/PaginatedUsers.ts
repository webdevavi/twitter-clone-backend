import { Field, ObjectType } from "type-graphql";
import { User } from "../entities/User";

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User], { nullable: true })
  users: User[] | null;

  @Field(() => Boolean)
  hasMore: boolean;
}
