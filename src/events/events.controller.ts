import {Body, Controller, Delete, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, MoreThan, Repository} from "typeorm";
import {Attendee} from "../attendee.entity";
import {Event} from '../events/event.entity';
import {CreateEventDto} from "./inputs/create-event.dto";
import {EventsService} from "./events.service";
import {UpdateEventDto} from "./inputs/update-event.dto";
import {ListEvents} from "./inputs/list.events";
import {CurrentUser} from "../auth/current-user.decorator";
import {AuthGuardJwt} from "../auth/auth-guard.jwt";
import {User} from "../auth/user.entity";

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor (
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    private readonly eventsService: EventsService
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({transform: true}))
  findAll (@Query() filter: ListEvents) {
    return this.eventsService
      .getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 2
        }
      );
  }
  @Get('/practice')
  practice () {
    return this.repository.find({
      select: ['id', 'when'],
      where: [{
        id: MoreThan(3),
        when: MoreThan(new Date('2021-02-12T13:00:00'))
      }, {
        description: Like('%meet%')
      }],
      take: 2,
      order: {
        id: 'DESC'
      }
    });
  }

  @Get('practice2')
  async practice2 () {
    return this.repository.findOne(1
      ,
      // {loadEagerRelations: false},
      {relations: ['attendees']}
    );
  }

  @Get('practice3')
  async practice3 () {
    const event = await this.repository.findOne(1);
    const attendee = new Attendee();
    attendee.name = 'Jerry';
    attendee.event = event;

    await this.attendeeRepository.save(attendee);
    return event;
  }

  @Get('practice4')
  async practice4 () {
    const event = new Event();
    event.id = 1;

    const attendee = new Attendee();
    attendee.name = 'Tom';
    attendee.event = event;

    await this.attendeeRepository.save(attendee);
    return event;
  }

  @Get('practice5')
  async practice5 () {
    const event = await this.repository.findOne(1, {relations: ['attendees']});

    const attendee = new Attendee();
    attendee.name = 'Tom';
    // @ts-ignore
    // attendee.event = event;

    event.attendees.push(attendee);
    // @ts-ignore
    // await this.attendeeRepository.save(attendee);
    await this.repository.save(event);
    return event;
  }

  @Get('QueryBuilder')
  async getQueryBuilderPractice () {
    return this.repository.createQueryBuilder('e')
      .select(['e.id', 'e.name'])
      .orderBy('e.id', 'ASC')
      .take(3)
      .getMany();
  }

  @Get(':id')
  async findOne (@Param('id', ParseIntPipe) id: number) {
    // @ts-ignore
    // console.log(typeof id);
    const event = await this.eventsService.getEvent(id);
    if (!event) throw new NotFoundException();
    return event;
  }

  // You can also use the @UsePipes decorator to enable pipes.
  // It can be done per method, or for every method when you
  // add it at the controller level.
  @Post()
  @UseGuards(AuthGuardJwt)
  create (
    @Body() input: CreateEventDto,
    @CurrentUser() user: User
  ) {
    return this.eventsService.createEvent(input, user);
  }

  // Create new ValidationPipe to specify validation group inside @Body
  // new ValidationPipe({ groups: ['update'] })
  @Patch(':id')
  async update (
    @Param('id') id,
    @Body() input: UpdateEventDto
  ) {
    const event = await this.repository.findOne(id);

    return this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove (@Param('id') id) {
    const result = await this.eventsService.deleteEvent(id);

    if (result?.affected !== 1) {
      throw new NotFoundException();
    }
  }
}