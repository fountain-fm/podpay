"use client";

// @ts-ignore
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Divider } from "@nextui-org/divider";
import { Link } from "@/components/link.js";
import {
  PodcastPayment,
  loadPaymentByID,
  parseNostrNAddress,
} from "@fountain/podpay";

export default function PaymentView() {
  const params = useParams<{ naddress: string }>();
  const { naddress } = params;
  if (!naddress) return notFound();

  // load the payment event from a nostr relay
  const [payment, setPayment] = useState<PodcastPayment | null>(null);
  useEffect(() => {
    const _loadPayment = async () => {
      try {
        const { pointer } = parseNostrNAddress(naddress);
        const id = pointer?.identifier;
        if (id) {
          const payment = await loadPaymentByID(id, {});
          setPayment(payment);
        }
      } catch (error) {
        console.error("PaymentPage._loadPayment ERROR: ", error);
      }
    };
    _loadPayment();
  }, [naddress]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 md:pt-2">
      <div className="inline-block max-w-xl text-center justify-center">
        <h1 className="font-bold text-xl text-primary">Podcast Payment:</h1>
        {payment ? (
          <div className="text-left">
            <Divider className="my-4" />
            <p className="text-xs">
              To share payment metadata between different apps we use the
              <span className="px-1 text-primary">
                <Link
                  text="Nostr Generic Payment Event"
                  href="https://github.com/MerryOscar/nips/blob/generic-payment/XX.md"
                />
              </span>
              which can be signed by the app sending the payment. This avoids
              the issue of unreliable payment data in the keysend TLV records.
              Importantly - these payment events can be shared between apps{" "}
              <span className="text-primary italic">without</span> the users of
              those apps ever having to use nostr or create a nostr profile.
            </p>
            <p className="text-xs"></p>
            <div className="mx-auto max-w-sm md:max-w-none pt-2 sm:pt-3 text-xs">
              <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(payment.nostr, null, 2)}</code>
              </pre>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
