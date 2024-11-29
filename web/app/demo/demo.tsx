"use client";

import { useEffect, useState } from "react";
// @ts-ignore
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { Input } from "@nextui-org/input";
import { Divider } from "@nextui-org/divider";
import { Link } from "@/components/link.js";

// Constants
const STRIKE_OAUTH_STATE_KEY = "STRIKE_OAUTH_STATE";
const STRIKE_OAUTH_VERIFIER_KEY = "STRIKE_OAUTH_VERIFIER";
export const FOUNTAIN_RADIO_GUIDS = [
  [
    "i",
    "podcast:guid:a7031f30-abd0-5019-9ae8-4bfbe85f2465",
    "https://fountain.fm/radio",
  ],
];

export default function PayAPodcastDemo() {
  const router = useRouter();
  const params = useSearchParams();

  // strike auth state
  const [auth, setAuth] = useState({
    loading: !!params.get("code"),
    connected: false,
    token: null,
  });

  // payment state
  const [payments, setPayments] = useState({
    paying: false,
    splits: [
      { lnaddress: "boostbot@fountain.fm", percent: 90, status: "UNPAID" },
      { lnaddress: "fountain@strike.me", percent: 10, status: "UNPAID" },
    ],
  });
  const [satoshis, setSatoshis] = useState(1000);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState({
    payment: null,
    naddress: null,
  });

  // =================================================================================
  // get strike access tokens on redirect
  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    if (code && state) {
      const _state = localStorage.getItem(STRIKE_OAUTH_STATE_KEY);
      const _verifier = localStorage.getItem(STRIKE_OAUTH_VERIFIER_KEY);
      if (_state === state && _verifier) {
        setAuth({
          loading: true,
          connected: false,
          token: null,
        });
        _getStrikeAccessTokens(code, _verifier);
      }
    }
  }, []);

  // =================================================================================
  /// _getStrikeAccessTokens
  async function _getStrikeAccessTokens(
    oauth_code: string,
    oauth_verifier: string
  ) {
    try {
      const response = await fetch("api/strike-oauth", {
        method: "POST",
        body: JSON.stringify({ oauth_code, oauth_verifier }),
      });
      const { access_token } = await response.json();
      router.replace("/demo"); // remove query params
      setAuth({
        loading: false,
        connected: true,
        token: access_token,
      });
    } catch (error) {
      console.error("HomePage._getStrikeAccessTokens ERROR: ", error);
    }
  }

  // =================================================================================
  /// _connectStrike
  async function _connectStrike() {
    try {
      setAuth({
        loading: true,
        connected: false,
        token: null,
      });
      const response = await fetch("api/strike-oauth");
      const { oauth_url, oauth_state, oauth_verifier } = await response.json();
      // save oauth state in local storage for access on redirect
      localStorage.setItem(STRIKE_OAUTH_STATE_KEY, oauth_state);
      localStorage.setItem(STRIKE_OAUTH_VERIFIER_KEY, oauth_verifier);
      // redirect to strike auth url
      window.location.replace(oauth_url);
    } catch (error) {
      console.error("HomePage._connectStrike ERROR: ", error);
      setAuth({
        loading: false,
        connected: false,
        token: null,
      });
    }
  }

  // =================================================================================
  /// _payWithStrike
  async function _payWithStrike() {
    const access_token = auth.token;
    const splits = payments.splits;
    setPayments({ paying: true, splits });
    const response = await fetch("api/strike-pay", {
      method: "POST",
      body: JSON.stringify({
        access_token,
        satoshis,
        splits,
        name,
        message,
        guids: FOUNTAIN_RADIO_GUIDS,
      }),
    });
    const { results, payment, naddress } = await response.json();
    setPayments({ paying: false, splits: results });
    setPayment({ payment, naddress });
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 md:pt-2">
      <div className="inline-block max-w-xl text-center justify-center">
        {/* TITLE */}
        <h1 className="font-bold text-xl text-primary">Pod Pay - Demo</h1>
        <p className="pt-2">
          Connect your
          <span className="px-1 text-secondary">
            <Link text="Strike" href="https://strike.me" />
          </span>
          account and support a podcast via BOLT-11
        </p>
        <Divider className="my-4" />

        {/* INFO */}
        <p className="text-xs">
          This demo uses the
          <span className="px-1 text-primary">
            <Link
              text="Podcast LNAddress Spec"
              href="https://github.com/Podcastindex-org/podcast-namespace/blob/main/value/lnaddress.md"
            />
          </span>
          value block spec to allow podcasters to simply add a BOLT-11 Lightning
          Address to their RSS Feed in order to get paid.
        </p>
        <p className="text-xs pt-2">
          The
          <span className="px-1 text-primary">
            <Link
              text="Fountain Radio RSS Feed"
              href="https://feeds.fountain.fm/ADaivzvrcS1cwzXvhYIa"
            />
          </span>
          is used as a test feed with a value block that includes both Fountain
          and Strike Lightning Addresses in the splits:
        </p>

        {/* VALUE BLOCK */}
        <div className="mx-auto max-w-sm md:max-w-none pt-2 sm:pt-3 text-xs text-left">
          <pre className="bg-gray-800 text-gray-200 p-2 rounded-lg overflow-x-auto">
            <code>
              <p>{`<podcast:value type="lightning">`}</p>
              <p className="pl-6 ">
                <span>{`<podcast:valueRecipient name="boostbot@fountain.fm" split="90" type="lnaddress" `}</span>
                <span className="text-primary">{`address="boostbot@fountain.fm"`}</span>
                <span>{`/>`}</span>
              </p>
              <p className="pl-6 ">
                <span>{`<podcast:valueRecipient name="fountain@strike.me" split="10" type="lnaddress" `}</span>
                <span className="text-secondary">{`address="fountain@strike.me" `}</span>
                <span>{`/>`}</span>
              </p>
              <p>{`</podcast:value>`}</p>
            </code>
          </pre>
        </div>
        <p className="text-xs pt-1">
          Once you have connected your Strike account via OAuth, you can make a
          payment. A BOLT-11 invoice is requested for each lnaddress split and
          paid using the Strike API.
        </p>

        {/* CHOOSE SATS + ADD MESSAGE */}
        <Divider className="my-4" />
        <Slider
          label="Choose Amount"
          showTooltip={true}
          step={100}
          minValue={100}
          maxValue={10000}
          value={satoshis}
          onChange={(sats: any) => setSatoshis(sats as number)}
          getValue={(sats: number) => `${sats.toLocaleString()} sats`}
        />
        <Input
          size="sm"
          className="pt-2"
          label="Add your name"
          value={name}
          onValueChange={setName}
          isDisabled={!auth.connected}
        />
        <Input
          size="sm"
          className="pt-2"
          label="Add a message"
          value={message}
          onValueChange={setMessage}
          isDisabled={!auth.connected}
        />

        {/* CONNECT STRIKE / PAY PODCAST BUTTONS */}
        <div className="grid grid-cols-2 gap-4 justify-center pt-3">
          <Button
            isLoading={auth.loading}
            isDisabled={auth.connected || auth.loading}
            color="secondary"
            onClick={() => _connectStrike()}
          >
            {auth.connected ? "Strike Connected" : "Connect Strike"}
          </Button>
          <Button
            isLoading={payments.paying}
            isDisabled={!auth.connected || payments.paying}
            color={auth.connected ? "primary" : "default"}
            onClick={() => _payWithStrike()}
          >
            {`Pay ${satoshis.toLocaleString()} Sats`}
          </Button>
        </div>

        {/* SPLITS LIST */}
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg shadow-md">
            <tbody className="divide-y divide-gray-200">
              {payments.splits.map((split) => (
                <tr key={split.lnaddress} className="text-left">
                  <td className="px-6 py-2 text-sm">{split.lnaddress}</td>
                  <td className="px-6 py-2 text-sm">
                    {Math.round(satoshis * (split.percent / 100))} sats
                  </td>
                  <td className="px-6 py-2 text-sm">{split.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAYMENT EVENT */}
        {payment.payment ? (
          <div className="text-left">
            <Divider className="mt-2" />

            <p className="text-md font-bold pt-2">Nostr Payment Event</p>
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
            <p className="text-md font-bold pt-2">Invoice Description</p>
            <p className="text-xs">
              Because BOLT-11 invoices have a character limit in the description
              field - we use the
              <span className="px-1 text-primary">
                <Link
                  text="NIP-19 encoded naddress"
                  href="https://github.com/nostr-protocol/nips/blob/master/19.md"
                />
              </span>
              text in the invoice along with a url (for this demo it is
              podpay.org but any site could be used going forward) that can
              lookup the full nostr payment event based on the naddress
              shorthand encoding.
            </p>
            <div className="mx-auto max-w-sm md:max-w-none pb-2 sm:py-2 text-xs">
              <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
                <code>
                  {`Podcasting 2.0 Payment\n\n`}
                  <span className="text-primary">
                    <Link
                      text={`https://podpay.org/p/${payment.naddress}`}
                      href={`https://podpay.org/p/${payment.naddress}`}
                    />
                  </span>
                </code>
              </pre>
            </div>
            <p className="text-xs"></p>
            <div className="mx-auto max-w-sm md:max-w-none pt-2 sm:pt-3 text-xs">
              <pre className="bg-gray-800 text-gray-200 p-4 rounded-lg overflow-x-auto">
                <code>{JSON.stringify(payment.payment, null, 2)}</code>
              </pre>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
