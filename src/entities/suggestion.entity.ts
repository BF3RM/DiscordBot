import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { SuggestionVoteEntity } from "./suggestion-vote.entity";

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
  description!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  responseBy?: string;

  @Column({ nullable: true })
  responseReason?: string;

  @Column({ nullable: true })
  implementedBy?: string;

  @OneToMany(() => SuggestionVoteEntity, (vote) => vote.suggestion, {
    cascade: true,
  })
  votes!: SuggestionVoteEntity[];
}

export const getSuggestionTitle = (suggestion: SuggestionEntity) =>
  `#${suggestion.id}: ${suggestion.title}`;
