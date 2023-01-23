import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { SongChannelEntity } from './SongChannelEntity';

@Entity({ name: 'guilds' })
export class GuildEntity {

  @PrimaryColumn({ name: 'guild_id' })
  public id!: string;

  @Column({ default: 'pt-BR' })
  public language!: string;
}