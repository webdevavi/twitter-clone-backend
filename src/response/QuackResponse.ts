import { Field, ObjectType } from "type-graphql";
import { FieldError } from "../utils/FieldError";
import { Quack } from "../entities/Quack";

@ObjectType()
export class QuackResponse {
  @Field(() => Quack, { nullable: true })
  quack?: Quack | null;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[] | null;
}
