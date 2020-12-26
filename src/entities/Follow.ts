import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Follow extends BaseEntity {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column()
  userId: string;

  @Column()
  followerId: string;
}
