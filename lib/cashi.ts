const CASHI_API_URL = "https://cashi.id/api";

export interface CreateOrderParams {
  amount: number;
  orderId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  amount: number; // With unique digits added
  checkout_url: string;
  qrUrl: string; // Base64 image
}

export interface CheckStatusResponse {
  success: boolean;
  status: string;
  amount: number;
  order_id: string;
  provider_tx_id: string;
}

export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResponse> {
  const apiKey = process.env.CASHI_X_API_KEY;

  if (!apiKey) {
    throw new Error("CASHI_X_API_KEY not configured");
  }

  console.log(
    "[Cashi] Creating order:",
    params.orderId,
    "Amount:",
    params.amount
  );

  const response = await fetch(`${CASHI_API_URL}/create-order`, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      order_id: params.orderId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Cashi] API Error:", response.status, errorText);
    throw new Error(`Cashi API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("[Cashi] Order created successfully:", data.order_id);

  return data;
}

export async function checkStatus(
  orderId: string
): Promise<CheckStatusResponse> {
  const apiKey = process.env.CASHI_X_API_KEY;

  if (!apiKey) {
    throw new Error("CASHI_X_API_KEY not configured");
  }

  const response = await fetch(`${CASHI_API_URL}/check-status/${orderId}`, {
    headers: {
      "X-API-KEY": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Cashi] Status check error:", response.status, errorText);
    throw new Error(`Cashi API Error: ${response.status}`);
  }

  return response.json();
}
