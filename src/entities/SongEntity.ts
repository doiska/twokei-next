import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity({ name: 'played_songs' })
export class SongEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @JoinColumn()
  @OneToOne(() => UserEntity)
  public user!: string;

  @Column()
  public guild!: string;

  @Column()
  public song!: string;

  @Column()
  public count!: number;
}