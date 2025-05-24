import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { uploadVideo } from "../api";
import type { TranscriptResponse } from "../types/transcript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onSuccess: (data: TranscriptResponse) => void;
}

type IMCQ = {
  question: string;
  options: string[];
  answer: string;
};
type GroupedMCQs = {
  start: number;
  end: number;
  text: string;
  mcqs: IMCQ[];
};
const UploadForm = ({ onSuccess }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [MCQs,setMCQs] = useState<GroupedMCQs[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: uploadVideo,
    onSuccess: (data) => {
      setErrorMessage(null);
      setProgressMessage("Upload complete!");
      closeEventSource();
      onSuccess(data);
    },
    onError: (err: unknown) => {
      closeEventSource();
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Upload failed. Try again.");
      }
    },
  });

  const startListeningToProgress = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const source = new EventSource("http://localhost:3000/events/progress");
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      const data=JSON.parse(event.data);
      console.log("Received data:", data);
      if(data.type === "mcqs") {
        const mcqData = data.content;
        setMCQs((prev) => [...prev, ...mcqData]);
      }
      else if(data.type === "progress") {
        setProgressMessage(data.content);
      }
    };

    source.onerror = () => {
      source.close();
      eventSourceRef.current = null;
    };
  };

  const closeEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setProgressMessage("Starting upload...");
      startListeningToProgress();
      mutate(file);
    } else {
      setErrorMessage("Please select a video file to upload.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setProgressMessage(null);
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  useEffect(() => {
    return () => {
      closeEventSource();
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="file"
        accept="video/mp4,video/mkv"
        onChange={handleFileChange}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload Video"}
      </Button>
      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      {progressMessage && (
        <p className="text-sm text-blue-600">{progressMessage}</p>
      )}
    </form>
  );
};

export default UploadForm;