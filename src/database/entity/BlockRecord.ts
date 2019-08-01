import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class BlockRecord {
  
  @PrimaryColumn()
  block_number: number;

  @Column({
    default: 0
  })
  transaction_count: number;

  @Column({
    comment: '捕获交易数量',
    default: 0
  })
  capture_num: number;

  @Column({
    comment: '区块确认数量',
    default: 0
  })
  affert_num: number;

  @CreateDateColumn()
  create_time: string;

  @UpdateDateColumn()
  update_time: string;
}