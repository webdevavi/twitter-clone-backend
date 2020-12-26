import { InputType, Field } from "type-graphql";

@InputType()
export class QuackInput {
  @Field()
  text: string;

  @Field(() => String, { nullable: true })
  inReplyToQuackId?: string;
}
