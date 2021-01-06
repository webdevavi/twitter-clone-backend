import { Field, ObjectType } from "type-graphql";
import { PaginatedQuacks } from "./PaginatedQuacks";
import { PaginatedUsers } from "./PaginatedUsers";

@ObjectType()
export class SearchResponse {
  @Field(() => PaginatedUsers, { nullable: true })
  paginatedUsers?: PaginatedUsers | null;

  @Field(() => PaginatedQuacks, { nullable: true })
  paginatedQuacks?: PaginatedQuacks | null;
}
