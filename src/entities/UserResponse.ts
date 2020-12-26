import { ObjectType, Field } from "type-graphql";
import { FieldError } from "./FieldError";
import { User } from "./User";

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user: User | null;

  @Field(() => [FieldError], { nullable: true })
  errors: FieldError[] | null;
}
