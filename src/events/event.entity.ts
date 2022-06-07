import {Attendee} from "../attendee.entity";
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  when: Date;

  @Column()
  address: string;

  @OneToMany((): typeof Attendee => Attendee, (attendee): Event => attendee.event)
  attendees: Attendee[];
}