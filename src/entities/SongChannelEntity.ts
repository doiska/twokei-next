import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { GuildEntity } from './GuildEntity';

@Entity({ name: 'song_channels' })
export class SongChannelEntity {

  @PrimaryColumn()
  @OneToOne(() => GuildEntity, guild => guild.id)
  public guild!: string;

  @Column()
  public channel!: string;

  @Column()
  public message!: string;
}