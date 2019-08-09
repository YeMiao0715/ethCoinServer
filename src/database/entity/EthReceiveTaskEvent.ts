import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


@Entity() 
export class EthReceiveTaskEvent {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '[receiveEthTransaction]'
  })
  event_type: string;

  @Column({
    comment: '[1: receiveEthTransaction][2: receiveTokenTransaction]'
  })
  type: number;

  @Column()
  coin_id: number;

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

  @Column()
  block_number: number;

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
    comment: '回调状态[0: 未回调][1: 回调成功][2: 回调失败]'
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