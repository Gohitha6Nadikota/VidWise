import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { VideoTranscript } from './video.schema';
import { EventsService } from 'src/events/events.service';
import axios from 'axios';

@Injectable()
export class VideoService {
  private readonly LLM_URL = 'http://localhost:9000/generate-questions';

  constructor(
    @InjectModel(VideoTranscript.name)
    private videoModel: Model<VideoTranscript>,
    private readonly eventsService: EventsService,
  ) {}

  async getAllVideos() {
    return this.videoModel.find({});
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid video ID');
    }
    return this.videoModel.findById(id).lean();
  }

  async saveTranscript(
    filename: string,
    transcript: string,
    segments: {
      start: number;
      end: number;
      text: string;
    }[],
    videoUrl: string,
  ) {
    this.eventsService.publishProgress('Generating MCQs...');
    const enrichedSegments: any = [];

    for (const segment of segments) {
      try {
        const response = await axios.post<{ mcqs: any[] }>(this.LLM_URL, {
          text: segment.text,
        });

        enrichedSegments.push({
          ...segment,
          mcqs: response.data.mcqs || [],
        });
      } catch (err) {
        console.error(`MCQ generation failed for segment ${segment.text}`, err);
        enrichedSegments.push({ ...segment, mcqs: [] });
      }
    }
    await this.eventsService.publishMCQs(enrichedSegments);
    await this.videoModel.create({
      filename,
      videoUrl,
      transcript,
      segments: enrichedSegments,
    });

    this.eventsService.publishProgress('Video processing complete!');
  }
}
