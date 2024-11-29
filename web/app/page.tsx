"use client";

import { Suspense } from "react";

export default function HomePage() {
  return (
    <Suspense>
      <section className="flex flex-col items-center justify-center gap-4 md:pt-2">
        <div className="inline-block max-w-xl text-center justify-center">
          {/* TITLE */}
          <h1 className="font-bold text-xl text-primary">Pod Pay</h1>

          {/* INFO */}
          <p className="pt-4">
            A set of resources and tools for paying podcasts through the
            Podcasting 2.0 value spec.
          </p>
        </div>
      </section>
    </Suspense>
  );
}
