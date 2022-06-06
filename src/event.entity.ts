import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('events')
export class Event {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({length: 100})
  name: string;

  @Column()
  description: string;

  @Column()
  when: Date;

  @Column()
  address: string;
}