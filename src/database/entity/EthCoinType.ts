import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class EthCoinType {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 10,
    unique: true
  })
  name: string;

  @Column({
    type: 'decimal',
    default: 0,
    precision: 50, 
    scale: 8
  })
  amount: number;

  @Column({
    comment: '类型[eth][token]',
    length: 10
  })
  type: string;

  @Column({
    default: 0,
    comment: '0: 关闭, 1: 开启'
  })
  state: boolean;

  @Column({
    type: 'integer',
    default: 0,
    comment: '是否是合约 0: 否, 1: 是'
  })
  is_contract: number;

  @Column({
    length: 50,
    comment: '合约地址',
    unique: true,
    default: null,
    nullable: true
  })
  contract_address: string;

  @Column({
    length: 50,
    comment: '计算手续费地址',
    default: null,
    nullable: true
  })
  calc_gas_address: string;

  @Column({
    comment: '币种小数点'
  })
  decimal: number;

  @Column({
    type: 'text',
    comment: '合约abi接口',
    default: null,
    nullable: true
  })
  abi: string;

  @CreateDateColumn()
  create_time: string;
  
  @UpdateDateColumn()
  update_time: string;

}