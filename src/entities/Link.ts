import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Link {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  favicon?: string | null;

  @Field(() => String, { nullable: true })
  image?: string | null;

  @Field(() => String, { nullable: true })
  author?: string | null;
}
