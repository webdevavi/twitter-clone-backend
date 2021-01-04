import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NewsSection } from "../types";

@Entity()
@ObjectType()
export class News extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column({ type: "date" })
  @Field(() => Date)
  publishedAt: Date;

  @Column()
  @Field()
  section: NewsSection;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  abstract: string;

  @Column()
  @Field()
  author: string;

  @Column()
  @Field()
  thumbnailUrl: string;

  @Column()
  @Field()
  caption: string;

  @Column()
  @Field()
  url: string;

  @Column()
  @Field()
  shortUrl: string;
}
