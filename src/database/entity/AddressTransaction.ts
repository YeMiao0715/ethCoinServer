import { Entity, PrimaryColumn, Column, CreateDateColumn, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AddressTransaction {

  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  address_id: number;

  @Index()
  @Column()
  contract_id: number;
  
  @Column({
    type: 'tinyint',
    comment: '1[接受],2[发送]'
  })
  type: number;

  @Column()
  block_number: string;

  @Column({
    unique: true
  })
  hash: string;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column()
  amount: string;

  @Column({
    type: 'text'
  })
  extends: string;

  @CreateDateColumn()
  create_time: string;

}