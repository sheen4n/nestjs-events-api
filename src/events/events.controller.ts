import {Body, Controller, Delete, ForbiddenException, Get, HttpCode, Logger, NotFoundException, Param, ParseIntPipe, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe} from "@nestjs/common";
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

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  async update (
    @Param('id') id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.getEvent(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null, `You are not authorized to change this event`
      );
    }

    return this.eventsService.updateEvent(event, input);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove (
    @Param('id') id,
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.getEvent(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizerId !== user.id) {
      throw new ForbiddenException(
        null, `You are not authorized to remove this event`
      );
    }

    await this.eventsService.deleteEvent(id);
  }
}