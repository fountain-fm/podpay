"use client";

import { Suspense } from "react";
import PodPayDemo from "./demo";

export default function DemoPage() {
  return (
    <Suspense>
      <PodPayDemo />
    </Suspense>
  );
}
