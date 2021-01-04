import { InputType, Field, Int } from "type-graphql";

@InputType()
export class QuackInput {
  @Field()
  text: string;

  @Field(() => Int, { nullable: true })
  inReplyToQuackId?: number;
}
