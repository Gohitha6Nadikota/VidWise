import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
 import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoTranscript, VideoTranscriptSchema } from './video.schema';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoTranscript.name, schema: VideoTranscriptSchema }
    ]),
    EventsModule,
  ],
  controllers: [VideoController],
  providers: [VideoService]
})
export class VideoModule { }
