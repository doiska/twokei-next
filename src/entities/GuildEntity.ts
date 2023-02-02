import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'guilds' })
export class GuildEntity {

  @PrimaryColumn({ name: 'guild_id' })
  public id!: string;

  @Column({ default: 'pt_BR' })
  public locale!: string;
}