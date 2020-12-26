import { Field, ObjectType } from "type-graphql";
import { FieldError } from "../utils/FieldError";
import { User } from "../entities/User";

@ObjectType()
export class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User | null;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[] | null;
}
