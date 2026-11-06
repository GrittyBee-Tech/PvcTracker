import crypto from "crypto";

type PaymentProvider = "paystack" | "flutterwave";

interface InitializeFlutterwaveParams {
  userId: string;
  email: string;
  amount: number;
  redirectUrl: string;
  customer: {
    email: string;
    name: string;
  };
}

interface InitializePaystackParams {
  userId: string;
  email: string;
  amount: number;
}

interface PaymentInitResult {
  ok: boolean;
  status: number;
  error?: string;
  message?: string;
  amount?: number;
  currency?: string;
  payment_url?: string;
  meta?: Record<string, unknown>;
  access_code?: string;
  reference?: string;
  raw?: unknown;
}

interface VerificationResult {
  ok: boolean;
  status: number;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
}

export function verifyFlutterwaveSignature(
  receivedHash: string | null,
): boolean {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash || !receivedHash) return false;

  const bufA = Buffer.from(receivedHash);
  const bufB = Buffer.from(secretHash);

  if (bufA.length !== bufB.length) return false;

  return crypto.timingSafeEqual(bufA, bufB);
}

export async function initializeFlutterwavePayment({
  userId,
  amount,
  redirectUrl,
  customer,
}: InitializeFlutterwaveParams): Promise<PaymentInitResult> {
  const { FLW_SECRET_KEY, NEXT_PUBLIC_FLW_PUBLIC_KEY } = process.env;

  if (!NEXT_PUBLIC_FLW_PUBLIC_KEY || !FLW_SECRET_KEY) {
    return {
      ok: false,
      status: 500,
      error: "Flutterwave credentials are not configured",
    };
  }

  const tx_ref = `nin-${userId}-${Date.now()}`;

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
    },
    body: JSON.stringify({
      tx_ref,
      amount: (amount / 100).toString(),
      currency: "NGN",
      payment_options: "card,banktransfer",
      redirect_url: redirectUrl,
      customer,
      customizations: {
        title: "PVC WAKA NIN Verification",
        description: "Verify your NIN to complete your profile",
      },
      meta: {
        userId,
        purpose: "nin_verification",
      },
    }),
  });

  const data = await response.json();

  if (response.ok && data.status === "success" && data.data?.link) {
    return {
      ok: true,
      status: 201,
      reference: tx_ref,
      amount: Number(amount / 100),
      currency: "NGN",
      payment_url: data.data.link,
      meta: { customer, payment_options: "card,banktransfer" },
      raw: data,
    };
  }

  return {
    ok: false,
    status: 500,
    error: "Failed to initialize NIN payment",
    raw: data,
  };
}

export async function initializePaystackPayment({
  userId,
  email,
  amount,
}: InitializePaystackParams): Promise<PaymentInitResult> {
  const { PAYSTACK_SECRET_KEY } = process.env;

  if (!PAYSTACK_SECRET_KEY) {
    return {
      ok: false,
      status: 500,
      error: "Paystack credentials are not configured",
    };
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email,
        amount: Number(amount),
        currency: "NGN",
        metadata: {
          userId,
          purpose: "nin_verification",
        },
      }),
    },
  );

  const data = await response.json();

  if (response.ok && data.status === true && data.data?.access_code) {
    return {
      ok: true,
      status: 201,
      message: data.message,
      access_code: data.data.access_code,
      reference: data.data.reference,
      amount,
      raw: data,
    };
  }

  return {
    ok: false,
    status: 500,
    error: "Failed to initialize NIN payment",
    raw: data,
  };
}

/**
 * Confirms with Flutterwave that `reference` (our tx_ref) was paid, and that the
 * payment belongs to `expectedUserId` (the userId we sent in `meta` at init).
 */
export async function verifyFlutterwavePayment(
  reference: string,
  expectedUserId: string,
): Promise<VerificationResult> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();
  const paid =
    response.ok &&
    data.status === "success" &&
    data.data?.status === "successful";

  if (!paid) {
    return { ok: false, status: response.status, raw: data };
  }

  if (data.data?.tx_ref !== reference) {
    return {
      ok: false,
      status: 400,
      error: "Payment reference mismatch",
      raw: data,
    };
  }

  // Prefer the userId echoed back in meta. Payments made through the inline
  // modal before meta was sent from the client won't have it, so fall back to
  // the userId embedded in our server-generated tx_ref (`nin-<userId>-<ts>`).
  const metaUserId = data.data?.meta?.userId;
  const paidByUserId = metaUserId
    ? String(metaUserId)
    : /^nin-(.+)-\d+$/.exec(String(data.data?.tx_ref ?? ""))?.[1];

  if (paidByUserId !== String(expectedUserId)) {
    return {
      ok: false,
      status: 403,
      error: "Payment does not belong to this user",
      raw: data,
    };
  }

  return { ok: true, status: response.status, raw: data };
}

/**
 * Confirms with Paystack that `reference` was paid, and that the payment
 * belongs to `expectedUserId` (the userId we sent in `metadata` at init).
 */
export async function verifyPaystackPayment(
  reference: string,
  expectedUserId: string,
): Promise<VerificationResult> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();
  const paid =
    response.ok && data.status === true && data.data?.status === "success";

  if (!paid) {
    return { ok: false, status: response.status, raw: data };
  }

  if (data.data?.reference !== reference) {
    return {
      ok: false,
      status: 400,
      error: "Payment reference mismatch",
      raw: data,
    };
  }

  if (String(data.data?.metadata?.userId ?? "") !== String(expectedUserId)) {
    return {
      ok: false,
      status: 403,
      error: "Payment does not belong to this user",
      raw: data,
    };
  }

  return { ok: true, status: response.status, raw: data };
}

export type { PaymentProvider };
