// import type { Route } from "./+types/home";
// import { Link } from "react-router";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "New React Router App" },
//     { name: "description", content: "Welcome to React Router!" },
//   ];
// }

// export default function Home() {
//   return(
//     <>
//         <h1>This is TIMELINE 💝</h1>
//         <Link to={'/'}>HOME</Link>


//     </>
//   );
// }

import { useEffect, useRef } from 'react';
import { Timeline, type TimelineOptions } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
// import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineItem {
  id: number;
  content: string;
  start: string;
  end?: string;
}

function MyTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    const items = new DataSet<TimelineItem>([
      { id: 1, content: 'Item 1', start: '2024-01-01' },
      { id: 2, content: 'Item 2', start: '2024-01-15', end: '2024-01-20' }
    ]);

    const options: TimelineOptions = {
      width: '100%',
      height: '400px',
      stack: true,
      showMajorLabels: true,
      showCurrentTime: true
    };

    timelineInstance.current = new Timeline(
      timelineRef.current,
      items,
      options
    );

    return () => {
      timelineInstance.current?.destroy();
    };
  }, []);

  return <div ref={timelineRef} />;
}

export default MyTimeline;