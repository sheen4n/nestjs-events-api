import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {EventsController} from './events.controller';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'example',
    database: 'nest-events'
  })],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
