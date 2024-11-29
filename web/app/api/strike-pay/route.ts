// Modules
import {
  NOSTR_PAYMENT_EVENT_KIND,
  generateNostrNAddress,
  generatePaymentEvent,
  broadcastEventToRelays,
} from "@fountain/podpay";

// Lib
import { PaymentSplit, strike } from "../_lib/index";

// Constants
const BOOSTBOT_SIGNER_PUBKEY = process.env.BOOSTBOT_SIGNER_PUBKEY;
const BOOSTBOT_SIGNER_NSEC = process.env.BOOSTBOT_SIGNER_NSEC;

/** `POST api/strike-pay` - pays a lightning address a specific amount using strike via lnurl */
export async function POST(request: Request) {
  const data = await request.json();
  console.log("api/strike-pay => ", data);
  const { access_token, satoshis, splits, name, message, guids } = data;

  // validate
  if (typeof access_token !== "string") throw Error("INVALID_STRIKE_TOKEN");
  if (typeof satoshis !== "number") throw Error("INVALID_SATOSHIS");
  if (!BOOSTBOT_SIGNER_PUBKEY) throw Error("MISSING_BOOSTBOT_SIGNER_PUBKEY");
  if (!BOOSTBOT_SIGNER_NSEC) throw Error("MISSING_BOOSTBOT_SIGNER_NSEC");

  // generate payment event naddress
  const identifier = crypto.randomUUID();
  const naddress = generateNostrNAddress({
    identifier,
    kind: NOSTR_PAYMENT_EVENT_KIND,
    pubkey: BOOSTBOT_SIGNER_PUBKEY,
  });
  const payment_link = `https://podpay.org/p/${naddress}`;
  const payment_memo = `Podcasting 2.0 Payment:\n\n${payment_link}`;

  // iterate through splits and pay with strike
  const results: PaymentSplit[] = [];
  for (const split of splits) {
    try {
      const lnaddress = split.lnaddress;
      const amount = Math.ceil(satoshis * (split.percent / 100));

      // GENERATE INVOICE USING STRIKE API

      // pay lnaddress split with strike
      const { quote } = await strike.generatePaymentQuoteFromLNAddress(
        access_token,
        lnaddress,
        amount,
        payment_memo
      );
      if (!quote) {
        results.push({ ...split, status: "PAYMENT_QUOTE_NOT_GENERATED" });
      } else {
        const { state } = await strike.executePaymentQuote(access_token, quote);
        results.push({ ...split, status: state });
      }

      // GENERATE INVOICE USING LNURL DIRECTLY

      // request bolt11 invoice via lnurl
      // const { invoice } = await generateInvoice(lnaddress, amount, naddress);
      // console.log("invoice: ", invoice);
      // if (!invoice) {
      //   results.push({ ...split, status: "INVOICE_NOT_GENERATED" });
      // }

      // // pay bolt11 invoice with strike
      // else {
      //   const { quote } = await strike.generatePaymentQuoteFromInvoice(
      //     access_token,
      //     invoice
      //   );
      //   if (!quote) {
      //     results.push({ ...split, status: "PAYMENT_QUOTE_NOT_GENERATED" });
      //   } else {
      //     const { state } = await strike.executePaymentQuote(
      //       access_token,
      //       quote
      //     );
      //     results.push({ ...split, status: state });
      //   }
      // }
    } catch (error) {
      results.push({ ...split, status: "ERROR" });
    }
  }

  // generate payment event
  const { payment } = generatePaymentEvent(
    identifier,
    { name },
    { name: "Fountain Radio" },
    satoshis,
    BOOSTBOT_SIGNER_NSEC,
    {
      message,
      tags: guids,
    }
  );

  // broadcast to relays
  if (payment) await broadcastEventToRelays(payment);

  // done
  return Response.json({ success: true, results, payment, naddress });
}
