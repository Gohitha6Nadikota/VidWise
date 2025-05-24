import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getVideoById } from "../../api/index";
import TranscriptDisplay from "../../components/TranscriptDisplay";

export default function VideoPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideoById(id!),
  });

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <TranscriptDisplay
        transcript={data.transcript}
        segments={data.segments}
        filename={data.filename}
        mcqs={data.mcqs}
        videoUrl={data.videoUrl}
      />
    </div>
  );
}
