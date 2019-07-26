import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity() 
export class SystemRunLog {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '0: 正常日志, 1: 异常日志'
  })
  type: number;

  @Column({
    comment: '0:Eth日志, 1:Web日志'
  })
  scene: number;

  @Column()
  log: string;

  @Column()
  extends: string;

  @CreateDateColumn()
  create_time: string;
}