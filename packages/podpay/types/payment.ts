// Modules
import { type NostrEvent, nip19 } from 'jsr:@nostr/tools@^2.10.4';
import { getPodcastGUIDReferences } from '../utils/index.ts';

// Constants
export const NOSTR_PAYMENT_EVENT_KIND = 30090;

/** `PodcastGUIDType` - the type of podcast:guid */
export enum PodcastGUIDType {
  FEED = 'FEED',
  ITEM = 'ITEM',
  PUBLISHER = 'PUBLISHER',
}

/** `PodcastGUIDReference` - a reference to a podcast guid with an optional content link */
export interface PodcastGUIDReference {
  type: PodcastGUIDType;
  guid: string;
  link?: string | undefined;
}

/** `PodcastPayment` - represents a podcast payment */
export interface PodcastPayment {
  amount: {
    currency: string;
    value: number;
  };
  content: {
    feed?: PodcastGUIDReference | undefined;
    item?: PodcastGUIDReference | undefined;
    publisher?: PodcastGUIDReference | undefined;
  };
  nostr: {
    naddr: string;
    event: NostrEvent | undefined;
  };
}

/** `PodcastPayment` - converts a kind 30090 nostr payment event to a podcast payment */
export function PodcastPaymentFromNostrEvent(event: NostrEvent, options?: { relays?: string[] }): PodcastPayment | null {
  try {
    if (event.kind !== NOSTR_PAYMENT_EVENT_KIND) throw Error(`NOT_KIND_${NOSTR_PAYMENT_EVENT_KIND}_PAYMENT_EVENT`);
    const kind = event.kind;
    const pubkey = event.pubkey;
    const relays = options?.relays ?? [];
    const identifier = event.tags.find((t) => t[0] === 'd')![1];
    const currency = event.tags.find((t) => t[0] === 'currency')![1];
    const amount = event.tags.find((t) => t[0] === 'amount')![1];
    const references = getPodcastGUIDReferences(event);
    const naddr = nip19.naddrEncode({ kind, identifier, pubkey, relays });
    return {
      amount: {
        currency,
        value: parseFloat(amount),
      },
      content: {
        feed: references.find((r) => r.type === PodcastGUIDType.FEED),
        item: references.find((r) => r.type === PodcastGUIDType.ITEM),
        publisher: references.find((r) => r.type === PodcastGUIDType.PUBLISHER),
      },
      nostr: {
        naddr,
        event,
      },
    };
  } catch (error) {
    console.log(`PodcastPaymentFromNostrEvent ERROR: id:${event.id}`, error);
    return null;
  }
}
