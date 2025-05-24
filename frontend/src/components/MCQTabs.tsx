import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";

export default function MCQTabs({ segments }: { segments: any[] }) {
  const [activeTab, setActiveTab] = useState("0");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = videoRef.current?.currentTime || 0;
      const activeIndex = segments.findIndex(
        (seg) => currentTime >= seg.start && currentTime < seg.end
      );
      if (activeIndex !== -1) setActiveTab(activeIndex.toString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {segments.map((seg, idx) => (
            <TabsTrigger key={idx} value={idx.toString()}>
              {Math.floor(seg.start / 60)}m - {Math.floor(seg.end / 60)}m
            </TabsTrigger>
          ))}
        </TabsList>
        {segments.map((seg, idx) => (
          <TabsContent key={idx} value={idx.toString()}>
            <div className="space-y-2">
              {seg.mcqs.map((q: any, qIdx: number) => (
                <div key={qIdx} className="border p-2 rounded">
                  <p className="font-medium">Q: {q.question}</p>
                  <ul className="list-disc list-inside">
                    {q.options.map((opt: string, optIdx: number) => (
                      <li key={optIdx}>{opt}</li>
                    ))}
                  </ul>
                  <p className="text-green-600">Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
