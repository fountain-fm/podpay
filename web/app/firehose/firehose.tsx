"use client";

import { useEffect, useState } from "react";
import { Divider } from "@nextui-org/divider";
import { Link } from "@/components/link";
import { PodcastPayment, streamPaymentsForFeed } from "@fountain/podpay";

// Constants
const FOUNTAIN_RADIO_FEED_GUID = "a7031f30-abd0-5019-9ae8-4bfbe85f2465";

export default function FirehoseView() {
  const [firehose, setFirehose] = useState<{
    loading: boolean;
    payments: PodcastPayment[];
  }>({
    loading: true,
    payments: [],
  });

  // stream payments for radio
  useEffect(() => {
    try {
      streamPaymentsForFeed(FOUNTAIN_RADIO_FEED_GUID, (payment) => {
        if (payment) {
          firehose.payments.push(payment);
          setFirehose({ loading: false, payments: firehose.payments });
        }
      });
    } catch (error) {
      console.error("FirehoseView.streamPaymentsForFeed ERROR: ", error);
    }
  }, []);

  firehose.payments.sort(
    (a, b) =>
      (b.nostr.event?.created_at ?? 0) - (a.nostr.event?.created_at ?? 0)
  );
  return (
    <section className="flex flex-col items-center justify-center gap-4 md:pt-2">
      <div className="inline-block max-w-xl text-center justify-center">
        <h1 className="font-bold text-xl text-primary">Payment Firehose</h1>
        <p className="text-xs py-2">
          This page shows the firehose of all payments sent to the
          <span className="px-1 text-primary">
            <Link
              text="Fountain Radio Test Feed"
              href="https://podcastindex.org/podcast/7108233"
            />
          </span>
          - either via the
          <span className="px-1 text-primary">
            <Link text="demo page" href="https://podpay.org/demo" />
          </span>
          or from apps that have implemented the nostr payment events. Try out
          the demo and come back to this page to see your payment event!
        </p>
        <Divider className="my-2" />

        {firehose.loading ? (
          <div>loading...</div>
        ) : (
          firehose.payments.map((p) => {
            const timestamp = new Date((p.nostr.event?.created_at ?? 0) * 1000);
            const satoshis = Math.round(p.amount.value * 10000000);
            const message = p.nostr.event?.content;
            const payer = p.nostr.event?.tags.find((t) => t[0] === "payer");
            const guids = p.nostr.event?.tags.filter((t) => t[0] === "i");
            const sender = payer![3];
            const link = `https://podpay.org/p/${p.nostr.naddr}`;
            return (
              <div key={p.nostr.event?.id}>
                <div className="mx-auto max-w-sm md:max-w-none pt-1 sm:pt-2 text-xs text-left">
                  <pre className="bg-gray-800 text-gray-200 p-3 rounded-lg overflow-x-auto">
                    <code>
                      <p className="text-xs font-bold">Sender - {sender}</p>
                      <p className="text-xs">
                        Timestamp -{" "}
                        {timestamp
                          .toISOString()
                          .substring(0, 16)
                          .replaceAll("T", " ")}
                      </p>
                      <p className="text-xs">Amount - {satoshis} sats</p>
                      <p className="text-xs">Message - {message}</p>
                      <p className="text-xs">GUIDs - {JSON.stringify(guids)}</p>
                      <p className="text-xs text-primary">
                        <Link text={link} href={link} />
                      </p>
                    </code>
                  </pre>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
