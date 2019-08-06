import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity() 
export class EthSendTaskEvent {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '[sendEthTransaction][sendTokenTransaction]'
  })
  event_type: string;

  @Column({
    type: 'integer',
    comment: '事件标识[1: sendEthTransaction][2:sendTokenTransaction]'
  })
  type: number;

  @Column()
  coin_name: string;

  @Column({
    type: 'text',
    comment: '事件参数'
  })
  event_param: string;

  @Column({
    type: 'integer',
    comment: '状态[1: 进行中][2:已完成]'
  })
  state: number;

  @Column({
    length: 100,
    nullable: true,
    default: null
  })
  hash: string;

  @Column({
    type: 'text',
    comment: '状态运行信息或错误信息',
    nullable: true,
    default: null
  })
  state_message: string;

  @Column({
    type: 'integer',
    comment: '回调状态[0: 未回掉][1: 回调成功][2: 回调失败]'
  })
  callback_state: number;

  @Column({
    type: 'text',
    comment: '回调状态信息或错误信息',
    nullable: true,
    default: null
  })
  callback_state_message: string;

  @Column({
    type: 'text',
    comment: '交易信息',
    nullable: true,
    default: null
  })
  extends: string;

  @CreateDateColumn()
  create_time: string;
  
  @UpdateDateColumn()
  update_time: string;

}