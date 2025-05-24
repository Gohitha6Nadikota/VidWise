import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
 import { MessageEvent } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Sse('progress')
    sendProgress(): Observable<MessageEvent> {
        return this.eventsService.getProgressStream();
    }
}