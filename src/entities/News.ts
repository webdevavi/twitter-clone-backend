import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NewsSection } from "../types";

@Entity()
@ObjectType()
export class News extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
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

  @Column({ nullable: true })
  @Field({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  caption: string;

  @Column()
  @Field()
  url: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  shortUrl: string;
}
