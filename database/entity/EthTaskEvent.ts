import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity() 
class EthTaskEvent {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '[sendEthTransaction][sendTokenTransaction]'
  })
  event_type: string;

  @Column({
    length: 1,
    comment: '事件标识[1: sendEthTransaction][2:sendTokenTransaction]'
  })
  type: number;

  @Column()
  coin_name: string;

  @Column({
    length: 1,
    comment: '状态[1: 进行中][2:已完成]'
  })
  state: number;

  @Column({
    length: 1,
    comment: '回调状态[0: 未回掉][1: 回调成功][2: 回调失败]'
  })
  callback_state: string;

  @Column({
    type: 'text',
    comment: '交易信息'
  })
  extends: string;

  @CreateDateColumn()
  create_time: string;
  
  @UpdateDateColumn()
  update_time: string;

}