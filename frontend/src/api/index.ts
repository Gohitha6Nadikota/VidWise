import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export const uploadVideo = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/video/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log("Upload response:", response.data);
  return response.data.data; 
};

export const getAllVideos = async () => {
  const response = await api.get("/video");
  return response.data;
};


export const getVideoById = async (id: string) => {
  const response = await api.get(`/video/${id}`);
  console.log("Video data:", response.data);
  return response.data;
};
