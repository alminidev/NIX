import {
  maskDocument,
  type TCustomerKind,
} from "@/lib/tax-id";
import type { ReactNode } from "react";

const fieldClass =
  "min-h-11 w-full min-w-0 rounded-input border bg-white px-3 text-[0.9375rem] text-ink-primary placeholder:text-ink-muted disabled:opacity-60";

function fieldBorder(invalid: boolean) {
  return invalid ? "border-[#9b1c1c]" : "border-border-hairline";
}

const kindOptions: { value: TCustomerKind; label: string }[] = [
  { value: "PERSON", label: "Pessoa física" },
  { value: "COMPANY", label: "Empresa" },
];

export function customerNameLabel(kind: "" | TCustomerKind) {
  return kind === "COMPANY" ? "Razão social" : "Nome completo";
}

interface ICustomerDocumentFieldsProps {
  idPrefix: string;
  kind: "" | TCustomerKind;
  document: string;
  kindError?: string;
  documentError?: string;
  disabled?: boolean;
  onKindChange: (kind: TCustomerKind) => void;
  onDocumentChange: (value: string) => void;
  /** Nome ou razão social, entre a escolha do tipo e o documento */
  children?: ReactNode;
}

/**
 * Escolha entre pessoa física e empresa e o documento correspondente.
 * Pessoa física informa CPF; empresa informa CNPJ.
 */
export default function CustomerDocumentFields({
  idPrefix,
  kind,
  document,
  kindError,
  documentError,
  disabled = false,
  onKindChange,
  onDocumentChange,
  children,
}: ICustomerDocumentFieldsProps) {
  const documentLabel = kind === "COMPANY" ? "CNPJ" : "CPF";
  const kindErrorId = `${idPrefix}-customerKind-error`;
  const documentErrorId = `${idPrefix}-document-error`;

  return (
    <>
      <fieldset
        className="sm:col-span-2"
        aria-invalid={Boolean(kindError)}
        aria-describedby={kindError ? kindErrorId : undefined}
      >
        <legend className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary">
          Tipo de cliente
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {kindOptions.map((option) => {
            const id = `${idPrefix}-customerKind-${option.value}`;
            const checked = kind === option.value;

            return (
              <label
                key={option.value}
                htmlFor={id}
                className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-input border px-3 ${checked ? "border-brand-blue bg-brand-blue-subtle" : "border-border-hairline bg-white"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <input
                  id={id}
                  type="radio"
                  name="customerKind"
                  value={option.value}
                  checked={checked}
                  onChange={() => onKindChange(option.value)}
                  disabled={disabled}
                  className="size-4 shrink-0 accent-brand-blue"
                />
                <span className="text-sm font-semibold text-ink-primary">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
        {kindError ? (
          <p id={kindErrorId} className="mt-1.5 text-xs text-[#9b1c1c]">
            {kindError}
          </p>
        ) : null}
      </fieldset>

      {children}

      <div className="sm:col-span-2">
        <label
          htmlFor={`${idPrefix}-document`}
          className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-secondary"
        >
          {kind ? documentLabel : "CPF ou CNPJ"}
        </label>
        <input
          id={`${idPrefix}-document`}
          name="document"
          value={document}
          onChange={(event) => {
            if (!kind) return;
            onDocumentChange(maskDocument(kind, event.target.value));
          }}
          inputMode={kind === "COMPANY" ? "text" : "numeric"}
          autoComplete="off"
          autoCapitalize={kind === "COMPANY" ? "characters" : "off"}
          spellCheck={false}
          placeholder={
            kind === "COMPANY"
              ? "00.000.000/0000-00"
              : kind === "PERSON"
                ? "000.000.000-00"
                : "Selecione o tipo de cliente"
          }
          maxLength={kind === "COMPANY" ? 18 : 14}
          disabled={disabled || !kind}
          aria-invalid={Boolean(documentError)}
          aria-describedby={documentError ? documentErrorId : undefined}
          className={`${fieldClass} ${fieldBorder(Boolean(documentError))}`}
        />
        {documentError ? (
          <p id={documentErrorId} className="mt-1.5 text-xs text-[#9b1c1c]">
            {documentError}
          </p>
        ) : null}
      </div>
    </>
  );
}
