// Modules
import { describe, it } from 'jsr:@std/testing/bdd';
import { assertEquals, assertNotEquals, assertGreaterOrEqual } from 'jsr:@std/assert';

// Lib
import { loadPaymentsForFeed, PodcastPayment, streamPaymentsForFeed } from '../mod.ts';

describe({
  name: 'loadPaymentsForFeed',
  fn() {
    it({
      name: 'Fountain Radio',
      async fn() {
        const guid = 'a7031f30-abd0-5019-9ae8-4bfbe85f2465';
        const payments = await loadPaymentsForFeed(guid, {});
        assertNotEquals(payments[0].content.feed, undefined);
        assertGreaterOrEqual(payments.length, 2);
      },
    });
    it({
      name: 'Nonexistent feed',
      async fn() {
        const guid = '1234-5678';
        const payments = await loadPaymentsForFeed(guid, {});
        assertEquals(payments.length, 0);
      },
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});

describe({
  name: 'streamPaymentsForFeed',
  fn() {
    it({
      name: 'Fountain Radio',
      async fn() {
        const payments: PodcastPayment[] = [];
        const guid = 'a7031f30-abd0-5019-9ae8-4bfbe85f2465';
        streamPaymentsForFeed(guid, (payment) => {
          if (payment) {
            payments.push(payment);
          }
        });

        // Wait two seconds.
        await new Promise((r) => setTimeout(r, 2000));
        assertNotEquals(payments[0].content.feed, undefined);
        assertGreaterOrEqual(payments.length, 2);
      },
    });
    it({
      name: 'Nonexistent feed',
      async fn() {
        const payments: PodcastPayment[] = [];
        const guid = '1234-5678';
        streamPaymentsForFeed(guid, (payment) => {
          if (payment) {
            payments.push(payment);
          }
        });

        // Wait two seconds.
        await new Promise((r) => setTimeout(r, 2000));
        assertEquals(payments.length, 0);
      },
    });
  },
  sanitizeOps: false,
  sanitizeResources: false,
});
