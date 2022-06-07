import {PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn} from "typeorm";
import {Event} from "./events/event.entity";

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Event, (event): Attendee[] => event.attendees, {
    nullable: false
  })
  @JoinColumn({
    // name: 'event_id',
    // referencedColumnName: 'secondary'
  })
  event: Event;
}