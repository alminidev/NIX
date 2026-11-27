import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PageSizes,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import {
  orderPdfPaymentOptions,
  type IOrderPdfModel,
  type TOrderPdfPayment,
} from "@/lib/order-pdf";

/**
 * Arimo é a família métrica da Arial, em licença aberta. O PDF do modelo
 * saiu do Excel com Arial, que não pode ser redistribuída.
 */
const fontPaths = {
  regular: path.join(process.cwd(), "src/assets/fonts/Arimo-Regular.ttf"),
  bold: path.join(process.cwd(), "src/assets/fonts/Arimo-Bold.ttf"),
  boldItalic: path.join(process.cwd(), "src/assets/fonts/Arimo-BoldItalic.ttf"),
};
const logoPath = path.join(process.cwd(), "public/images/logo-nix.png");

const blue = rgb(0x33 / 255, 0x66 / 255, 1);
const purple = rgb(0x70 / 255, 0x30 / 255, 0xa0 / 255);
const black = rgb(0, 0, 0);
const white = rgb(1, 1, 1);

const pageWidth = PageSizes.A4[0];
const pageHeight = PageSizes.A4[1];
const margin = 36;
const contentWidth = pageWidth - margin * 2;

const topMargin = 32;
const bottomMargin = 28;
const logoHeight = 36;
const gapAfterLogo = 12;
const titleBarHeight = 16;
const gapAfterBar = 14;
const boxGap = 12;
const gapAfterBoxes = 12;
const tableHeaderHeight = 20;
const blankRowHeight = 18;
const totalsRowHeight = 18;
const totalsRows = 5;
const totalsHeight = totalsRowHeight * totalsRows;
const purpleHeight = 22;
const purpleGap = 8;
const barHeight = 12;
const barGap = 10;
const continuationHeight = 22;

const qtyWidth = 48;
const unitWidth = 100;
const totalWidth = 92;
const descWidth = contentWidth - qtyWidth - unitWidth - totalWidth;
const labelColumnWidth = 68;

const leftBoxWidth = Math.round((contentWidth - boxGap) * 0.58);
const rightBoxWidth = contentWidth - boxGap - leftBoxWidth;

interface IAssets {
  logo: Uint8Array;
  regular: Uint8Array;
  bold: Uint8Array;
  boldItalic: Uint8Array;
}

interface IFonts {
  regular: PDFFont;
  bold: PDFFont;
  boldItalic: PDFFont;
}

interface IBodyRow {
  height: number;
  lines: string[];
  item: IOrderPdfModel["items"][number] | null;
}

interface IPlannedPage {
  intro: boolean;
  last: boolean;
  rows: IBodyRow[];
}

let assetsPromise: Promise<IAssets> | null = null;

function loadAssets() {
  const pending =
    assetsPromise ??
    Promise.all([
      readFile(logoPath),
      readFile(fontPaths.regular),
      readFile(fontPaths.bold),
      readFile(fontPaths.boldItalic),
    ]).then(([logo, regular, bold, boldItalic]) => ({
      logo,
      regular,
      bold,
      boldItalic,
    }));

  assetsPromise = pending;
  return pending.then(
    (assets) => assets,
    (error: unknown) => {
      assetsPromise = null;
      throw error;
    },
  );
}

function fromTop(distance: number) {
  return pageHeight - distance;
}

