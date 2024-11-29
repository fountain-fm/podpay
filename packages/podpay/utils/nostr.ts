// deno-lint-ignore-file no-explicit-any

// Modules
import { type Filter, type NostrEvent, type VerifiedEvent } from 'jsr:@nostr/tools@^2.10.4';
import { SimplePool, nip19, finalizeEvent } from 'jsr:@nostr/tools@^2.10.4';

// Lib
import { PodcastGUIDType, PodcastGUIDReference, NOSTR_PAYMENT_EVENT_KIND, PodcastPaymentFromNostrEvent } from '../types/index.ts';
import { PodcastPayment } from '../mod.ts';

// Constants
const DEFAULT_LIMIT = 20;
const DEFAULT_RELAYS = ['wss://relay.fountain.fm', 'wss://relay.primal.net', 'wss://relay.damus.io', 'wss://relay.nostr.band'];
const NIP19_NADDR_PATTERN = /naddr[a-zA-Z0-9]+/;
const SATOSHIS_PER_BITCOIN = 100000000;

/** `nostr.generateNostrNAddress` - generates a nostr nip19 `naddr` string from a pointer - https://github.com/nostr-protocol/nips/blob/master/19.md */
export function generateNostrNAddress(pointer: nip19.AddressPointer): string {
  return nip19.naddrEncode(pointer);
}

/** `nostr.parseNostrNAddress` - parses a nostr nip19 `naddr` string from any text - https://github.com/nostr-protocol/nips/blob/master/19.md */
export function parseNostrNAddress(text: string): { success: boolean; msg?: string; pointer?: nip19.AddressPointer } {
  const match = text.match(NIP19_NADDR_PATTERN);
  if (!match) return { success: false, msg: 'no match' };
  const naddress = match[0];
  const { type, data } = nip19.decode(naddress);
  if (type !== 'naddr' || !data) return { success: false, msg: 'invalid match' };
  return { success: true, pointer: data };
}

// =================================================================================
// PODCAST GUID TAGS - https://github.com/nostr-protocol/nips/blob/master/73.md#podcasts
// =================================================================================

/** `nostr.getPodcastGUIDFilter` - contructs a nostr even filter based on a `podcast:guid` reference */
export function getPodcastGUIDFilter(reference: PodcastGUIDReference, kinds: number[], options: { limit?: number }): Filter {
  const limit = options.limit ?? DEFAULT_LIMIT;
  if (reference.type === PodcastGUIDType.FEED) return { kinds, '#i': [`podcast:guid:${reference.guid}`], limit };
  if (reference.type === PodcastGUIDType.ITEM) return { kinds, '#i': [`podcast:item:guid:${reference.guid}`], limit };
  if (reference.type === PodcastGUIDType.PUBLISHER) return { kinds, '#i': [`podcast:publisher:guid:${reference.guid}`], limit };
  throw Error('INVALID_PODCAST_GUID_REFERENCE');
}

/** `nostr.getPodcastGUIDReferences` - parses the nip73 podcast:guid i tags */
export function getPodcastGUIDReferences(event: NostrEvent): PodcastGUIDReference[] {
  const references = event.tags
    .filter((t) => t[0] === 'i' && t[1].startsWith('podcast:'))
    .map((tag) => {
      try {
        const reference = tag[1];
        const link = tag[2];
        const parts = reference.split(':');
        const guid = parts[parts.length - 1];
        const type: PodcastGUIDType = parts.length === 3 ? PodcastGUIDType.FEED : (parts[1].toUpperCase() as PodcastGUIDType);
        return { type, guid, link } as PodcastGUIDReference;
      } catch (error) {
        console.log(`nostr.getPodcastGUIDReferences ERROR: tag:${tag} `, error);
        return null;
      }
    })
    .filter((r) => !!r);
  return references;
}

// =================================================================================
// NOSTR EVENT LOADING
// =================================================================================

/** `nostr.loadPaymentEventByID` */
export async function loadPaymentEventByID(indentifier: string, options: { relays?: string[] }): Promise<NostrEvent | null> {
  const pool = new SimplePool();
  const relays = options?.relays ?? DEFAULT_RELAYS;
  const filter = { '#d': [indentifier], kinds: [NOSTR_PAYMENT_EVENT_KIND], limit: 1 };
  const events = await pool.querySync(relays, filter);
  return events[0] ?? null;
}

/** `nostr.loadPaymentByID` */
export async function loadPaymentByID(indentifier: string, options: { relays?: string[] }): Promise<PodcastPayment | null> {
  const event = await loadPaymentEventByID(indentifier, options);
  const payment = event ? PodcastPaymentFromNostrEvent(event) : null;
  return payment;
}

/** `nostr.loadEventsForPodcast` - loads a set of nostr events for a podcast */
export async function loadEventsForPodcast(
  reference: PodcastGUIDReference,
  kinds: number[],
  options?: { limit?: number; relays?: string[] }
): Promise<NostrEvent[]> {
  const pool = new SimplePool();
  const relays = options?.relays ?? DEFAULT_RELAYS;
  const filter = getPodcastGUIDFilter(reference, kinds, { limit: options?.limit });
  const events = await pool.querySync(relays, filter);
  return events;
}

/** `nostr.loadEventsForFeed` */
export async function loadEventsForFeed(guid: string, kinds: number[], options: { limit?: number; relays?: string[] }): Promise<NostrEvent[]> {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.FEED, guid };
  return await loadEventsForPodcast(reference, kinds, options);
}

