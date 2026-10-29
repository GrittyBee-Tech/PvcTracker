export interface NinVerificationResponse {
  isSystemError: boolean;
  success: boolean;
  message: string;
  code?: string | number;
  summary?: { verified: boolean };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
}

export async function verifyNIN(
  id_number: string,
): Promise<NinVerificationResponse> {
  const apiKey = process.env.LUMIID_SECRET_KEY;
  console.info("LUMIID API KEY:", apiKey);

  if (!apiKey) {
    console.error(
      "LUMIID ERROR: Missing LUMIID_SECRET_KEY environment variable",
    );
    return {
      isSystemError: true,
      success: false,
      message:
        "NIN verification service is currently misconfigured. Please contact support.",
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  try {
    const response = await fetch("https://api.lumiid.com/v1/ng/nin-basic/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nin: id_number }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(
      `LUMIID RESPONSE: Status ${response.status} ${response.statusText}.`,
    );

    // Differentiate system errors (5xx server errors, 429 rate limits) from identity verification results
    if (response.status >= 500 || response.status === 429) {
      console.error(
        `LUMIID HTTP SYSTEM ERROR: Status ${response.status} ${response.statusText}`,
      );
      return {
        isSystemError: true,
        success: false,
        code: response.status,
        message:
          "The identity verification service is temporarily unavailable. Please try again in a few moments.",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json().catch(() => null);
    console.info("LUMIID RESPONSE DATA:", data);

    if (!data) {
      return {
        isSystemError: true,
        success: false,
        message:
          "Unable to read response from the identity verification provider. Please try again.",
      };
    }

    return {
      isSystemError: false,
      success: Boolean(data.success && data.summary?.verified),
      summary: data.summary,
      data: data.data,
      message:
        data.message ||
        (data.success
          ? "NIN verified successfully"
          : "NIN verification unsuccessful"),
      code: data.code,
      raw: data,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    const isTimeout =
      error?.name === "AbortError" ||
      error?.message?.toLowerCase().includes("timeout") ||
      error?.message?.toLowerCase().includes("aborted");

    console.error(
      "LUMIID FETCH ERROR:",
      isTimeout ? "Request timed out" : error,
    );

    return {
      isSystemError: true,
      success: false,
      message: isTimeout
        ? "Verification request timed out. The identity service is experiencing delays. Please try again shortly."
        : "Network error connecting to the verification service. Please try again in a few moments.",
    };
  }
}
