import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { SongChannelEntity } from './SongChannelEntity';

@Entity({ name: 'guilds' })
export class GuildEntity {

  @PrimaryGeneratedColumn()
  public id!: string;

  @PrimaryColumn({ name: 'guild_id' })
  public guildId!: string;

  @Column()
  public language!: string;

  @Column()
  public prefix!: string;
}