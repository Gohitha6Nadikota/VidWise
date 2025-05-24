// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages";
import UploadPage from "./pages/upload";
import VideoPage from "./pages/video/[id]";
import { Toaster } from "sonner"; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/video/:id" element={<VideoPage />} />
        </Routes>
        <Toaster richColors position="top-right" />
      </div>
    </Router>
  );
}

export default App;
