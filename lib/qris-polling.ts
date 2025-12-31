const BASE_URL = process.env.QRIS_POLLING_BASE_URL!;
const INSTANCE_ID = process.env.QRIS_POLLING_INSTANCE_ID!;
const API_KEY = process.env.QRIS_POLLING_API_KEY!;

export interface CreateTransactionParams {
  amount: number;
  externalId: string;
}

export interface CreateTransactionResponse {
  status: "success";
  data: {
    transaction_id: string;
    amount: number;
    correction: number;
    expected_amount: number;
    qr_image: string; // Base64 image
    expires_at: string;
  };
}

export interface CheckStatusResponse {
  status: "success";
  data: {
    id: string;
    status: "PENDING" | "PAID" | "EXPIRED";
    amount: number;
    paid_at: string | null;
    created_at: string;
  };
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<CreateTransactionResponse> {
  console.log("[QRIS Polling] Creating transaction:", params.externalId);

  const response = await fetch(`${BASE_URL}/api/polling/${INSTANCE_ID}/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({
      external_id: params.externalId,
      amount: params.amount,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[QRIS Polling] API Error:", response.status, errorText);
    throw new Error(`QRIS Polling API Error: ${response.status}`);
  }

  const data = await response.json();
  console.log("[QRIS Polling] Transaction created:", data.data.transaction_id);

  return data;
}

export async function checkTransactionStatus(
  externalId: string
): Promise<CheckStatusResponse> {
  const response = await fetch(
    `${BASE_URL}/api/polling/${INSTANCE_ID}/status?external_id=${externalId}`,
    {
      headers: {
        "X-API-Key": API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[QRIS Polling] Status check error:",
      response.status,
      errorText
    );
    throw new Error(`QRIS Polling API Error: ${response.status}`);
  }

  return response.json();
}
