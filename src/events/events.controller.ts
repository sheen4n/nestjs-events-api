import {Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, MoreThan, Repository} from "typeorm";
import {Event} from '../events/event.entity';
import {CreateEventDto} from "./create-event.dto";
import {UpdateEventDto} from "./update-event.dto";

@Controller('/events')
export class EventsController {
  constructor (
    @InjectRepository(Event)
    private readonly repository: Repository<Event>
  ) {}

  @Get()
  findAll () {
    return this.repository.find();
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

  @Get(':id')
  findOne (@Param('id', ParseIntPipe) id: number) {
    // @ts-ignore
    // console.log(typeof id);
    return this.repository.findOne(id);
  }

  // You can also use the @UsePipes decorator to enable pipes.
  // It can be done per method, or for every method when you
  // add it at the controller level.
  @Post()
  create (@Body() input: CreateEventDto) {
    return this.repository.save({
      ...input,
      when: new Date(input.when)
    });
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
    const event = await this.repository.findOne(id);
    await this.repository.remove(event);
  }
}