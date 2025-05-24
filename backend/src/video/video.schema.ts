import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MCQ {
    @Prop()
    question: string;

    @Prop([String])
    options: string[];

    @Prop()
    answer: string;
}

export const MCQSchema = SchemaFactory.createForClass(MCQ);

@Schema()
export class TranscriptSegment {
    @Prop({ required: true })
    start: number;

    @Prop({ required: true })
    end: number;

    @Prop({ required: true })
    text: string;

    @Prop({ type: [MCQSchema], default: [] })
    mcqs: MCQ[];
}

export const TranscriptSegmentSchema = SchemaFactory.createForClass(TranscriptSegment);

@Schema()
export class VideoTranscript extends Document {
    @Prop({ required: true })
    filename: string;

    @Prop({ required: true })
    videoUrl: string;

    @Prop({ required: true })
    transcript: string;

    @Prop({ type: [TranscriptSegmentSchema], required: true })
    segments: TranscriptSegment[];
}

export const VideoTranscriptSchema = SchemaFactory.createForClass(VideoTranscript);
