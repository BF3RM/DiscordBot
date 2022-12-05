import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity()
export class SuggestionEntity extends BaseEntity {
  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column()
  imageUrl?: string;

  @Column("text", { array: true })
  upvotes!: string[];

  @Column("text", { array: true })
  downvotes!: string[];
}
