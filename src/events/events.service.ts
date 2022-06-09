import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, Repository} from "typeorm";
import {AttendeeAnswerEnum} from '../attendee.entity';
import {User} from '../auth/user.entity';
import {paginate, PaginateOptions} from '../pagination/paginator';
import {Event} from "./event.entity";
import {CreateEventDto} from './inputs/create-event.dto';
import {ListEvents, WhenEventFilter} from './inputs/list.events';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor (
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  private getEventsBaseQuery () {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }

  public getEventsWithAttendeeCountQuery () {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap(
        'e.attendeeCount', 'e.attendees'
      )
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            {answer: AttendeeAnswerEnum.Accepted}
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            {answer: AttendeeAnswerEnum.Maybe}
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            {answer: AttendeeAnswerEnum.Rejected}
          )
      );
  }

  private getEventsWithAttendeeCountFiltered (
    filter?: ListEvents
  ) {
    let query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      if (filter.when == WhenEventFilter.Today) {
        query = query.andWhere(
          `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`
        );
      }

      if (filter.when == WhenEventFilter.Tommorow) {
        query = query.andWhere(
          `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`
        );
      }

      if (filter.when == WhenEventFilter.ThisWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)');
      }

      if (filter.when == WhenEventFilter.NextWeek) {
        query = query.andWhere('YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1');
      }
    }

    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated (
    filter: ListEvents,
    paginateOptions: PaginateOptions
  ) {
    return paginate(
      this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions
    );
  }

  public getEvent (id: number): Promise<Event> {
    const query = this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', {id});

    this.logger.debug(query.getSql());

    return query.getOne();
  }

  public deleteEvent (id: number): Promise<DeleteResult> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', {id})
      .execute();
  }

  public createEvent (input: CreateEventDto, user: User): Promise<Event> {
    console.log(user);
    return this.eventsRepository.save({
      ...input,
      organizer: user,
      when: new Date(input.when)
    });
  }

}