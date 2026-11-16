"use client";

import { Modal } from "@/components/Modal";
import ProductLightbox from "@/components/ProductLightbox";
import ProductionTimeText from "@/components/ProductionTimeText";
import ProductPurchaseActions from "@/components/ProductPurchaseActions";
import { Sheet } from "@/components/Sheet";
import { desktopMediaQuery, useMediaQuery } from "@/hooks/useMediaQuery";
import { formatDimensions } from "@/lib/product-dimensions";
import type { IProduct } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useId, useState } from "react";

interface IProductDetailProps {
  product: IProduct | null;
  onClose: () => void;
}

function productPhotos(product: IProduct): string[] {
  const gallery = product.images?.filter((src) => src.length > 0) ?? [];
  if (gallery.length > 0) return gallery;
  return product.image ? [product.image] : [];
}

function initialPhotoIndex(product: IProduct, photos: string[]): number {
  const match = photos.indexOf(product.image);
  return match >= 0 ? match : 0;
}

function ProductGallery({
  product,
  variant,
  onExpand,
}: {
  product: IProduct;
  variant: "dialog" | "sheet";
  onExpand: (index: number) => void;
}) {
  const photos = productPhotos(product);
  const [trackedId, setTrackedId] = useState(product.id);
  const [index, setIndex] = useState(() => initialPhotoIndex(product, photos));

  if (trackedId !== product.id) {
    setTrackedId(product.id);
    setIndex(initialPhotoIndex(product, productPhotos(product)));
  }

  if (photos.length === 0) {
    return (
      <div
        className={
          variant === "dialog"
            ? "h-full border-r border-border-hairline bg-surface-canvas-fog"
            : "aspect-square rounded-input border border-black/[0.03] bg-white"
        }
      />
    );
  }

  const safeIndex = Math.min(index, photos.length - 1);
  const photo = photos[safeIndex] ?? photos[0];
  const multiple = photos.length > 1;

  if (variant === "dialog") {
    return (
      <div className="flex h-full min-h-0 flex-col border-r border-border-hairline bg-surface-canvas-fog">
        <div className="relative min-h-0 flex-1">
          <button
            type="button"
            onClick={() => onExpand(safeIndex)}
            aria-label={`Ampliar foto de ${product.name}`}
            className="absolute inset-0 cursor-zoom-in bg-transparent p-0"
          >
            <Image
              src={photo}
              alt={
                multiple
                  ? `${product.name} — foto ${safeIndex + 1} de ${photos.length}`
                  : `${product.name} — Armazenamento com controle térmico para filamentos 3D`
              }
              fill
              sizes="480px"
              className="object-contain p-10"
            />
          </button>
          {multiple ? (
            <>
              <button
                type="button"
                className="absolute top-1/2 left-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-hairline bg-white text-ink-primary shadow-sticky-nav"
                onClick={() =>
                  setIndex((current) => (current - 1 + photos.length) % photos.length)
                }
                aria-label="Foto anterior"
              >
                <ChevronLeft size={20} aria-hidden />
              </button>
              <button
                type="button"
                className="absolute top-1/2 right-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-hairline bg-white text-ink-primary shadow-sticky-nav"
                onClick={() => setIndex((current) => (current + 1) % photos.length)}
                aria-label="Próxima foto"
              >
                <ChevronRight size={20} aria-hidden />
              </button>
            </>
          ) : null}
        </div>
        {multiple ? (
          <div className="flex justify-center gap-2 px-6 pb-6">
            {photos.map((src, photoIndex) => (
              <button
                key={`${src}-${photoIndex}`}
                type="button"
                onClick={() => setIndex(photoIndex)}
                aria-pressed={photoIndex === safeIndex}
                aria-label={`Mostrar foto ${photoIndex + 1} de ${photos.length}`}
                className={
                  photoIndex === safeIndex
                    ? "relative size-16 overflow-hidden rounded-input border border-brand-blue bg-white p-0"
                    : "relative size-16 overflow-hidden rounded-input border border-border-hairline bg-white p-0"
                }
              >
                <Image src={src} alt="" fill sizes="64px" className="object-contain p-1" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="relative">
        <button
          type="button"
          onClick={() => onExpand(safeIndex)}
          aria-label={`Ampliar foto de ${product.name}`}
          className={
            variant === "sheet"
              ? "relative block aspect-square w-full max-h-[min(42dvh,420px)] cursor-zoom-in overflow-hidden rounded-input border border-black/[0.03] bg-white p-0"
              : "relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-input border border-black/[0.03] bg-white p-0"
          }
        >
          <Image
            src={photo}
            alt={
              multiple
                ? `${product.name} — foto ${safeIndex + 1} de ${photos.length}`
                : `${product.name} — Armazenamento com controle térmico para filamentos 3D`
            }
            fill
            sizes="(max-width: 639px) 100vw, 280px"
            className="object-contain p-4"
          />
          {multiple ? (
            <span className="pointer-events-none absolute right-2 bottom-2 rounded-pill bg-ink-primary/80 px-2 py-0.5 text-xs font-semibold text-ink-inverse">
              {safeIndex + 1} / {photos.length}
            </span>
          ) : null}
        </button>

        {multiple ? (
          <>
            <button
              type="button"
              className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-hairline bg-white/95 text-ink-primary shadow-sticky-nav"
              onClick={() =>
                setIndex((current) => (current - 1 + photos.length) % photos.length)
              }
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-hairline bg-white/95 text-ink-primary shadow-sticky-nav"
              onClick={() => setIndex((current) => (current + 1) % photos.length)}
              aria-label="Próxima foto"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {multiple ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((src, photoIndex) => (
            <button
              key={`${src}-${photoIndex}`}
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-pressed={photoIndex === safeIndex}
              aria-label={`Mostrar foto ${photoIndex + 1} de ${photos.length}`}
              className={
                photoIndex === safeIndex
                  ? "relative size-14 overflow-hidden rounded-input border border-brand-blue bg-white p-0"
                  : "relative size-14 overflow-hidden rounded-input border border-border-hairline bg-white p-0"
              }
            >
              <Image src={src} alt="" fill sizes="56px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductDetailContent({
  product,
  titleId,
  variant,
  onClose,
  onExpand,
}: {
  product: IProduct;
  titleId: string;
  variant: "dialog" | "sheet";
  onClose: () => void;
  onExpand: (index: number) => void;
}) {
  if (variant === "dialog") {
    return (
      <div className="grid h-[min(88dvh,640px)] grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <ProductGallery product={product} variant={variant} onExpand={onExpand} />

        <div className="flex min-h-0 flex-col">
          <div className="relative px-7 pt-6">
            <Modal.Close
              onClose={onClose}
              showOnMobile
              className="absolute top-5 right-5"
            />
            <div className="pr-10">
              <p className="text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
                {product.category}
              </p>
              <h2
                id={titleId}
                className="mt-1 text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink-primary"
              >
                {product.name}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-pill bg-brand-blue-subtle px-2.5 py-1 text-xs font-semibold text-brand-blue-hover">
                  {product.capacity}
                </span>
                {product.featured ? (
                  <span className="rounded-pill bg-ink-primary px-2 py-1 text-[0.6875rem] font-bold tracking-[0.05em] text-ink-inverse uppercase">
                    Mais Escolhido
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-border-hairline pt-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.04em] text-ink-muted uppercase">
                  Preço à vista
                </p>
                <p className="mt-1 text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-ink-primary">
                  {product.formattedPrice}
                </p>
              </div>
              <span className="mb-1 rounded-pill bg-brand-blue-subtle px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-brand-blue-hover">
                {product.installments}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-5">
            {product.description.trim() ? (
              <p className="text-[0.9375rem] leading-[1.6] whitespace-pre-wrap text-ink-secondary">
                {product.description}
              </p>
            ) : null}

            {product.specifications.length === 0 ? (
              <div className="mt-4 flex flex-col gap-0.5 rounded-input border border-border-hairline bg-surface-canvas-fog px-3 py-2">
                <span className="text-[0.6875rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
                  Dimensões (C x L x A)
                </span>
                <span className="text-[0.8125rem] font-semibold text-ink-primary">
                  {formatDimensions(product.dimensions)}
                </span>
              </div>
            ) : null}

            {product.specifications.length > 0 ? (
              <ul className="mt-4 list-none border-t border-border-hairline pt-3.5">
                {product.specifications.map((spec, specIndex) => (
                  <li
                    key={specIndex}
                    className="mb-1.5 flex items-start gap-2 text-[0.8125rem] leading-[1.4] text-ink-muted before:font-bold before:text-brand-blue before:content-['•']"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
            ) : null}

            <ProductionTimeText
              text={product.productionTimeText}
              className="mt-4"
            />
          </div>

          <div className="border-t border-border-hairline px-7 py-4">
            <ProductPurchaseActions product={product} chrome="actions" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-11 z-30 h-0">
        <div className="flex justify-end px-3 pt-3">
          <Modal.Close
            onClose={onClose}
            showOnMobile
            className="bg-surface-card shadow-sticky-nav"
          />
        </div>
      </div>

      <div className="px-6 pt-1 pb-6">
        <div className="grid items-start gap-5 sm:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] sm:gap-6">
          <ProductGallery product={product} variant={variant} onExpand={onExpand} />

          <div className="min-w-0 sm:pr-12">
            <p className="text-xs font-bold tracking-[0.06em] text-brand-blue-hover uppercase">
              {product.category}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-xl leading-[1.25] font-semibold tracking-[-0.01em] text-ink-primary"
            >
              {product.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-pill bg-brand-blue-subtle px-2.5 py-1 text-xs font-semibold text-brand-blue-hover">
                {product.capacity}
              </span>
              {product.featured ? (
                <span className="rounded-pill bg-ink-primary px-2 py-1 text-[0.6875rem] font-bold tracking-[0.05em] text-ink-inverse uppercase">
                  Mais Escolhido
                </span>
              ) : null}
            </div>

            <div className="mt-4">
              <ProductPurchaseActions
                product={product}
                between={
                  <>
                    {product.description.trim() ? (
                      <div>
                        <h3 className="text-xs font-semibold tracking-[0.05em] text-ink-muted uppercase">
                          Descrição
                        </h3>
                        <p className="mt-1.5 text-[0.9375rem] leading-[1.55] whitespace-pre-wrap text-ink-secondary">
                          {product.description}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-0.5 rounded-input border border-border-hairline bg-surface-canvas-fog px-3 py-2">
                      <span className="text-[0.6875rem] font-semibold tracking-[0.05em] text-ink-muted uppercase">
                        Dimensões (C x L x A)
                      </span>
                      <span className="text-[0.8125rem] font-semibold text-ink-primary">
                        {formatDimensions(product.dimensions)}
                      </span>
                    </div>

                    <ProductionTimeText text={product.productionTimeText} />

                    {product.specifications.length > 0 ? (
                      <ul className="list-none border-t border-border-hairline pt-3.5">
                        {product.specifications.map((spec, specIndex) => (
                          <li
                            key={specIndex}
                            className="mb-1.5 flex items-start gap-2 text-[0.8125rem] leading-[1.4] text-ink-muted before:font-bold before:text-brand-blue before:content-['•']"
                          >
                            {spec}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Detalhe do produto. Desktop abre um diálogo centralizado;
 * mobile abre um sheet. O miolo é o mesmo nos dois.
 */
export default function ProductDetail({ product, onClose }: IProductDetailProps) {
  const isDesktop = useMediaQuery(desktopMediaQuery);
  const titleId = useId();
  const [shown, setShown] = useState(product);
  if (product !== null && product !== shown) {
    setShown(product);
  }

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const productId = product?.id ?? null;
  const [trackedId, setTrackedId] = useState(productId);
  const close = useCallback(() => {
    setExpandedIndex(null);
    onClose();
  }, [onClose]);

  if (trackedId !== productId) {
    setTrackedId(productId);
    setExpandedIndex(null);
  }

  if (!shown) return null;

  const lightboxOpen = expandedIndex !== null && product !== null;
  const content = (
    <ProductDetailContent
      product={shown}
      titleId={titleId}
      variant={isDesktop ? "dialog" : "sheet"}
      onClose={close}
      onExpand={setExpandedIndex}
    />
  );

  return (
    <>
      {isDesktop ? (
        <Modal
          open={product !== null}
          onClose={close}
          labelledBy={titleId}
          placement="center"
          size="wide"
          clip
          abovePageChrome
          suspended={lightboxOpen}
        >
          {content}
        </Modal>
      ) : (
        <Sheet
          open={product !== null}
          onClose={close}
          labelledBy={titleId}
          suspended={lightboxOpen}
        >
          {content}
        </Sheet>
      )}

      <ProductLightbox
        product={shown}
        isOpen={lightboxOpen}
        initialIndex={expandedIndex ?? 0}
        onClose={() => setExpandedIndex(null)}
      />
    </>
  );
}
