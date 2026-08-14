import Checkbox from "@/components/ui/checkbox";

export const NIN_POLICY_CONSENT_KEY = "nin-no-refund-policy-agreed";

interface NoRefundPolicyProps {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export default function NoRefundPolicy({
  agreed,
  onAgreedChange,
  disabled = false,
  id = "no-refund-agreement",
}: NoRefundPolicyProps) {
  return (
    <div className="space-y-4">
      <div className="max-h-56 space-y-3 overflow-y-auto rounded-lg border border-green-900/30 bg-green-50/40 p-4 text-sm text-primary">
        <p className="font-heading text-base font-semibold">
          No Refund Policy &mdash; NIN Verification Charges
        </p>

        <p>
          When you use PVC Tracker to verify your NIN, we pay a fixed fee to
          check it the moment you submit your request &mdash; whether the result
          comes back valid, invalid, or not found.
        </p>

        <p>
          Because we are charged this fee immediately, and it is not something
          we can get back, we cannot refund your payment once a verification
          request has been submitted &mdash; even if:
        </p>

        <ul className="list-disc space-y-1 pl-5">
          <li>Your NIN comes back invalid or &ldquo;not found&rdquo;</li>
          <li>You typed your NIN incorrectly</li>
          <li>You are not happy with the result</li>
          <li>Your internet disconnects after you hit submit</li>
        </ul>

        <p className="font-semibold">When We Will Look Into a Refund</p>

        <p>
          The only time we will look into a refund is if you were charged but
          your request never actually went through, due to an error on our end.
          If you think this happened, contact us with your payment details.
        </p>

        <p className="font-semibold">Before You Submit</p>

        <p>
          Please double-check that your NIN is correct. Once submitted, the fee
          cannot be reversed.
        </p>
      </div>

      <Checkbox
        id={id}
        name={id}
        checked={agreed}
        disabled={disabled}
        onChange={onAgreedChange}
        label={
          <>
            I understand that PVC Tracker charges a fixed, non-refundable fee
            for each NIN verification request, and I agree to proceed.
          </>
        }
      />

      <p className="text-xs text-gray-500">
        Questions about a charge?{" "}
        <a
          href="mailto:info@abenolfoundation.org"
          className="underline hover:text-primary"
        >
          info@abenolfoundation.org
        </a>{" "}
        | pvctracker.org
      </p>
    </div>
  );
}
