// Modules
import axios from "axios";

// Constants
const STRIKE_API_ENDPOINT = "https://api.strike.me/v1";
const SATOSHIS_PER_BITCOIN = 100000000;

/** `strike.generatePaymentQuoteFromInvoice` - generates a strike payment quote from a bolt11 lightning invoice */
export async function generatePaymentQuoteFromInvoice(
  access_token: string,
  invoice: string
) {
  try {
    const response = await axios({
      method: "POST",
      url: `${STRIKE_API_ENDPOINT}/payment-quotes/lightning`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      data: {
        lnInvoice: invoice,
      },
    });
    const quote = response.data.paymentQuoteId;
    return { success: true, quote };
  } catch (error: any) {
    console.log("strike.generatePaymentQuoteFromInvoice ERROR: ", error);
    return { success: false, error };
  }
}

/** `strike.generatePaymentQuoteFromLNAddress` - generates a strike payment quote from a lightning address */
export async function generatePaymentQuoteFromLNAddress(
  access_token: string,
  lnaddress: string,
  satoshis: number,
  message?: string
) {
  try {
    console.log("lnaddress: ", lnaddress);
    console.log("message: ", message);
    const amount = (satoshis / SATOSHIS_PER_BITCOIN).toFixed(8);
    console.log("amount: ", amount);
    const response = await axios({
      method: "POST",
      url: `${STRIKE_API_ENDPOINT}/payment-quotes/lightning/lnurl`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      data: {
        lnAddressOrUrl: lnaddress,
        sourceCurrency: "BTC",
        amount: {
          amount,
          currency: "BTC",
        },
        description: message ?? "",
      },
    });
    const quote = response.data.paymentQuoteId;
    return { success: true, quote };
  } catch (error: any) {
    console.log("strike.generatePaymentQuoteFromLNAddress ERROR: ", error);
    console.log(
      "strike.generatePaymentQuoteFromLNAddress ERROR RESPONSE: ",
      error.response.data
    );
    return { success: false, error };
  }
}

/** `strike.executePaymentQuote` - executes a strike payment quote */
export async function executePaymentQuote(access_token: string, quote: string) {
  try {
    const response = await axios({
      method: "PATCH",
      url: `${STRIKE_API_ENDPOINT}/payment-quotes/${quote}/execute`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    console.log(
      "strike.executePaymentQuote response: ",
      JSON.stringify(response.data, null, 2)
    );
    const payment_id = response.data.paymentId;
    const state = response.data.state;
    return { success: true, payment_id, state };
  } catch (error: any) {
    console.log("strike.executePaymentQuote ERROR: ", error);
    return { success: false, error };
  }
}
