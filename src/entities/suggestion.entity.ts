import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";

export enum SuggestionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  IMPLEMENTED = "IMPLEMENTED",
}

@Entity()
export class SuggestionEntity extends BaseEntity {
  @Column()
  channelId!: string;

  @Column({ nullable: true })
  messageId?: string;

  @Column({ nullable: true })
  threadId?: string;

  @Column()
  suggestedBy!: string;

  @Column("simple-enum", {
    enum: SuggestionStatus,
    default: SuggestionStatus.PENDING,
  })
  status!: SuggestionStatus;

  @Column()
  title!: string;

  @Column()
  message!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  responseBy?: string;

  @Column({ nullable: true })
  responseReason?: string;

  @Column("text", { array: true })
  upvotes!: string[];

  @Column("text", { array: true })
  downvotes!: string[];
}

export const getSuggestionTitle = (suggestion: SuggestionEntity) =>
  `#${suggestion.id}: ${suggestion.title}`;
