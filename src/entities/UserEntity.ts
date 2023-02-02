import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {

  @PrimaryColumn()
  public id!: string;

  @Column()
  public language!: string;
}