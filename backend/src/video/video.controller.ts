import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    HttpException,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Param, NotFoundException } from '@nestjs/common';
import { VideoService } from './video.service';
import axios from 'axios';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { EventsService } from 'src/events/events.service';

@Controller('video')
export class VideoController {
  private readonly WHISPER_URL = 'http://localhost:8000/transcribe';

  constructor(
    private readonly videoService: VideoService,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  async getAllVideos() {
    return this.videoService.getAllVideos();
  }

  @Get(':id')
  async getVideoById(@Param('id') id: string) {
    try {
      const video = await this.videoService.findById(id);
      if (!video) {
        throw new NotFoundException(`Video with ID ${id} not found`);
      }
      return video;
    } catch (err) {
      throw new HttpException(
        err.message || 'Error fetching video by ID',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    const filePath = file.path;
    const publicVideoUrl = `http://localhost:3000/uploads/${file.filename}`;

    try {
      this.eventsService.publishProgress('Reading video file...');
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const response = await axios.post(this.WHISPER_URL, form, {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
      });

      const { transcript, segments } = response.data;
      try {
        this.videoService.saveTranscript(
          file.filename,
          transcript,
          segments,
          publicVideoUrl,
        );
      } catch (err) {
        console.error('Error saving transcript:', err);
        this.eventsService.publishProgress('Failed to save transcript');
        throw new HttpException(
          'Failed to save transcript',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: 'Video under processing',
        videoUrl: publicVideoUrl,
      };
    } catch (error) {
      console.error(error?.response?.data || error);
      throw new HttpException(
        'Transcription service failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
