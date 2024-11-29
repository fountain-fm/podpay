"use client";

import { Suspense } from "react";
import { Divider } from "@nextui-org/divider";
import { Link } from "@/components/link";

export default function HomePage() {
  return (
    <Suspense>
      <section className="flex flex-col items-center justify-center gap-4 md:pt-2">
        <div className="inline-block max-w-xl text-center justify-center">
          {/* TITLE */}
          <h1 className="font-bold text-xl text-primary">Pod Pay</h1>
          <p className="pt-2">
            Pod Pay is a set of resources and tools for paying podcasts through
            the
            <span className="pl-1 text-primary">
              <Link
                text="Podcasting 2.0 LNAddress Value Spec"
                href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/lnaddress.md"
              />
            </span>
            .
          </p>
          <Divider className="my-4" />

          {/* INFO */}
          <p className="my-2 text-xs">
            Historically, Podcasting 2.0 has used the keysend lightning protocol
            to send payments from listeners to podcasters in an open way where
            any app or service can participate without permission.
          </p>
          <p className="my-2 text-xs">
            Keysend has worked well so far but has some fundamental issues that
            are hindering adoption, including lack of support from major
            Lightning Wallets, the UX of sharing value block info, and including
            the metadata in the keysend tlv records which limits message size
            and can allow spoofing payments.
          </p>
          <Divider className="my-4" />
          <p className="text-md font-bold">Moving to Lightning Address</p>
          <p className="my-2 text-xs">
            The
            <span className="px-1 text-primary">
              <Link
                text="Lightning Address"
                href="https://lightningaddress.com"
              />
            </span>
            has become a global standard for identifying user wallets, and is
            seeing global adoption by not only bitcoin wallets but also major
            traditional banks. The UX of sharing Lightning Addresses is
            something that most users understand intuivetly because of the
            similarity with email.
          </p>
          <p className="my-2 text-xs">
            By moving the Podcasting 2.0 payments standard to the
            <span className="px-1 text-primary">
              <Link
                text="lnaddress"
                href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/lnaddress.md"
              />
            </span>
            format, we can simplify the user experience for everyone involved,
            and give app developers an easy way to let listeners connect their
            favourite wallet via OAuth or Nostr Wallet Connect.
          </p>
          <Divider className="my-4" />
          <p className="text-md font-bold">
            Sharing Payment Metadata over Nostr
          </p>
          <p className="my-2 text-xs">
            <span className="px-1 text-primary">
              <Link
                text="Nostr"
                href="https://github.com/nostr-protocol/nips"
              />
            </span>
            is a simple protocol that lets anyone share signed messages in a
            open and permissionless way. Apps can publish payment information as
            <span className="px-1 text-primary">
              <Link
                text="Generic Payment Events"
                href="https://github.com/MerryOscar/nips/blob/generic-payment/XX.md"
              />
            </span>
            which include all the metadata about the payment, are signed by the
            app so can be semi-trusted based on the apps reputation, and are
            queryable which paves the way for cross-app boosts and comments.
          </p>
          <Divider className="my-4" />
          <p className="text-md font-bold">Tools and Resources</p>
          <p className="my-2 text-xs">
            This site aims to serve as a resource hub for developers that want
            to understand and implement Podcasting 2.0 payments - check out the
            following links to learn more:
            <ul className="text-sm pt-2">
              <li>
                -
                <span className="px-1 text-primary">
                  <Link text="Live Demo" href="https://podpay.org/demo" />
                </span>
              </li>
              <li>
                -
                <span className="px-1 text-primary">
                  <Link
                    text="Payment Event Example"
                    href="https://podpay.org/p/naddr1qvzqqqr43gpzpwrxeemtukuzv62esqjgxg4cmaxrs9sgl7j6tdrufuaturv0wea9qqjxxcesxejk2df395mnxepk956rqv3495uk2dmx95mxzenzx93kgvryvenrv8gmxj0"
                  />
                </span>
              </li>
              <li>
                -
                <span className="px-1 text-primary">
                  <Link
                    text="Podpay Library Code"
                    href="https://jsr.io/@fountain/podpay"
                  />
                </span>
              </li>
            </ul>
          </p>
        </div>
      </section>
    </Suspense>
  );
}
