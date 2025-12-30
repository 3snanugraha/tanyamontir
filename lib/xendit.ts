export interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export async function createInvoice(params: CreateInvoiceParams) {
  const apiKey =
    process.env.XENDIT_MODE === "PRODUCTION"
      ? process.env.XENDIT_PRODUCTION_KEY
      : process.env.XENDIT_DEVELOPMENT_KEY;

  if (!apiKey) {
    throw new Error("Xendit API Key missing");
  }

  const token = Buffer.from(apiKey + ":").toString("base64");

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
      payer_email: params.payerEmail,
      description: params.description,
      success_redirect_url: params.successRedirectUrl,
      failure_redirect_url: params.failureRedirectUrl,
      currency: "IDR",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Xendit Error:", errorBody);
    throw new Error(`Xendit API Error: ${response.statusText}`);
  }

  return response.json();
}
