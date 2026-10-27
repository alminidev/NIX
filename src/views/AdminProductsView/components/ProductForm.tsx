"use client";

import { saveProduct } from "@/app/admin/products/actions";
import {
  formatDimensionInput,
  formatDimensions,
  parseDimension,
} from "@/lib/product-dimensions";
import { productFieldLimits } from "@/lib/product-input";
import {
  productFormInitialState,
  type IAdminCategory,
  type IAdminProduct,
} from "@/types/admin-product";
import { ArrowLeft, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useRef, useState, type ReactNode } from "react";
import DeleteProductButton from "./DeleteProductButton";

interface ISpecRow {
  key: string;
  value: string;
}

interface IImageRow {
  key: string;
  url: string;
  isPrimary: boolean;
}

interface IProductFormProps {
  categories: IAdminCategory[];
  product?: IAdminProduct;
  nextSortOrder: number;
}

const fieldClass =
  "min-h-12 w-full rounded-input border border-border-hairline bg-white px-3.5 py-3 text-sm font-normal text-ink-primary focus:border-brand-blue focus:outline-2 focus:outline-offset-1 focus:outline-border-focus disabled:cursor-not-allowed disabled:opacity-70";

function controlClass(invalid: boolean) {
  return invalid ? `${fieldClass} border-[#9b1c1c]` : fieldClass;
}

