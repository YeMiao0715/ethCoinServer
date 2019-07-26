import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity() 
export class WebRunLog {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50
  })
  ip: string;

  @Column({
    length: 8
  })
  method: string;

  @Column()
  path: string;

  @Column({
    type: 'text'
  })
  param: string;

  @Column({
    type: 'text',
    default: null,
    nullable: true
  })
  return: string;

  @Column({
    comment: '0: 正常日志, 1: 异常日志'
  })
  type: number;

  @Column({
    type: 'text',
    default: null,
    nullable: true
  })
  extends: string;

  @CreateDateColumn()
  create_time: string;

  @UpdateDateColumn()
  update_time: string;
}