"use client";

import { Suspense } from "react";
import PayAPodcastDemo from "./demo.jsx";

export default function DemoPage() {
  return (
    <Suspense>
      <PayAPodcastDemo />
    </Suspense>
  );
}