/** `nostr.loadEventsForItem` */
export async function loadEventsForItem(guid: string, kinds: number[], options: { limit?: number; relays?: string[] }): Promise<NostrEvent[]> {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.ITEM, guid };
  return await loadEventsForPodcast(reference, kinds, options);
}

/** `nostr.loadPaymentsForFeed` */
export async function loadPaymentsForFeed(guid: string, options: { limit?: number; relays?: string[] }): Promise<PodcastPayment[]> {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.FEED, guid };
  const kinds = [NOSTR_PAYMENT_EVENT_KIND];
  const events = await loadEventsForPodcast(reference, kinds, options);
  const payments = events.map((e) => PodcastPaymentFromNostrEvent(e)).filter((e) => !!e);
  return payments;
}

/** `nostr.loadPaymentsForItem` */
export async function loadPaymentsForItem(guid: string, options: { kinds?: number[]; limit?: number; relays?: string[] }): Promise<PodcastPayment[]> {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.ITEM, guid };
  const kinds = [NOSTR_PAYMENT_EVENT_KIND];
  const events = await loadEventsForPodcast(reference, kinds, options);
  const payments = events.map((e) => PodcastPaymentFromNostrEvent(e)).filter((e) => !!e);
  return payments;
}

// =================================================================================
// NOSTR EVENT STREAMING
// =================================================================================

/** `nostr.streamEventsForPodcast` - streams a set of nostr events for a podcast */
export function streamEventsForPodcast(
  reference: PodcastGUIDReference,
  kinds: number[],
  onevent: (event: NostrEvent) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const pool = new SimplePool();
  const relays = options?.relays ?? DEFAULT_RELAYS;
  const filter = getPodcastGUIDFilter(reference, kinds, { limit: options?.limit });
  pool.subscribeMany(relays, [filter], { onevent });
}

/** `nostr.streamEventsForFeed` */
export function streamEventsForFeed(
  guid: string,
  kinds: number[],
  onevent: (event: NostrEvent) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.FEED, guid };
  return streamEventsForPodcast(reference, kinds, onevent, options);
}

/** `nostr.streamEventsForItem` */
export function streamEventsForItem(
  guid: string,
  kinds: number[],
  onevent: (event: NostrEvent) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.ITEM, guid };
  return streamEventsForPodcast(reference, kinds, onevent, options);
}

/** `nostr.streamPaymentsForPodcast` */
export function streamPaymentsForPodcast(
  reference: PodcastGUIDReference,
  onpayment: (payment: PodcastPayment | null) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const kinds = [NOSTR_PAYMENT_EVENT_KIND];
  return streamEventsForPodcast(
    reference,
    kinds,
    (event: NostrEvent) => {
      const payment = PodcastPaymentFromNostrEvent(event);
      if (payment) onpayment(payment);
    },
    options
  );
}

/** `nostr.streamPaymentsForFeed` */
export function streamPaymentsForFeed(
  guid: string,
  onpayment: (payment: PodcastPayment | null) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.FEED, guid };
  return streamPaymentsForPodcast(reference, onpayment, options);
}

/** `nostr.streamPaymentsForItem` */
export function streamPaymentsForItem(
  guid: string,
  onpayment: (payment: PodcastPayment | null) => void,
  options?: { limit?: number; relays?: string[] }
): void {
  const reference: PodcastGUIDReference = { type: PodcastGUIDType.ITEM, guid };
  return streamPaymentsForPodcast(reference, onpayment, options);
}

// =================================================================================
// NOSTR EVENT BROADCASTING
// =================================================================================

/** `nostr.broadcastEventToRelays` - broadcasts an event to relays */
export async function broadcastEventToRelays(event: NostrEvent | VerifiedEvent): Promise<void> {
  const pool = new SimplePool();
  await Promise.any(pool.publish(DEFAULT_RELAYS, event));
}

// =================================================================================
// NOSTR EVENT SIGNING
// =================================================================================

/** `nostr.generatePaymentEvent` - generates a kind 30090 payment event */
export function generatePaymentEvent(
  identifier: string,
  payer: { name?: string; relay?: string; pubkey?: string },
  payee: { name?: string; relay?: string; pubkey?: string },
  satoshis: number,
  signer_nsec: string,
  options?: { message?: string; tags: string[][] }
): { success: boolean; payment?: NostrEvent; error?: any } {
  try {
    // check signer nsec
    if (!signer_nsec) throw Error('MISSING_SIGNER_NSEC');
    const { type, data } = nip19.decode(signer_nsec);
    if (type !== 'nsec' || !data) throw Error('INVALID_SIGNER_NSEC');
    const _privatekey = data as Uint8Array;

    // create payment event
    const amount = satoshis / SATOSHIS_PER_BITCOIN;
    const payment = finalizeEvent(
      {
        kind: 30090,
        created_at: Math.floor(Date.now() / 1000),
        content: options?.message ?? '',
        tags: [
          ['d', identifier],
          ['currency', 'BTC'],
          ['amount', `${amount}`],
          ['payer', payer.pubkey ?? '', payer.relay ?? '', payer.name ?? ''],
          ['payee', payee.pubkey ?? '', payee.relay ?? '', payee.name ?? ''],
          ['metadata', '{"action": "boost"}'],
          ...(options?.tags ?? []),
        ],
      },
      _privatekey
    );

    // done
    return { success: true, payment };
  } catch (error: any) {
    console.log('nostr.generatePaymentEvent ERROR: ', error);
    return { success: false, error };
  }
}
