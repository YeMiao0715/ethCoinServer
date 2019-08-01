import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class AddressTransaction {

  @PrimaryColumn()
  address_id: number;

  @Column({
    type: 'tinyint',
    comment: '1[接受],2[发送]'
  })
  type: number;

  @Column()
  contract_address: string;

  @Column()
  block_number: string;

  @Column()
  hash: string;

  @Column({
    type: 'text'
  })
  extends: string;

  @CreateDateColumn()
  create_time: string;

}