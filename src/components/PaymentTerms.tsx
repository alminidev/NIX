import {
  cardInstallmentsLabel,
  interestDisclosure,
  pixDiscountLabel,
} from "@/lib/payment-terms";

/**
 * Texto do CDC: desconto no Pix, parcelas sem juros e juros da operadora
 * a partir de 4x, que o checkout mostra antes do pagamento.
 */
export default function PaymentTerms({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-xs leading-[1.5] text-ink-secondary ${className}`}>
      <span className="font-semibold text-ink-primary">{pixDiscountLabel()}</span>
      {" e "}
      <span className="font-semibold text-ink-primary">{cardInstallmentsLabel()}</span>{`. ${interestDisclosure()} O desconto do Pix vale só para os produtos.`}
    </p>
  );
}
