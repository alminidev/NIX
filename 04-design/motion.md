# Motion Design & Microinterações — NIX

## 1. Princípio de Movimento
O motion design da NIX segue a estética de **precisão mecânica e resposta tátil**. Não usamos animações lúdicas, elásticas ou lentas que atrasem a decisão de compra.

- **Cadência:** Resposta instantânea (entre 150ms e 250ms).
- **Curva de Aceleração Obrigatória:** `cubic-bezier(0.16, 1, 0.3, 1)` (curva com ataque rápido e desaceleração suave, comum em interfaces de hardware de alta tecnologia).

---

## 2. Microinterações Especificadas

### A. Botões de Compra (`.btn-buy` / `.btn-primary`)
- **Propriedades:** `background-color`, `transform`, `box-shadow`.
- **Duração:** `200ms`.
- **Curva:** `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Comportamento:**
  - *Hover:* O fundo muda de `#176bff` para `#0d57db`, com elevação física sutil de `translateY(-1px)`.
  - *Active:* Retorna a `translateY(0)` simulando um botão físico de máquina.

### B. Cards de Produtos (`.product-card`)
- **Propriedades:** `transform`, `box-shadow`.
- **Duração:** `250ms`.
- **Comportamento:**
  - *Hover:* Sutil elevação de `translateY(-3px)` e projeção de sombra suave `0 12px 32px rgba(0, 0, 0, 0.06)`, destacando o card selecionado.

### C. Acordeão de FAQ (`.faq-item`)
- **Propriedades:** `transform` no ícone chevron e `opacity`/`max-height` no conteúdo.
- **Duração:** `200ms`.
- **Comportamento:**
  - Ao expandir, o ícone chevron gira `180deg` de forma suave.

### D. Scroll Suave Interno (Âncoras)
- **Implementação:** `html { scroll-behavior: smooth; }` com compensação de offset para o cabeçalho fixo (`scroll-padding-top: 72px`).

---

## 3. Conformidade Estrita com Acessibilidade (Reduced Motion)
Para usuários que tenham ativado a preferência de redução de movimento no sistema operacional:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
