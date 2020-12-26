import { InputType, Field } from "type-graphql";

@InputType()
export class UserInput {
  @Field()
  displayName: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
