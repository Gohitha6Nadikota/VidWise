 import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class EventsService {
    private readonly progressSubject = new Subject<MessageEvent>();

    getProgressStream(): Observable<MessageEvent> {
        return this.progressSubject.asObservable();
    }

    publishProgress(message: string) {
        this.progressSubject.next({
          data: JSON.stringify({
            type: 'progress',
            content: message,
          },
        )});
    }

    publishMCQs(mcqs: any[]) {
        this.progressSubject.next({
            data: JSON.stringify({
                type: 'mcqs',
                content: mcqs,
            })
        });
    }
}