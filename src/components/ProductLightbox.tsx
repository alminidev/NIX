"use client";

import type { IProduct } from "@/types/product";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ProductLightboxProps {
  product: IProduct | null;
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

/**
 * ProductLightbox — Componente acessível de ampliação de imagem (Lightbox).
 *
 * Características Técnicas:
 * - Acessibilidade WCAG 2.1 AA: role="dialog", aria-modal="true", focus trap,
 *   foco devolvido ao fechamento, botões com aria-label descritivo.
 * - Teclado: Escape fecha, Setas Esquerda/Direita navegam entre fotos.
 * - Trava de rolagem no body (overflow: hidden) enquanto aberto.
 * - Mobile: Swipe horizontal para troca de fotos e suporte a pinça (pinch-to-zoom).
 * - Desktop: Botões anterior/próxima, indicador de paginação e fechar com Esc / clique externo.
 * - Respeita prefers-reduced-motion (sem animações nesse modo).
 */
export default function ProductLightbox({
  product,
  isOpen,
  onClose,
  initialIndex = 0,
}: ProductLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Gestos de toque (Touch & Pinch)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const pinchStartDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Lista de imagens do produto (se não houver galeria, usa a imagem principal)
  const fotos: string[] = product
    ? product.images && product.images.length > 0
      ? product.images
      : [product.image]
    : [];

  const temMultiplasFotos = fotos.length > 1;

  // Montagem no cliente para suporte a createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincroniza índice ao abrir
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Navegação
  const proximaFoto = useCallback(() => {
    if (!temMultiplasFotos) return;
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev + 1) % fotos.length);
  }, [temMultiplasFotos, fotos.length]);

  const fotoAnterior = useCallback(() => {
    if (!temMultiplasFotos) return;
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
  }, [temMultiplasFotos, fotos.length]);

  // Gerenciamento de foco e trava de rolagem
  useEffect(() => {
    if (!isOpen) return;

    // Guarda o elemento de origem para devolver o foco
    previousActiveElement.current =
      document.activeElement as HTMLElement | null;

    // Trava de rolagem do body
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Move o foco para dentro do modal
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      previousActiveElement.current?.focus();
    };
  }, [isOpen]);

  // Teclado (Escape, Setas e Focus Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowRight" && temMultiplasFotos) {
        e.preventDefault();
        proximaFoto();
        return;
      }

      if (e.key === "ArrowLeft" && temMultiplasFotos) {
        e.preventDefault();
        fotoAnterior();
        return;
      }

      // Focus trap
      if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, proximaFoto, fotoAnterior, temMultiplasFotos]);

  // Manipuladores de Toque Mobile (Swipe e Pinça)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Início do pinch-to-zoom
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const distance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY,
      );
      pinchStartDistanceRef.current = distance;
      initialScaleRef.current = zoomScale;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      panStartRef.current = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistanceRef.current !== null) {
      // Executa o pinch-to-zoom (limitado entre 1x e 2.5x para preservar nitidez)
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const currentDistance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY,
      );
      const ratio = currentDistance / pinchStartDistanceRef.current;
      const newScale = Math.min(
        Math.max(initialScaleRef.current * ratio, 1),
        2.5,
      );
      setZoomScale(newScale);
    } else if (e.touches.length === 1 && zoomScale > 1 && panStartRef.current) {
      // Pan quando a imagem está com zoom
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - panStartRef.current.x,
        y: touch.clientY - panStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (pinchStartDistanceRef.current !== null && e.touches.length < 2) {
      pinchStartDistanceRef.current = null;
      if (zoomScale <= 1.05) {
        setZoomScale(1);
        setPanOffset({ x: 0, y: 0 });
      }
    }

    if (touchStartRef.current && zoomScale === 1 && e.touches.length === 0) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const duration = Date.now() - touchStartRef.current.time;

      // Se foi um swipe horizontal rápido (mínimo 45px de deslocamento e pouco movimento vertical)
      if (
        Math.abs(deltaX) > 45 &&
        Math.abs(deltaY) < 60 &&
        duration < 500 &&
        temMultiplasFotos
      ) {
        if (deltaX < 0) {
          proximaFoto();
        } else {
          fotoAnterior();
        }
      }
      touchStartRef.current = null;
      panStartRef.current = null;
    }
  };

  // Alterna zoom com duplo clique
  const handleDoubleClick = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      setZoomScale(1.8);
    }
  };

  if (!mounted || !isOpen || !product) return null;

  const currentFoto = fotos[currentIndex] || product.image;
  const altText = `${product.name} — Foto ampliada ${currentIndex + 1} de ${fotos.length}`;

  const lightboxContent = (
    <div
      ref={dialogRef}
      className="nix-lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Visualização ampliada de ${product.name}`}
      onClick={(e) => {
        // Fecha ao clicar no backdrop (fora da imagem ou controles)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="nix-lightbox-header">
        <div className="nix-lightbox-info">
          <span className="nix-lightbox-title">{product.name}</span>
          {temMultiplasFotos && (
            <span className="nix-lightbox-counter">
              {currentIndex + 1} / {fotos.length}
            </span>
          )}
        </div>

        <button
          ref={closeButtonRef}
          type="button"
          className="nix-lightbox-close-btn"
          onClick={onClose}
          aria-label="Fechar ampliação da imagem (ou pressione Esc)"
        >
          <X size={24} aria-hidden />
        </button>
      </div>

      <div
        className="nix-lightbox-stage"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {temMultiplasFotos && (
          <button
            type="button"
            className="nix-lightbox-nav-btn prev"
            onClick={(e) => {
              e.stopPropagation();
              fotoAnterior();
            }}
            aria-label="Foto anterior (ou pressione Seta Esquerda)"
          >
            <ChevronLeft size={28} strokeWidth={2.5} aria-hidden />
          </button>
        )}

        <div className="nix-lightbox-image-wrapper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentFoto}
            alt={altText}
            className="nix-lightbox-image"
            style={{
              transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
              cursor: zoomScale > 1 ? "grab" : "zoom-in",
            }}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />
        </div>

        {temMultiplasFotos && (
          <button
            type="button"
            className="nix-lightbox-nav-btn next"
            onClick={(e) => {
              e.stopPropagation();
              proximaFoto();
            }}
            aria-label="Próxima foto (ou pressione Seta Direita)"
          >
            <ChevronRight size={28} strokeWidth={2.5} aria-hidden />
          </button>
        )}
      </div>

      {temMultiplasFotos && (
        <div
          className="nix-lightbox-dots"
          role="tablist"
          aria-label="Fotos do produto"
        >
          {fotos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`nix-lightbox-dot ${i === currentIndex ? "active" : ""}`}
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
                setCurrentIndex(i);
              }}
              aria-label={`Ir para a foto ${i + 1} de ${fotos.length}`}
              aria-selected={i === currentIndex}
            />
          ))}
        </div>
      )}

      {/* Dica de navegação e atalhos */}
      <div className="nix-lightbox-footer-hint" aria-hidden="true">
        <span>Toque duas vezes ou pinça para zoom</span>
        {temMultiplasFotos && <span>• Deslize para trocar de foto</span>}
        <span>• Esc para fechar</span>
      </div>
    </div>
  );

  return createPortal(lightboxContent, document.body);
}
