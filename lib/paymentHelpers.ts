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
  raw?: unknown;
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

export async function verifyFlutterwavePayment(
  reference: string,
): Promise<VerificationResult> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();

  return {
    ok:
      response.ok &&
      data.status === "success" &&
      data.data?.status === "successful",
    status: response.status,
    raw: data,
  };
}

export async function verifyPaystackPayment(
  reference: string,
): Promise<VerificationResult> {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  const data = await response.json();

  return {
    ok: response.ok && data.status === true && data.data?.status === "success",
    status: response.status,
    raw: data,
  };
}

export type { PaymentProvider };
