import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { SongEntity } from './SongEntity';

@Entity({ name: 'users' })
export class UserEntity {

  @PrimaryColumn()
  public id!: string;

  @Column()
  public language!: string;
}