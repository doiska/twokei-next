import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users_playlists' })
export class PlaylistEntity {

  @PrimaryGeneratedColumn()
  public id!: number;

  //id from UserEntity
  @Column()
  public user!: string;

  @Column()
  public name!: string;

  @Column({ type: 'text', default: '' })
  public url!: string;
}