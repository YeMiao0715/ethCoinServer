import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity() 
export class Config {
  @PrimaryColumn()
  param: string

  @Column({
    nullable: true,
    default: null
  })
  value: string;

  @Column({
    nullable: true,
    default: null
  })
  desc: string;

  @CreateDateColumn()
  create_time: string;

  @UpdateDateColumn()
  update_time: string;
}