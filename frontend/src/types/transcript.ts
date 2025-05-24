export interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export interface VideoData {
  _id: string;
  filename: string;
  videoUrl: string;
  transcript: string;
  segments: Segment[];
}
export interface Segment {
  start: number;
  end: number;
  text: string;
  mcqs: MCQ[];
}
export interface TranscriptResponse {
  filename: string;
  transcript: string;
  segments: string[];
  mcqs: MCQ[];
}