import { useQuery } from "@tanstack/react-query";
import { getAllVideos } from "../api/index";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import VideoCard from "../components/VideoCard";

export default function HomePage() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: getAllVideos,
  });
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Uploaded Videos</h2>
        <Button onClick={() => navigate("/upload")}>Upload Video</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          videos.map((video: any) => (
            <VideoCard key={video._id} video={video} />
          ))
        )}
      </div>
    </div>
  );
}
