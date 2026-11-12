"use client";

import { saveCategory } from "@/app/admin/categories/actions";
import {
  categoryFieldLimits,
  suggestCategorySlug,
} from "@/lib/category-input";
import {
  categoryFormInitialState,
  type IAdminCategoryRecord,
} from "@/types/admin-category";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";

interface ICategoryFormProps {
  category?: IAdminCategoryRecord;
  nextSortOrder: number;
}

const cardClass = "mx-auto w-full max-w-4xl px-4 min-[861px]:px-8";

const fieldClass =
  "min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 text-sm font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-not-allowed disabled:opacity-70";

function controlClass(invalid: boolean) {
  return invalid ? `${fieldClass} border-[#9b1c1c]` : fieldClass;
}

export default function CategoryForm({
  category,
  nextSortOrder,
}: ICategoryFormProps) {
  const [state, action, pending] = useActionState(
    saveCategory,
    categoryFormInitialState,
  );
  const errors = state.fieldErrors;
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const title = name.trim() || (category ? "Editar categoria" : "Nova categoria");

  function changeName(value: string) {
    setName(value);
    if (!slugTouched) setSlug(suggestCategorySlug(value));
  }

  return (
    <form action={action} className="flex w-full flex-1 flex-col">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <header className="sticky top-0 z-20 border-b border-border-hairline bg-surface-card/95 backdrop-blur-md">
        <div className="flex w-full flex-col gap-3 px-4 py-3 min-[760px]:h-18 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between min-[760px]:px-8 min-[760px]:py-0">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/categories"
              className="grid size-10 shrink-0 place-items-center rounded-pill border border-border-hairline text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
              aria-label="Voltar para categorias"
            >
              <ArrowLeft size={18} aria-hidden />
            </Link>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
                {category ? "Editar categoria" : "Nova categoria"}
              </p>
              <h1 className="truncate text-lg leading-tight font-semibold tracking-[-0.02em] text-ink-primary">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/categories"
              className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            >
              {pending
                ? "Salvando…"
                : category
                  ? "Salvar alterações"
                  : "Criar categoria"}
            </button>
          </div>
        </div>
      </header>

      {state.status === "error" ? (
        <p
          className="border-b border-[#f0c7c7] bg-[#fff1f1] px-4 py-3 text-sm text-[#9b1c1c] min-[760px]:px-8"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className={`${cardClass} py-8 min-[861px]:py-10`}>
        <Section
          index="01"
          title="Identificação"
          description={
            category
              ? usageDescription(category.productCount)
              : "Nome, identificador e a posição desta seção na vitrine."
          }
        >
          <div className="grid gap-5">
            <Field
              label="Nome"
              error={errors.name}
              errorId="category-name-error"
            >
              <input
                name="name"
                value={name}
                onChange={(event) => changeName(event.target.value)}
                required
                minLength={2}
                maxLength={categoryFieldLimits.name}
                disabled={pending}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "category-name-error" : undefined}
                className={controlClass(Boolean(errors.name))}
              />
            </Field>

            <div className="grid items-start gap-5 min-[760px]:grid-cols-[minmax(0,1fr)_12.5rem]">
              <Field
                label="Identificador"
                error={errors.slug}
                errorId="category-slug-error"
                hint={
                  errors.slug
                    ? undefined
                    : "Letras minúsculas, números e hífens. A home usa este valor na seção."
                }
                hintId="category-slug-hint"
              >
                <input
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(event.target.value.toLowerCase());
                  }}
                  required
                  minLength={2}
                  maxLength={categoryFieldLimits.slug}
                  disabled={pending}
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-invalid={Boolean(errors.slug)}
                  aria-describedby={
                    errors.slug ? "category-slug-error" : "category-slug-hint"
                  }
                  className={controlClass(Boolean(errors.slug))}
                />
              </Field>

              <Field
                label="Ordem na vitrine"
                error={errors.sortOrder}
                errorId="category-sort-error"
                hint={
                  errors.sortOrder
                    ? undefined
                    : "Menor número aparece primeiro."
                }
                hintId="category-sort-hint"
              >
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={categoryFieldLimits.sortOrder}
                  step={1}
                  defaultValue={category?.sortOrder ?? nextSortOrder}
                  required
                  disabled={pending}
                  aria-invalid={Boolean(errors.sortOrder)}
                  aria-describedby={
                    errors.sortOrder
                      ? "category-sort-error"
                      : "category-sort-hint"
                  }
                  className={controlClass(Boolean(errors.sortOrder))}
                />
              </Field>
            </div>
          </div>
        </Section>
      </div>
    </form>
  );
}

function usageDescription(count: number) {
  if (count === 0) {
    return "Nenhum produto usa esta categoria. O nome entra na vitrine quando houver produtos.";
  }
  if (count === 1) {
    return "1 produto usa esta categoria. O nome aparece na vitrine e nos produtos.";
  }
  return `${count} produtos usam esta categoria. O nome aparece na vitrine e nos produtos.`;
}

function Section({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-card border border-border-hairline bg-surface-card">
      <header className="flex items-start gap-3 border-b border-border-hairline px-5 py-4 min-[760px]:px-6">
        <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-brand-blue-subtle text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover">
          {index}
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-[-0.01em] text-ink-primary">
            {title}
          </h2>
          <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>
      </header>
      <div className="px-5 py-5 min-[760px]:px-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  errorId,
  hint,
  hintId,
  className,
  children,
}: {
  label: string;
  error?: string;
  errorId?: string;
  hint?: string;
  hintId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className ?? ""}`}>
      <span className="text-[0.8125rem] font-semibold text-ink-secondary">
        {label}
      </span>
      {children}
      {error ? (
        <span id={errorId} className="text-[0.8125rem] font-normal text-[#9b1c1c]">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-[0.8125rem] font-normal text-ink-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
