import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Card } from "~/@shad/components/card";
import { Input } from "~/@shad/components/input";

export const Route = createFileRoute("/app/testing")({
  component: RouteComponent,
});

export default function DateScroll() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "-50% 0px",
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const date = entry.target.getAttribute("data-date");
          if (date) {
            setSelectedDate(date);
          }
        }
      });
    }, options);

    const dateElements = document.querySelectorAll(".date-item");
    dateElements.forEach((element) => {
      observerRef.current?.observe(element);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Generate dates for January
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
      <div className="flex w-full max-w-2xl items-center gap-8">
        <div
          ref={containerRef}
          className="scrollbar-none customScrollBar h-[300px] overflow-y-auto overflow-x-hidden"
        >
          <div className="relative py-[150px]">
            {dates.map((date) => (
              <div
                key={date}
                className="date-item flex items-center gap-4 py-4"
                data-date={`January ${date}, 2024`}
              >
                <span className="text-4xl font-light">{date}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="flex-1 border-white/20 bg-transparent">
          <Input
            value={selectedDate}
            readOnly
            className="h-[200px] border-0 bg-transparent text-xl text-white"
          />
        </Card>
      </div>
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="class flex h-[1000px] flex-col">
      <DateScroll />
    </div>
  );
}
