"use client";

import { Suspense } from "react";
import PaymentView from "./payment.js";

export default function PaymentPage() {
  return (
    <Suspense>
      <PaymentView />
    </Suspense>
  );
}
