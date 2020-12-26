import { ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
@ObjectType()
export class Cache extends BaseEntity {
  @PrimaryColumn({ type: "text" })
  key: string;

  @Column()
  value: string;
}
