"use client";

import { Suspense } from "react";
import PayAPodcastDemo from "./firehose";

export default function FirehosePage() {
  return (
    <Suspense>
      <PayAPodcastDemo />
    </Suspense>
  );
}
