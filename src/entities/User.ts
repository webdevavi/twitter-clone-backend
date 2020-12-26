import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Like } from "./Like";
import { Quack } from "./Quack";
import { Requack } from "./Requack";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @Column()
  @Field()
  displayName: string;

  @Column()
  @Field()
  displayPicture: string;

  @Column()
  @Field()
  coverPicture: string;

  @Column({ unique: true })
  @Field()
  username: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column({ type: "boolean" })
  @Field()
  emailVerified: boolean;

  @Column()
  password: string;

  @OneToMany(() => Quack, (quack) => quack.quackedByUser, { nullable: true })
  @Field(() => [Quack], { nullable: true })
  quacks: Quack[];

  @OneToMany(() => Requack, (requack) => requack.user, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => [Requack])
  requacks: Requack[];

  @OneToMany(() => Like, (like) => like.user, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Field(() => [Like])
  likes: Like[];
}
