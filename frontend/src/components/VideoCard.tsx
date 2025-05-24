import { useNavigate } from "react-router-dom";

export default function VideoCard({ video }: { video: any }) {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer border rounded p-3 hover:shadow"
      onClick={() => navigate(`/video/${video._id}`)}
    >
      <video
        src={video.videoUrl}
        controls
        className="w-64 h-36 object-cover rounded-lg shadow cursor-pointer"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
