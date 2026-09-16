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
          Refund Policy: NIN Verification Services
        </p>

        <ol className="list-decimal space-y-4 pl-5">
          <li className="pl-1">
            <p className="font-semibold">All Sales Are Final</p>
            <p className="mt-1">
              Because verification fees are paid immediately to third-party
              validation providers upon submission, all fees on PVC Tracker are
              strictly non-refundable.
            </p>
            <p className="mt-2">We cannot offer refunds for:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Invalid or &ldquo;not found&rdquo; NIN results</li>
              <li>User typos or incorrect digits</li>
              <li>Network disruptions after submission</li>
              <li>Dissatisfaction with the result</li>
            </ul>
          </li>

          <li className="pl-1">
            <p className="font-semibold">Exceptions</p>
            <p className="mt-1">
              Refunds are considered only if a transaction was successful but a
              platform system error prevented the verification from processing
              entirely. Contact our support team with your payment reference if
              this occurs.
            </p>
          </li>

          <li className="pl-1">
            <p className="font-semibold">User Responsibility</p>
            <p className="mt-1">
              Please double-check your NIN before submitting. Once processed,
              transactions cannot be reversed.
            </p>
          </li>
        </ol>
      </div>

      <Checkbox
        id={id}
        name={id}
        checked={agreed}
        disabled={disabled}
        onChange={onAgreedChange}
        label={
          <>
            I understand that all PVC Tracker NIN verification fees are
            non-refundable, except where a platform system error prevents
            verification from processing entirely, and I agree to proceed.
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
