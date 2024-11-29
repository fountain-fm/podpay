## Pod Pay

a library that is useful for developers wanting to integrate podcast payments


### API

Load Podcast Payment Events Using GUIDs:

```ts
/** `loadPaymentsForFeed` */
export async function loadPaymentsForFeed(
  guid: string,
  options: { limit?: number; relays?: string[]
}): Promise<PodcastPayment[]>

/** `loadPaymentsForItem` */
export async function loadPaymentsForItem(
  guid: string, 
  options: { kinds?: number[]; limit?: number; relays?: string[] }
): Promise<PodcastPayment[]>
```

Generate BOLT-11 Invoices from a Lightning Address:

```ts
/** `generateInvoice` - requests a bolt11 invoice from a lightning address */
export async function generateInvoice(
  lnaddress: string,
  satoshis: number,
  message?: string
): Promise<{ success: boolean; invoice?: string; error?: any }>
```


---

### Installing

#### Deno

```
deno add @fountain/podpay
```

#### NPM

```
npx jsr add @fountain/podpay
```

#### PNPM

```
pnpm dlx jsr add @fountain/podpay
```

#### Bun

```
bunx jsr add @fountain/podpay
```

