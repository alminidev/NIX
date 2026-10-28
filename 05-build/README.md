# Guia de Entrega Front-end — Site NIX 3D

Bem-vindo! Este projeto é o front-end oficial da landing page de vitrine da **NIX 3D**, desenvolvido exclusivamente com **HTML5, CSS3 puro e JavaScript Vanilla (sem frameworks, sem build tools e sem dependências)**.

---

## 1. Estrutura de Pastas e Arquivos

```
05-build/
├── index.html          # Estrutura semântica principal da página
├── README.md           # Este manual de integração
├── css/
│   └── style.css       # Todas as regras de design, variáveis :root e responsividade
├── js/
│   ├── produtos.js     # Catálogo de dados dos 5 produtos e URL central do checkout
│   └── main.js         # Lógica de renderização dos cards e interações de UI
└── images/             # Ativos reais de imagem da NIX
    ├── logo-nix.png
    ├── hero-showroom.jpg
    ├── dry-box-12.jpg
    ├── dry-box-24.jpg
    ├── dry-box-48.png
    ├── setup-lab-a1.png
    └── setup-lab-a2.png
```

---

## 2. Onde Trocar a URL de Checkout / Carrinho (InfinitePay)

Você só precisa alterar a URL em **UM ÚNICO LUGAR**:

1. Abra o arquivo [`js/produtos.js`](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/produtos.js).
2. Na linha 11, altere o valor da constante:
   ```javascript
   const CHECKOUT_BASE_URL = 'https://checkout.infinitepay.io/nix3d';
   ```
3. Automaticamente:
   - O botão **"Carrinho"** do cabeçalho receberá essa URL.
   - O botão **"Ir para Checkout"** no Hero receberá essa URL.
   - Cada botão **"Comprar"** nos cards de produtos receberá essa URL acrescida dos parâmetros do SKU (`?sku=NIX-DB12&id=1`).

---

## 3. Onde Editar Produtos, Preços, Descrições e Imagens

Todos os produtos são gerenciados centralizadamente no mesmo arquivo [`js/produtos.js`](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/js/produtos.js), dentro do array `PRODUTOS_NIX`.

Para alterar o preço ou informações de um produto:
```javascript
{
  id: 1,
  sku: 'NIX-DB12',
  nome: 'DRY BOX 12',
  categoria: 'Armários Dry Box',
  capacidade: '12 filamentos',
  dimensoes: '46 x 35 x 60 cm',
  preco: 1190.00,
  precoFormatado: 'R$ 1.190,00', // Preço exibido no card
  parcelamento: 'Até 3x sem juros',
  descricao: 'Compacta e eficiente para o seu dia a dia.',
  imagem: 'images/dry-box-12.jpg'
}
```
Não é necessário editar o arquivo `index.html` para alterar produtos; o JavaScript gera o HTML dos cards dinamicamente.

---

## 4. Onde Customizar Cores e Tipografia

Todas as cores da interface utilizam variáveis CSS nativas no topo de [`css/style.css`](file:///c:/Users/Pichau/OneDrive/Documentos/AI-CREATIVE-AGENCY-ANTIGRAVITY/Projetos/Site%20NIX/05-build/css/style.css):

```css
:root {
  --color-brand-blue: #176bff;        /* Azul de ação dos botões e foco */
  --color-brand-blue-hover: #0d57db;  /* Hover do botão */
  --color-ink-primary: #0a0b0e;       /* Títulos e textos de alto contraste */
  --color-surface-canvas-fog: #f4f5f7;/* Cor de fundo da vitrine */
}
```

---

## 5. Como Abrir e Testar Localmente

Como não há Node.js, Webpack ou Vite:
1. Basta dar um duplo clique diretamente em `index.html` em qualquer navegador (Chrome, Edge, Firefox, Safari).
2. Ou abrir com a extensão **Live Server** no VS Code.

---

## 6. Como Fazer o Deploy

Basta enviar todos os arquivos e pastas da pasta `05-build/` para qualquer servidor web estático (Apache, Nginx, Vercel, Netlify, Cloudflare Pages, GitHub Pages ou hospedagem cPanel/FTP). Não há comando de build (`npm run build`) necessário.
