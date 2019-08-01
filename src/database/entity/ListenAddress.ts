import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity()
export class ListenAddress {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 60,
    unique: true
  })
  address: string;

  @Column({
    default: 0
  })
  transaction_count: number;

  @Column({
    nullable: true,
    default: null
  })
  start_block: number;

  @Column({
    nullable: true,
    default: null
  })
  last_block: number;

  @CreateDateColumn()
  create_time: string;

  @UpdateDateColumn()
  update_time: string;

}