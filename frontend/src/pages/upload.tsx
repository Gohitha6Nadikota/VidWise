import UploadForm from "../components/UploadForm";
import { useState } from "react";
import TranscriptDisplay from "../components/TranscriptDisplay";

import type { VideoData } from "../types/transcript";

export default function UploadPage() {
  const [result, setResult] = useState<VideoData | null>(null);

  return (
    <div className="p-4">
      {!result ? (
        <UploadForm onSuccess={setResult} />
      ) : (
        <div className="space-y-4">
          <TranscriptDisplay
            transcript={result.transcript}
            segments={result.segments}
            filename={result.filename}
            videoUrl={result.videoUrl}
          />
        </div>
      )}
    </div>
  );
}
