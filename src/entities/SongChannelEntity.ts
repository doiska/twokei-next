import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { GuildEntity } from './GuildEntity';

@Entity({ name: 'song_channels' })
export class SongChannelEntity {

  @PrimaryGeneratedColumn()
  public id!: string;

  @JoinColumn()
  @OneToOne(() => GuildEntity)
  public guild!: string;

  @Column()
  public channel!: string;

  @Column()
  public message!: string;
}