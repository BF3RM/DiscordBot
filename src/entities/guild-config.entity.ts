import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity()
export class GuildConfigEntity extends BaseEntity {
  @Column({ nullable: false })
  guildId!: string;

  @Column()
  suggestionChannelId?: string;

  @Column()
  suggestionResultChannelId?: string;

  @Column()
  logsChannelId?: string;

  @Column()
  manageRoleIds!: string[]

  techSupportRoleIds!: string[];
}