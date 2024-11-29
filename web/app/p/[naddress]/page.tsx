"use client";

import { Suspense } from "react";
import PaymentView from "./payment";

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentView />
    </Suspense>
  );
}
