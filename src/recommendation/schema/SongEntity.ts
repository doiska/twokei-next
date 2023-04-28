import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'played_songs' })
export class SongEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: 'user_id' })
  public user!: string;

  @Column({ name: 'guild_id' })
  public guild!: string;

  @Column()
  public song!: string;

  @Column()
  public count!: number;
}