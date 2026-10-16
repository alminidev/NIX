# Manual de Handoff & Manutenção — NIX 3D (`/ship`)

Este documento reúne todas as orientações práticas para a manutenção, atualização de catálogo e publicação do website da **NIX 3D**.

---

## 1. Visão Geral da Arquitetura

O projeto foi construído propositalmente sem dependências externas complexas, frameworks pesados ou ferramentas de build (sem npm, Webpack, Vite ou Tailwind). Toda a aplicação funciona como **Vanilla HTML5, CSS3 Moderno e JavaScript ES6+**, permitindo abertura imediata no navegador e publicação instantânea em qualquer servidor estático.

### Estrutura de Arquivos da Entrega (`05-build/`):

```
05-build/
├── index.html          # Estrutura principal da Landing Page
├── 404.html            # Página de erro personalizada
├── README.md           # Guia rápido da pasta de build
├── css/
│   └── style.css       # Design System completo e tokens em Vanilla CSS
├── js/
│   ├── produtos.js     # Catálogo centralizado e URL de checkout (InfinitePay)
│   └── main.js         # Lógica de renderização, ScrollSpy e sticky header
└── images/             # Imagens otimizadas dos produtos e showroom
    ├── logo-nix.png
    ├── hero-showroom.jpg
    ├── dry-box-12.jpg
    ├── dry-box-24.jpg
    ├── dry-box-48.png
    ├── setup-lab-a1.png
    └── setup-lab-a2.png
```

---

## 2. Como Fazer Manutenções Comuns

### 2.1 Alterar a URL do Checkout (InfinitePay)
Para trocar o link geral de checkout ou direcionar para um novo gateway, abra o arquivo [produtos.js](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/produtos.js) na linha 10:

```javascript
// URL base externa de checkout / carrinho (InfinitePay)
const CHECKOUT_BASE_URL = 'https://checkout.infinitepay.io/nix3d';
```
Basta alterar este valor. Todos os botões "Comprar" dos cards, o botão "Carrinho" do topo e o botão da Hero serão atualizados automaticamente.

---

### 2.2 Alterar Preços, Medidas ou Adicionar Produtos
Todas as informações dos produtos ficam isoladas no array `PRODUTOS_NIX` dentro de [produtos.js](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/produtos.js).

Exemplo de estrutura de um produto:
```javascript
{
  id: 1,
  sku: 'NIX-DB12',
  nome: 'DRY BOX 12',
  categoria: 'Armários Dry Box',
  capacidade: '12 filamentos',
  dimensoes: '46 x 35 x 60 cm',
  preco: 1190.00,
  precoFormatado: 'R$ 1.190,00',
  parcelamento: 'Até 3x sem juros',
  descricao: 'Compacta e eficiente para o seu dia a dia.',
  especificacoes: [
    'Capacidade: 12 filamentos',
    'Dimensões (C x L x A): 46 x 35 x 60 cm',
    'Controle térmico ativo permanente < 20% UR',
    'Display digital de temperatura e umidade'
  ],
  imagem: 'images/dry-box-12.jpg',
  destaque: false // se true, exibe a tag "Mais Escolhido"
}
```
> **Dica:** Para alterar o preço ou o parcelamento, altere os campos `preco`, `precoFormatado` e `parcelamento`. A interface reflete a mudança automaticamente.

---

### 2.3 Alterar o Número de WhatsApp ou Mensagem Padrão
No arquivo [index.html](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/index.html), procure pelas tags que contêm o link `wa.me`:
- Linha 41 (Botão do cabeçalho)
- Linha 189 (Card de logística)
- Linha 379 (Rodapé)

Basta substituir o número `5511999999999` pelo número de WhatsApp comercial oficial da NIX.

---

### 2.4 Alterar Cores ou Tokens de Design
Todas as cores e medidas estruturais são gerenciadas através de **CSS Custom Properties** no início de [style.css](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/css/style.css):

```css
:root {
  --color-brand-blue: #176bff;         /* Azul principal NIX */
  --color-brand-blue-hover: #0d57db;   /* Hover dos botões */
  --color-brand-blue-subtle: #edf3ff;  /* Fundo de badges */
  --color-ink-primary: #0a0b0e;        /* Preto de texto e títulos */
  --color-surface-hero-void: #0a0b0e;  /* Fundo escuro do Hero Stage */
  --color-surface-canvas-fog: #f4f5f7; /* Fundo cinza suave das seções */
}
```

---

## 3. Instruções de Publicação (Deploy)

Como o projeto é 100% estático, ele pode ser hospedado em qualquer plataforma em segundos:

### Opção 1: Vercel / Netlify / Cloudflare Pages (Recomendado)
1. Conecte o repositório no painel da plataforma.
2. Defina o **Root Directory** como `05-build`.
3. Deixe o campo **Build Command** em branco.
4. Defina o **Output Directory** como `.`.
5. Clique em **Deploy**.

### Opção 2: GitHub Pages
1. No repositório do GitHub, vá em **Settings > Pages**.
2. Selecione a branch `main` e aponte para a pasta raiz onde os arquivos de `05-build` foram posicionados (ou configure um GitHub Action para publicar a pasta `05-build`).

### Opção 3: Hospedagem Tradicional (cPanel / Apache / Nginx / Hostgator / Locaweb)
1. Conecte via FTP ou Gerenciador de Arquivos do cPanel.
2. Envie todo o conteúdo interno da pasta `05-build/` para a pasta `public_html/`.
3. O site estará no ar instantaneamente.

---

## 4. Contatos & Suporte

- **Empresa:** NIX 3D
- **Instagram:** [@nix_impressoes3d](https://instagram.com/nix_impressoes3d)
- **Localização:** São Paulo - SP
