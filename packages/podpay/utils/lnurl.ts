// deno-lint-ignore-file no-explicit-any

// Constants
const LNADDRESS_DOMAINS_SUPPORTING_OPTIONS_LOOKUP = ['fountain.fm', 'getalby.com'];

/** `lnurl.generateInvoice` - requests a bolt11 invoice from a lightning address */
export async function generateInvoice(
  lnaddress: string,
  satoshis: number,
  message?: string
): Promise<{ success: boolean; invoice?: string; error?: any }> {
  try {
    const [username, domain] = lnaddress.split('@');
    const _millisats = satoshis * 1000;
    let _callback;

    // ln address domain supports the options lookup
    if (LNADDRESS_DOMAINS_SUPPORTING_OPTIONS_LOOKUP.includes(domain)) {
      console.log('lnurl.generateInvoice => running options file lookup');
      const response = await fetch(`https://${domain}/.well-known/lnurlp/${username}/options`);
      const { status, options } = await response.json();
      const ok = status === 'OK';
      if (!ok) throw Error(`LNURL_BAD_STATUS`);
      const lnurlp = options.find((o: any) => o.type === 'lnurlp');
      if (!lnurlp) throw Error(`LNURL_MISSING_BOLT11`);
      if (_millisats < lnurlp.minSendable) throw Error(`LNURL_AMOUNT_BELOW_MINIMUM`);
      _callback = lnurlp.callback;
    }

    // regular lnurl lookup
    else {
      console.log('lnurl.generateInvoice => running regular lurl lookup');
      const response = await fetch(`https://${domain}/.well-known/lnurlp/${username}`);
      const { status, minSendable, callback } = await response.json();
      const ok = status === 'OK';
      if (!ok) throw Error(`LNURL_BAD_STATUS`);
      if (_millisats < minSendable) throw Error(`LNURL_AMOUNT_BELOW_MINIMUM`);
      _callback = callback;
    }

    // generate invoice
    const _message = message ? `&comment=${message}` : '';
    const response = await fetch(`${_callback}?amount=${_millisats}${_message}`);
    const { pr } = await response.json();
    const invoice = pr;

    // done
    return { success: true, invoice };
  } catch (error: any) {
    console.log('lnurl.generateInvoice ERROR: ', error);
    throw error;
  }
}
