import MCQTabs from "./MCQTabs";

export default function TranscriptDisplay({
  transcript,
  segments,
  videoUrl,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <video controls src={videoUrl} className="w-full h-45 md:w-1/2 rounded" />
        <div className="w-full h-45 md:w-1/2 p-2 border rounded overflow-y-auto max-h-96">
          <p>{transcript}</p>
        </div>
      </div>
      <MCQTabs segments={segments} />
    </div>
  );
}
