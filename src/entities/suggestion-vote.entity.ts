import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

import { BaseEntity } from "./base.entity";
import { SuggestionEntity } from "./suggestion.entity";

export enum SuggestionVoteType {
  UPVOTE = "UPVOTE",
  DOWNVOTE = "DOWNVOTE",
}

@Entity()
export class SuggestionVoteEntity extends BaseEntity {
  @Column({ nullable: true })
  userId!: string;

  @Column("simple-enum", {
    enum: SuggestionVoteType,
    nullable: false,
  })
  type!: SuggestionVoteType;

  @JoinColumn()
  @ManyToOne(() => SuggestionEntity, (suggestion) => suggestion.votes)
  suggestion!: SuggestionEntity;

  @Column({ nullable: false })
  suggestionId!: number;
}