function canPreview(url: string) {
  const value = url.trim();
  return (
    value.startsWith("/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

export default function ProductForm({
  categories,
  product,
  nextSortOrder,
}: IProductFormProps) {
  const [state, action, pending] = useActionState(
    saveProduct,
    productFormInitialState,
  );
  const errors = state.fieldErrors;
  const initialSpecs = product?.specifications.length
    ? product.specifications
    : [""];
  const initialImages = product?.images.length
    ? product.images
    : [{ url: "", isPrimary: true }];
  const hasInitialPrimary = initialImages.some((image) => image.isPrimary);
  const specCounter = useRef(initialSpecs.length);
  const imageCounter = useRef(initialImages.length);
  const [name, setName] = useState(product?.name ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? 0,
  );
  const [price, setPrice] = useState(product?.price ?? "");
  const [installments, setInstallments] = useState(
    product?.installments ?? "Até 3x sem juros",
  );
  const [capacity, setCapacity] = useState(product?.capacity ?? "");
  const [depth, setDepth] = useState(
    product ? formatDimensionInput(product.dimensions.depth) : "",
  );
  const [width, setWidth] = useState(
    product ? formatDimensionInput(product.dimensions.width) : "",
  );
  const [height, setHeight] = useState(
    product ? formatDimensionInput(product.dimensions.height) : "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [specs, setSpecs] = useState<ISpecRow[]>(() =>
    initialSpecs.map((value, index) => ({ key: `spec-${index}`, value })),
  );
  const [images, setImages] = useState<IImageRow[]>(() =>
    initialImages.map((image, index) => ({
      key: `image-${index}`,
      url: image.url,
      isPrimary: hasInitialPrimary ? image.isPrimary : index === 0,
    })),
  );

  const categoryName =
    categories.find((category) => category.id === categoryId)?.name ?? "";
  const primaryImage = images.find((image) => image.isPrimary) ?? images[0];
  const visibleSpecs = specs.map((spec) => spec.value.trim()).filter(Boolean);
  const parsedDepth = parseDimension(depth);
  const parsedWidth = parseDimension(width);
  const parsedHeight = parseDimension(height);
  const dimensions =
    parsedDepth !== null && parsedWidth !== null && parsedHeight !== null
      ? formatDimensions({
          depth: parsedDepth,
          width: parsedWidth,
          height: parsedHeight,
        })
      : "";
  const title = name.trim() || (product ? "Editar produto" : "Novo produto");

  function addSpec() {
    specCounter.current += 1;
    const key = `spec-${specCounter.current}`;
    setSpecs((current) => [...current, { key, value: "" }]);
  }

  function updateSpec(key: string, value: string) {
    setSpecs((current) =>
      current.map((row) => (row.key === key ? { ...row, value } : row)),
    );
  }

  function removeSpec(key: string) {
    setSpecs((current) => current.filter((row) => row.key !== key));
  }

  function addImage() {
    imageCounter.current += 1;
    const key = `image-${imageCounter.current}`;
    setImages((current) => [
      ...current,
      { key, url: "", isPrimary: current.length === 0 },
    ]);
  }

  function updateImage(key: string, url: string) {
    setImages((current) =>
      current.map((row) => (row.key === key ? { ...row, url } : row)),
    );
  }

  function setPrimary(key: string) {
    setImages((current) =>
      current.map((row) => ({ ...row, isPrimary: row.key === key })),
    );
  }

  function removeImage(key: string) {
    setImages((current) => {
      const next = current.filter((row) => row.key !== key);
      if (next.length === 0) {
        imageCounter.current += 1;
        return [
          {
            key: `image-${imageCounter.current}`,
            url: "",
            isPrimary: true,
          },
        ];
      }
      if (!next.some((row) => row.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }

  return (
    <form
      action={action}
      autoComplete="off"
      className="flex w-full flex-1 flex-col"
    >
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <header className="sticky top-0 z-20 border-b border-border-hairline bg-surface-card/95 backdrop-blur-md">
        <div className="flex w-full flex-col gap-3 px-4 py-3 min-[760px]:h-18 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between min-[760px]:px-8 min-[760px]:py-0">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin/products"
              className="grid size-10 shrink-0 place-items-center rounded-pill border border-border-hairline text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle hover:text-brand-blue-hover"
              aria-label="Voltar para produtos"
            >
              <ArrowLeft size={18} aria-hidden />
            </Link>
            <div className="min-w-0">
              <p className="text-[0.6875rem] font-bold tracking-[0.08em] text-brand-blue-hover uppercase">
                {product ? "Editar produto" : "Novo produto"}
              </p>
              <h1 className="truncate text-lg leading-tight font-semibold tracking-[-0.02em] text-ink-primary">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin/products"
              className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border-hairline bg-surface-card px-4 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending || categories.length === 0}
              className="inline-flex min-h-11 items-center justify-center rounded-pill bg-brand-blue px-5 text-sm font-medium text-ink-inverse transition-[background-color,translate] duration-200 ease-nix hover:-translate-y-px hover:bg-brand-blue-hover disabled:cursor-progress disabled:opacity-70"
            >
              {pending
                ? "Salvando…"
                : product
                  ? "Salvar alterações"
                  : "Criar produto"}
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

      <div className="grid w-full flex-1 items-start gap-6 px-4 py-6 min-[861px]:px-8 min-[861px]:py-8 min-[1280px]:grid-cols-[minmax(0,1fr)_340px] min-[1280px]:gap-8">
        <div className="order-2 flex min-w-0 flex-col gap-5 min-[1280px]:order-1">
          <Section
            index="01"
            title="Identificação"
            description="Nome, código e a posição deste modelo na vitrine."
          >
            <div className="grid gap-4 min-[760px]:grid-cols-2">
              <Field
                label="Nome"
                error={errors.name}
                errorId="name-error"
                className="min-[760px]:col-span-2"
              >
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={productFieldLimits.name}
                  disabled={pending}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className={controlClass(Boolean(errors.name))}
                />
              </Field>

              <Field label="SKU" error={errors.sku} errorId="sku-error">
                <input
                  name="sku"
                  value={sku}
                  onChange={(event) => setSku(event.target.value.toUpperCase())}
                  required
                  maxLength={productFieldLimits.sku}
                  disabled={pending}
                  spellCheck={false}
                  aria-invalid={Boolean(errors.sku)}
                  aria-describedby={errors.sku ? "sku-error" : undefined}
                  className={`${controlClass(Boolean(errors.sku))} uppercase`}
                />
              </Field>

              <Field
                label="Categoria"
                error={errors.categoryId}
                errorId="category-error"
              >
                <select
                  name="categoryId"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(Number(event.target.value))
                  }
                  required
                  disabled={pending || categories.length === 0}
                  aria-invalid={Boolean(errors.categoryId)}
                  aria-describedby={
                    errors.categoryId ? "category-error" : undefined
                  }
                  className={controlClass(Boolean(errors.categoryId))}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Ordem no catálogo"
                error={errors.sortOrder}
                errorId="sort-order-hint"
                hint={
                  errors.sortOrder
                    ? undefined
                    : "Menor número aparece primeiro."
                }
                hintId="sort-order-hint"
              >
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  max={productFieldLimits.sortOrder}
                  step={1}
                  defaultValue={product?.sortOrder ?? nextSortOrder}
                  required
                  disabled={pending}
                  aria-invalid={Boolean(errors.sortOrder)}
                  aria-describedby="sort-order-hint"
                  className={`${controlClass(Boolean(errors.sortOrder))} max-w-45`}
                />
              </Field>
            </div>
          </Section>

          <Section
            index="02"
            title="Preço e publicação"
            description="Valor exibido no card e se o modelo entra na vitrine."
          >
            <div className="grid gap-4 min-[760px]:grid-cols-2">
              <Field label="Preço" error={errors.price} errorId="price-error">
                <span className="relative block">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-ink-muted">
                    R$
                  </span>
                  <input
                    name="price"
                    inputMode="decimal"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="1.190,00"
                    required
                    disabled={pending}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={errors.price ? "price-error" : undefined}
                    className={`${controlClass(Boolean(errors.price))} pl-11`}
                  />
                </span>
              </Field>

              <Field
                label="Parcelamento"
                error={errors.installments}
                errorId="installments-error"
              >
                <input
                  name="installments"
                  value={installments}
                  onChange={(event) => setInstallments(event.target.value)}
                  required
                  maxLength={productFieldLimits.installments}
                  disabled={pending}
                  aria-invalid={Boolean(errors.installments)}
                  aria-describedby={
                    errors.installments ? "installments-error" : undefined
                  }
                  className={controlClass(Boolean(errors.installments))}
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-3 min-[760px]:grid-cols-2">
              <Toggle
                name="active"
                checked={active}
                onChange={setActive}
                disabled={pending}
                title="Publicado no catálogo"
                description="Visitantes veem este produto na vitrine."
              />
              <Toggle
                name="featured"
                checked={featured}
                onChange={setFeatured}
                disabled={pending}
                title="Destaque"
                description="Ganha o selo Mais Escolhido."
              />
            </div>
          </Section>

          <Section
            index="03"
            title="Ficha"
            description="O texto curto e as medidas que aparecem no card."
          >
            <div className="grid gap-4 min-[760px]:grid-cols-2">
              <Field
                label="Capacidade"
                error={errors.capacity}
                errorId="capacity-error"
              >
                <input
                  name="capacity"
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value)}
                  placeholder="12 filamentos"
                  required
                  maxLength={productFieldLimits.capacity}
                  disabled={pending}
                  aria-invalid={Boolean(errors.capacity)}
                  aria-describedby={
                    errors.capacity ? "capacity-error" : undefined
                  }
                  className={controlClass(Boolean(errors.capacity))}
                />
              </Field>

              <Field
                label="Dimensões (cm)"
                error={errors.dimensions}
                errorId="dimensions-error"
              >
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      name: "dimensionDepth",
                      label: "Comprimento",
                      placeholder: "46",
                      value: depth,
                      onChange: setDepth,
                    },
                    {
                      name: "dimensionWidth",
                      label: "Largura",
                      placeholder: "35",
                      value: width,
                      onChange: setWidth,
                    },
                    {
                      name: "dimensionHeight",
                      label: "Altura",
                      placeholder: "60",
                      value: height,
                      onChange: setHeight,
                    },
                  ].map((side) => (
                    <input
                      key={side.name}
                      name={side.name}
                      value={side.value}
                      onChange={(event) => side.onChange(event.target.value)}
                      placeholder={side.placeholder}
                      aria-label={`${side.label} em cm`}
                      inputMode="decimal"
                      required
                      maxLength={7}
                      disabled={pending}
                      aria-invalid={Boolean(errors.dimensions)}
                      aria-describedby={
                        errors.dimensions ? "dimensions-error" : undefined
                      }
                      className={controlClass(Boolean(errors.dimensions))}
                    />
                  ))}
                </div>
              </Field>

              <Field
                label="Descrição"
                error={errors.description}
                errorId="description-error"
                className="min-[760px]:col-span-2"
              >
                <textarea
                  name="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  rows={4}
                  maxLength={productFieldLimits.description}
                  disabled={pending}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={
                    errors.description ? "description-error" : undefined
                  }
                  className={`${controlClass(Boolean(errors.description))} min-h-28 resize-y`}
                />
              </Field>
            </div>
          </Section>

          <Section
            index="04"
            title="Especificações"
            description="Cada linha vira um item técnico no card."
          >
            <div className="flex flex-col gap-2.5">
              {specs.map((spec, index) => (
                <div key={spec.key} className="flex items-center gap-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded-pill bg-surface-canvas-fog text-xs font-bold text-ink-muted">
                    {index + 1}
                  </span>
                  <label className="sr-only" htmlFor={spec.key}>
                    Especificação {index + 1}
                  </label>
                  <input
                    id={spec.key}
                    name="specifications"
                    value={spec.value}
                    onChange={(event) =>
                      updateSpec(spec.key, event.target.value)
                    }
                    maxLength={productFieldLimits.specification}
                    disabled={pending}
                    placeholder="Capacidade, medida ou recurso"
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(spec.key)}
                    disabled={pending}
                    aria-label={`Remover especificação ${index + 1}`}
                    className="grid size-11 shrink-0 place-items-center rounded-pill border border-border-hairline text-ink-secondary transition-[background-color,color] duration-200 ease-nix hover:bg-[#fff1f1] hover:text-[#9b1c1c] disabled:opacity-70"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
            <FieldError
              id="specifications-error"
              message={errors.specifications}
            />
            <button
              type="button"
              onClick={addSpec}
              disabled={
                pending || specs.length >= productFieldLimits.specifications
              }
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-border-hairline px-3 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={16} aria-hidden />
              Adicionar especificação
            </button>
          </Section>

          <Section
            index="05"
            title="Imagens"
            description="A foto principal é a que abre o card. Use um caminho do site ou um endereço público."
          >
            <div className="grid gap-4 min-[760px]:grid-cols-2">
              {images.map((image, index) => {
                const preview = canPreview(image.url);
                return (
                  <article
                    key={image.key}
                    className={
                      image.isPrimary
                        ? "overflow-hidden rounded-card border border-[rgba(23,107,255,0.45)] bg-white"
                        : "overflow-hidden rounded-card border border-border-hairline bg-white"
                    }
                  >
                    <div className="relative grid aspect-4/3 place-items-center bg-[linear-gradient(180deg,#f7f8fa,white)]">
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url.trim()}
                          alt=""
                          className="max-h-full max-w-full object-contain p-4"
                        />
                      ) : (
                        <ImagePlus
                          size={28}
                          className="text-ink-muted"
                          aria-hidden
                        />
                      )}
                      {image.isPrimary ? (
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-pill bg-ink-primary px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-inverse uppercase">
                          <Star size={12} aria-hidden />
                          Principal
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 border-t border-border-hairline p-3">
                      <label className="sr-only" htmlFor={image.key}>
                        Imagem {index + 1}
                      </label>
                      <input
                        id={image.key}
                        name="images"
                        value={image.url}
                        onChange={(event) =>
                          updateImage(image.key, event.target.value)
                        }
                        maxLength={productFieldLimits.image}
                        disabled={pending}
                        spellCheck={false}
                        placeholder="/images/produto.jpg"
                        aria-invalid={Boolean(errors.images)}
                        className={controlClass(Boolean(errors.images))}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 text-[0.8125rem] font-semibold text-ink-secondary">
                          <input
                            type="radio"
                            name="primaryImage"
                            value={index}
                            checked={image.isPrimary}
                            onChange={() => setPrimary(image.key)}
                            disabled={pending}
                            className="size-4 accent-brand-blue"
                          />
                          Usar no card
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImage(image.key)}
                          disabled={pending}
                          aria-label={`Remover imagem ${index + 1}`}
                          className="grid size-9 place-items-center rounded-pill text-ink-secondary transition-[background-color,color] duration-200 ease-nix hover:bg-[#fff1f1] hover:text-[#9b1c1c] disabled:opacity-70"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <FieldError id="images-error" message={errors.images} />
            <button
              type="button"
              onClick={addImage}
              disabled={pending || images.length >= productFieldLimits.images}
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-pill border border-border-hairline px-3 text-sm font-semibold text-ink-primary transition-[background-color,border-color] duration-200 ease-nix hover:border-[rgba(23,107,255,0.35)] hover:bg-brand-blue-subtle disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus size={16} aria-hidden />
              Adicionar imagem
            </button>
          </Section>
        </div>

        <aside className="order-1 flex min-w-0 flex-col gap-4 min-[1280px]:sticky min-[1280px]:top-22 min-[1280px]:order-2">
          <Preview
            name={title}
            sku={sku}
            category={categoryName}
            price={price}
            installments={installments}
            capacity={capacity}
            dimensions={dimensions}
            description={description}
            image={primaryImage?.url ?? ""}
            active={active}
            featured={featured}
            specifications={visibleSpecs}
          />

          {product ? (
            <section className="rounded-card border border-[#f0c7c7] bg-[#fff8f8] p-4">
              <h2 className="text-sm font-semibold text-ink-primary">
                Excluir produto
              </h2>
              <p className="mt-1 mb-3 text-[0.8125rem] leading-relaxed text-ink-secondary">
                Remove o produto, as especificações e as imagens. Não dá para
                desfazer.
              </p>
              <DeleteProductButton id={product.id} name={product.name} />
            </section>
          ) : null}
        </aside>
      </div>
    </form>
  );
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
        <FieldError
          id={errorId ?? hintId ?? `${label}-error`}
          message={error}
        />
      ) : hint ? (
        <span
          id={hintId}
          className="text-[0.8125rem] font-normal text-ink-muted"
        >
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  disabled,
  title,
  description,
}: {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-card border border-border-hairline bg-surface-canvas-fog px-4 py-3.5">
      <span>
        <span className="block text-sm font-semibold text-ink-primary">
          {title}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] font-normal leading-snug text-ink-muted">
          {description}
        </span>
      </span>
      <span className="relative h-7 w-12 shrink-0">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span className="block h-7 w-12 rounded-pill bg-[#d5d8de] transition-colors duration-200 peer-checked:bg-brand-blue peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border-focus peer-disabled:opacity-70" />
        <span className="pointer-events-none absolute top-1 left-1 size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(10,11,14,0.18)] transition-transform duration-200 peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Preview({
  name,
  sku,
  category,
  price,
  installments,
  capacity,
  dimensions,
  description,
  image,
  active,
  featured,
  specifications,
}: {
  name: string;
  sku: string;
  category: string;
  price: string;
  installments: string;
  capacity: string;
  dimensions: string;
  description: string;
  image: string;
  active: boolean;
  featured: boolean;
  specifications: string[];
}) {
  const preview = canPreview(image);

  return (
    <section
      className="overflow-hidden rounded-card border border-border-hairline bg-surface-card shadow-card-hover"
      aria-label="Prévia da vitrine"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-hairline px-4 py-3">
        <p className="text-[0.6875rem] font-bold tracking-[0.08em] text-ink-muted uppercase">
          Prévia da vitrine
        </p>
        <span
          className={
            active
              ? "rounded-pill bg-brand-blue-subtle px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-brand-blue-hover uppercase"
              : "rounded-pill bg-surface-canvas-fog px-2 py-0.5 text-[0.6875rem] font-bold tracking-[0.04em] text-ink-muted uppercase"
          }
        >
          {active ? "Publicado" : "Oculto"}
        </span>
      </div>

      <div className={active ? "p-4" : "p-4 opacity-70"}>
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="rounded-pill bg-brand-blue-subtle px-2.5 py-1 text-xs font-semibold text-brand-blue-hover">
            {capacity.trim() || "Capacidade"}
          </span>
          {featured ? (
            <span className="rounded-pill bg-ink-primary px-2 py-1 text-[0.6875rem] font-bold tracking-wider text-ink-inverse uppercase">
              Mais Escolhido
            </span>
          ) : null}
        </div>

        <div className="mb-4 grid aspect-square place-items-center overflow-hidden rounded-input border border-black/4 bg-white">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.trim()}
              alt=""
              className="max-h-full max-w-full object-contain p-6"
            />
          ) : (
            <ImagePlus size={32} className="text-ink-muted" aria-hidden />
          )}
        </div>

        <p className="text-[0.6875rem] font-semibold tracking-[0.04em] text-ink-muted uppercase">
          {[sku.trim(), category].filter(Boolean).join(" · ") ||
            "SKU · categoria"}
        </p>
        <h2 className="mt-1 text-xl leading-tight font-semibold tracking-[-0.02em] text-ink-primary">
          {name}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
          {description.trim() || "A descrição curta aparece aqui."}
        </p>

        {dimensions.trim() ? (
          <p className="mt-3 rounded-input bg-surface-canvas-fog px-3 py-2 text-[0.8125rem] font-semibold text-ink-primary">
            {dimensions}
          </p>
        ) : null}

        {specifications.length > 0 ? (
          <ul className="mt-3 flex list-none flex-col gap-1 border-t border-border-hairline pt-3">
            {specifications.slice(0, 4).map((spec) => (
              <li key={spec} className="text-[0.8125rem] text-ink-secondary">
                {spec}
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-4 text-[1.35rem] font-bold tracking-[-0.03em] text-ink-primary">
          {price.trim() ? `R$ ${price.trim()}` : "R$ —"}
        </p>
        <p className="text-[0.8125rem] text-ink-muted">
          {installments.trim() || "Parcelamento"}
        </p>
      </div>
    </section>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-[0.8125rem] font-normal text-[#9b1c1c]">
      {message}
    </span>
  );
}