function roundedRectPath(width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  return [
    `M ${r} 0`,
    `H ${width - r}`,
    `A ${r} ${r} 0 0 1 ${width} ${r}`,
    `V ${height - r}`,
    `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${height - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function fitText(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const ellipsis = "…";
  let cut = text;
  while (
    cut.length > 0 &&
    font.widthOfTextAtSize(`${cut}${ellipsis}`, size) > maxWidth
  ) {
    cut = cut.slice(0, -1);
  }
  return `${cut}${ellipsis}`;
}

function baseline(top: number, height: number, fontSize: number) {
  const bottom = fromTop(top + height);
  return bottom + (height - fontSize) / 2 + fontSize * 0.18;
}

function drawRoundedBox(
  page: PDFPage,
  x: number,
  top: number,
  width: number,
  height: number,
) {
  page.drawSvgPath(roundedRectPath(width, height, 8), {
    x,
    y: fromTop(top),
    borderColor: black,
    borderWidth: 0.8,
  });
}

function drawBoxTitle(
  page: PDFPage,
  font: PDFFont,
  x: number,
  top: number,
  width: number,
  title: string,
) {
  const size = 10;
  const textWidth = font.widthOfTextAtSize(title, size);
  const textX = x + (width - textWidth) / 2;
  page.drawRectangle({
    x: textX - 5,
    y: fromTop(top) - size * 0.45,
    width: textWidth + 10,
    height: size * 0.9,
    color: white,
  });
  page.drawText(title, {
    x: textX,
    y: fromTop(top) - size * 0.32,
    size,
    font,
    color: black,
  });
}

function drawField(
  page: PDFPage,
  fonts: IFonts,
  x: number,
  top: number,
  width: number,
  label: string,
  value: string,
) {
  const size = 9;
  const labelWidth = fonts.bold.widthOfTextAtSize(label, size) + 6;
  const valueWidth = Math.max(8, width - labelWidth);
  page.drawText(label, {
    x,
    y: baseline(top, 16, size),
    size,
    font: fonts.bold,
    color: black,
  });
  page.drawText(fitText(value, fonts.regular, size, valueWidth - 2), {
    x: x + labelWidth,
    y: baseline(top, 16, size),
    size,
    font: fonts.regular,
    color: black,
  });
  const lineY = fromTop(top + 15);
  page.drawLine({
    start: { x: x + labelWidth, y: lineY },
    end: { x: x + width, y: lineY },
    thickness: 0.6,
    color: black,
  });
}

function drawClientBoxes(
  page: PDFPage,
  fonts: IFonts,
  model: IOrderPdfModel,
  top: number,
  height: number,
) {
  const rightX = margin + leftBoxWidth + boxGap;
  drawRoundedBox(page, margin, top, leftBoxWidth, height);
  drawRoundedBox(page, rightX, top, rightBoxWidth, height);
  drawBoxTitle(page, fonts.bold, margin, top, leftBoxWidth, "Cliente");

  const pad = 10;
  let row = top + 16;
  drawField(
    page,
    fonts,
    margin + pad,
    row,
    leftBoxWidth - pad * 2,
    "Nome",
    model.customer.name,
  );
  row += 22;
  const addressLines = wrapText(
    model.customer.address,
    fonts.regular,
    9,
    leftBoxWidth - pad * 2 - fonts.bold.widthOfTextAtSize("Endereço", 9) - 8,
  ).slice(0, 2);
  drawField(
    page,
    fonts,
    margin + pad,
    row,
    leftBoxWidth - pad * 2,
    "Endereço",
    addressLines[0] ?? "",
  );
  if (addressLines[1]) {
    page.drawText(
      fitText(addressLines[1], fonts.regular, 9, leftBoxWidth - pad * 2),
      {
        x: margin + pad,
        y: baseline(row + 18, 14, 9),
        size: 9,
        font: fonts.regular,
        color: black,
      },
    );
    row += 20;
  }
  row += 22;

  const inner = leftBoxWidth - pad * 2;
  const cityW = inner * 0.4;
  const stateW = inner * 0.28;
  const cepW = inner - cityW - stateW;
  drawField(page, fonts, margin + pad, row, cityW - 6, "Cidade", model.customer.city);
  drawField(
    page,
    fonts,
    margin + pad + cityW,
    row,
    stateW - 6,
    "Estado",
    model.customer.state,
  );
  drawField(
    page,
    fonts,
    margin + pad + cityW + stateW,
    row,
    cepW,
    "CEP",
    model.customer.postalCode,
  );
  row += 22;
  drawField(
    page,
    fonts,
    margin + pad,
    row,
    leftBoxWidth - pad * 2,
    "Telefone",
    model.customer.phone,
  );

  let detailRow = top + 16;
  const details: Array<[string, string]> = [
    ["Data", model.details.date],
    ["CPF/CNPJ", model.details.document],
    ["Rep.", model.details.representative],
    ["Pedido Número", model.details.orderNumber],
  ];
  for (const [label, value] of details) {
    drawField(
      page,
      fonts,
      rightX + pad,
      detailRow,
      rightBoxWidth - pad * 2,
      label,
      value,
    );
    detailRow += 22;
  }
}

function clientBoxHeight(model: IOrderPdfModel, fonts: IFonts) {
  const addressWidth =
    leftBoxWidth -
    20 -
    fonts.bold.widthOfTextAtSize("Endereço", 9) -
    8;
  const lines = wrapText(model.customer.address, fonts.regular, 9, addressWidth);
  return lines.length > 1 ? 140 : 116;
}

function rowHeight(lines: string[]) {
  return Math.max(blankRowHeight, lines.length * 11 + 8);
}

function measureRows(model: IOrderPdfModel, fonts: IFonts): IBodyRow[] {
  const textWidth = descWidth - 10;
  return model.items.map((item) => {
    const lines = wrapText(item.description, fonts.regular, 9, textWidth).slice(0, 3);
    return { height: rowHeight(lines), lines, item };
  });
}

function footerTop() {
  const barTop = pageHeight - bottomMargin - barHeight;
  const purpleTop = barTop - barGap - purpleHeight;
  const totalsTop = purpleTop - purpleGap - totalsHeight;
  return { barTop, purpleTop, totalsTop };
}

function contentTop(intro: boolean, boxHeight: number) {
  if (!intro) return topMargin + continuationHeight;
  return (
    topMargin +
    logoHeight +
    gapAfterLogo +
    titleBarHeight +
    gapAfterBar +
    boxHeight +
    gapAfterBoxes
  );
}

function takeRows(rows: IBodyRow[], start: number, maxHeight: number) {
  if (maxHeight <= 0) return 0;

  let used = 0;
  let count = 0;

  for (let index = start; index < rows.length; index += 1) {
    const height = rows[index].height;
    if (count > 0 && used + height > maxHeight) break;
    if (count === 0 && height > maxHeight) return 1;
    used += height;
    count += 1;
  }

  return count;
}

/**
 * Uma página quando os itens cabem no corpo alto do modelo. Senão, a tabela
 * continua na página seguinte com o cabeçalho roxo repetido. Totais, pagamento
 * e as faixas ficam na última página.
 */
function planPages(rows: IBodyRow[], boxHeight: number): IPlannedPage[] {
  const { totalsTop } = footerTop();
  const pages: IPlannedPage[] = [];
  let index = 0;

  while (true) {
    const intro = pages.length === 0;
    const top = contentTop(intro, boxHeight);
    const lastBody = Math.max(0, totalsTop - top - tableHeaderHeight);
    const remaining = rows.length - index;

    if (takeRows(rows, index, lastBody) >= remaining) {
      pages.push({ intro, last: true, rows: rows.slice(index) });
      break;
    }

    const midBody = pageHeight - bottomMargin - top - tableHeaderHeight;
    let count = takeRows(rows, index, midBody);
    if (count >= remaining) count = Math.max(1, remaining - 1);
    if (count < 1) count = 1;

    pages.push({
      intro,
      last: false,
      rows: rows.slice(index, index + count),
    });
    index += count;
  }

  return pages;
}

function fillBody(rows: IBodyRow[], bodyHeight: number) {
  const filled = rows.map((row) => ({ ...row, lines: [...row.lines] }));
  let extra =
    bodyHeight - filled.reduce((sum, row) => sum + row.height, 0);

  while (extra >= blankRowHeight) {
    filled.push({ height: blankRowHeight, lines: [], item: null });
    extra -= blankRowHeight;
  }

  if (extra > 0.5) {
    if (filled.length === 0) {
      filled.push({ height: extra, lines: [], item: null });
    } else {
      filled[filled.length - 1].height += extra;
    }
  }

  return filled;
}

function drawTitleBand(page: PDFPage, font: PDFFont, top: number) {
  const title = "Pedido";
  const size = 16;
  const titleWidth = font.widthOfTextAtSize(title, size);
  const segment = 16;
  const gap = 5;
  const group = segment + gap + titleWidth + gap + segment;
  const groupX = margin + contentWidth - group;
  const barY = fromTop(top + titleBarHeight);

  page.drawRectangle({
    x: margin,
    y: barY,
    width: Math.max(0, groupX - margin - 3),
    height: titleBarHeight,
    color: blue,
  });
  page.drawRectangle({
    x: groupX,
    y: barY,
    width: segment,
    height: titleBarHeight,
    color: blue,
  });
  page.drawRectangle({
    x: groupX + segment + gap + titleWidth + gap,
    y: barY,
    width: segment,
    height: titleBarHeight,
    color: blue,
  });
  page.drawText(title, {
    x: groupX + segment + gap,
    y: baseline(top, titleBarHeight, size),
    size,
    font,
    color: black,
  });
}

function drawIntro(
  page: PDFPage,
  fonts: IFonts,
  logo: PDFImage,
  model: IOrderPdfModel,
  boxHeight: number,
) {
  const logoWidth = logoHeight * (logo.width / logo.height);
  page.drawImage(logo, {
    x: margin,
    y: fromTop(topMargin + logoHeight),
    width: logoWidth,
    height: logoHeight,
  });
  page.drawText(model.companyName, {
    x: margin + logoWidth + 10,
    y: baseline(topMargin, logoHeight, 14),
    size: 14,
    font: fonts.bold,
    color: black,
  });

  const barTop = topMargin + logoHeight + gapAfterLogo;
  drawTitleBand(page, fonts.boldItalic, barTop);

  const boxTop = barTop + titleBarHeight + gapAfterBar;
  drawClientBoxes(page, fonts, model, boxTop, boxHeight);
}

function drawCellText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  x: number,
  top: number,
  width: number,
  height: number,
  align: "left" | "center" | "right",
  color = black,
) {
  const fitted = fitText(text, font, size, width - 8);
  const textWidth = font.widthOfTextAtSize(fitted, size);
  const textX =
    align === "right"
      ? x + width - textWidth - 4
      : align === "center"
        ? x + (width - textWidth) / 2
        : x + 4;

  page.drawText(fitted, {
    x: textX,
    y: baseline(top, height, size),
    size,
    font,
    color,
  });
}

function drawTable(
  page: PDFPage,
  fonts: IFonts,
  top: number,
  rows: IBodyRow[],
) {
  const tableHeight =
    tableHeaderHeight + rows.reduce((sum, row) => sum + row.height, 0);
  const columns = [qtyWidth, descWidth, unitWidth, totalWidth];

  page.drawRectangle({
    x: margin,
    y: fromTop(top + tableHeaderHeight),
    width: contentWidth,
    height: tableHeaderHeight,
    color: purple,
  });

  const headers: Array<[string, number, "left" | "center" | "right"]> = [
    ["Qtde.", qtyWidth, "center"],
    ["Descrição", descWidth, "left"],
    ["Preço unitário", unitWidth, "right"],
    ["TOTAL", totalWidth, "right"],
  ];
  let headerX = margin;
  for (const [label, width, align] of headers) {
    drawCellText(
      page,
      label,
      fonts.bold,
      8.5,
      headerX,
      top,
      width,
      tableHeaderHeight,
      align,
      white,
    );
    headerX += width;
  }

  let rowTop = top + tableHeaderHeight;
  for (const row of rows) {
    if (row.item) {
      drawCellText(
        page,
        String(row.item.quantity),
        fonts.regular,
        9,
        margin,
        rowTop,
        qtyWidth,
        row.height,
        "center",
      );
      row.lines.forEach((line, lineIndex) => {
        const lineTop = rowTop + 3 + lineIndex * 11;
        page.drawText(line, {
          x: margin + qtyWidth + 4,
          y: fromTop(lineTop + 9),
          size: 9,
          font: fonts.regular,
          color: black,
        });
      });
      drawCellText(
        page,
        row.item.unitPrice,
        fonts.regular,
        9,
        margin + qtyWidth + descWidth,
        rowTop,
        unitWidth,
        row.height,
        "right",
      );
      drawCellText(
        page,
        row.item.lineTotal,
        fonts.regular,
        9,
        margin + qtyWidth + descWidth + unitWidth,
        rowTop,
        totalWidth,
        row.height,
        "right",
      );
    }
    rowTop += row.height;
  }

  const bottom = top + tableHeight;
  const uniqueCuts = [top, top + tableHeaderHeight];
  let walk = top + tableHeaderHeight;
  for (const row of rows) {
    walk += row.height;
    uniqueCuts.push(walk);
  }

  for (const cut of uniqueCuts) {
    page.drawLine({
      start: { x: margin, y: fromTop(cut) },
      end: { x: margin + contentWidth, y: fromTop(cut) },
      thickness: 0.6,
      color: black,
    });
  }

  let lineX = margin;
  const verticals = [0, ...columns];
  for (const column of verticals) {
    lineX += column;
    page.drawLine({
      start: { x: lineX, y: fromTop(top) },
      end: { x: lineX, y: fromTop(bottom) },
      thickness: 0.6,
      color: black,
    });
  }

  return bottom;
}

function drawTotals(
  page: PDFPage,
  fonts: IFonts,
  model: IOrderPdfModel,
  top: number,
) {
  const x = margin + contentWidth - totalWidth;
  const cells = [
    { label: null, value: model.totals.subtotal, emphasize: false },
    {
      label: model.totals.discount ? "Desconto" : null,
      value: model.totals.discount ?? "",
      emphasize: false,
    },
    { label: null, value: "", emphasize: false },
    { label: "Frete", value: model.totals.shipping, emphasize: false },
    { label: "Total", value: model.totals.total, emphasize: true },
  ];

  cells.forEach((cell, index) => {
    const cellTop = top + index * totalsRowHeight;
    page.drawRectangle({
      x,
      y: fromTop(cellTop + totalsRowHeight),
      width: totalWidth,
      height: totalsRowHeight,
      borderColor: black,
      borderWidth: cell.emphasize ? 1.1 : 0.6,
    });
    if (cell.label) {
      const size = cell.emphasize ? 10 : 9;
      const textWidth = fonts.bold.widthOfTextAtSize(cell.label, size);
      page.drawText(cell.label, {
        x: x - 6 - textWidth,
        y: baseline(cellTop, totalsRowHeight, size),
        size,
        font: fonts.bold,
        color: black,
      });
    }
    if (cell.value) {
      drawCellText(
        page,
        cell.value,
        cell.emphasize ? fonts.bold : fonts.regular,
        cell.emphasize ? 10 : 9,
        x,
        cellTop,
        totalWidth,
        totalsRowHeight,
        "right",
      );
    }
  });
}

function drawRadio(
  page: PDFPage,
  fonts: IFonts,
  x: number,
  centerY: number,
  label: string,
  selected: boolean,
) {
  const radius = 4.2;
  page.drawCircle({
    x,
    y: centerY,
    size: radius,
    borderColor: black,
    borderWidth: 0.8,
  });
  if (selected) {
    page.drawCircle({
      x,
      y: centerY,
      size: radius * 0.55,
      color: black,
    });
  }
  page.drawText(label, {
    x: x + 10,
    y: centerY - 3.2,
    size: 9,
    font: fonts.regular,
    color: black,
  });
}

function drawPayment(
  page: PDFPage,
  fonts: IFonts,
  model: IOrderPdfModel,
  top: number,
) {
  const width = contentWidth - totalWidth - labelColumnWidth - 12;
  drawRoundedBox(page, margin, top, width, totalsHeight);
  page.drawText("Detalhes sobre o pagamento", {
    x: margin + 12,
    y: baseline(top + 8, 16, 10),
    size: 10,
    font: fonts.bold,
    color: black,
  });

  orderPdfPaymentOptions.forEach((option, index) => {
    const center = fromTop(top + 34 + index * 16) - 2;
    drawRadio(
      page,
      fonts,
      margin + 16,
      center,
      option.label,
      model.payment === (option.id as TOrderPdfPayment),
    );
  });
}

function drawFooter(page: PDFPage, fonts: IFonts, model: IOrderPdfModel) {
  const { barTop, purpleTop, totalsTop } = footerTop();
  drawTotals(page, fonts, model, totalsTop);
  drawPayment(page, fonts, model, totalsTop);

  const purpleWidth = 148;
  page.drawRectangle({
    x: margin + contentWidth - purpleWidth,
    y: fromTop(purpleTop + purpleHeight),
    width: purpleWidth,
    height: purpleHeight,
    color: purple,
  });
  page.drawRectangle({
    x: margin,
    y: fromTop(barTop + barHeight),
    width: contentWidth,
    height: barHeight,
    color: blue,
  });
}

function drawContinuation(page: PDFPage, font: PDFFont, id: number) {
  page.drawText(`Pedido nº ${id}`, {
    x: margin,
    y: baseline(topMargin, 16, 11),
    size: 11,
    font,
    color: black,
  });
}

/** Gera o PDF A4 do pedido. Várias páginas se os itens não couberem na primeira. */
export async function renderOrderPdf(model: IOrderPdfModel) {
  const assets = await loadAssets();
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const fonts: IFonts = {
    regular: await pdf.embedFont(assets.regular, { subset: true }),
    bold: await pdf.embedFont(assets.bold, { subset: true }),
    boldItalic: await pdf.embedFont(assets.boldItalic, { subset: true }),
  };
  const logo = await pdf.embedPng(assets.logo);
  pdf.setTitle(`Pedido ${model.id}`);
  pdf.setAuthor(model.companyName);

  const boxHeight = clientBoxHeight(model, fonts);
  const measured = measureRows(model, fonts);
  const planned = planPages(measured, boxHeight);
  const { totalsTop } = footerTop();

  for (const plannedPage of planned) {
    const page = pdf.addPage(PageSizes.A4);
    if (plannedPage.intro) drawIntro(page, fonts, logo, model, boxHeight);
    else drawContinuation(page, fonts.bold, model.id);

    const top = contentTop(plannedPage.intro, boxHeight);
    const tableBottom = plannedPage.last
      ? totalsTop
      : pageHeight - bottomMargin;
    const bodyHeight = Math.max(blankRowHeight, tableBottom - top - tableHeaderHeight);
    const rows = fillBody(plannedPage.rows, bodyHeight);
    drawTable(page, fonts, top, rows);

    if (plannedPage.last) drawFooter(page, fonts, model);
  }

  return pdf.save();
}
