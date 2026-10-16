#!/usr/bin/env node
/**
 * check-fidelity.js
 *
 * Verificação mecânica (não interpretativa) de fidelidade entre o build
 * de um projeto e os contratos definidos em 00-brief/stack-lock.md e
 * 04-design/design-system.md.
 *
 * Uso: node check-fidelity.js <caminho-da-raiz-do-projeto>
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2] || process.cwd();

function readIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function findFilesRecursive(dir, extensions, ignoreDirs) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoreDirs.includes(entry.name)) continue;
      results = results.concat(findFilesRecursive(fullPath, extensions, ignoreDirs));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build'];

const buildDir = path.join(projectRoot, '05-build');
const stackLockPath = path.join(projectRoot, '00-brief', 'stack-lock.md');
const designSystemPath = path.join(projectRoot, '04-design', 'design-system.md');

const report = {
  stackViolations: [],
  placeholderText: [],
  missingHeadings: [],
  orphanColors: [],
  notes: [],
};

// 1) Stack Lock
const KNOWN_FRAMEWORKS = [
  { name: 'React', patterns: [/\breact\b/i, /from ['"]react['"]/i] },
  { name: 'Next.js', patterns: [/\bnext\.config\./i, /from ['"]next['"]/i, /"next":/i] },
  { name: 'Vue', patterns: [/\bvue\.config\./i, /from ['"]vue['"]/i, /"vue":/i] },
  { name: 'Angular', patterns: [/@angular\//i, /"@angular\//i] },
  { name: 'Svelte', patterns: [/\.svelte['"]/i, /"svelte":/i] },
  { name: 'Tailwind CSS', patterns: [/tailwind\.config\./i, /"tailwindcss":/i, /@tailwind\s/i] },
  { name: 'Bootstrap', patterns: [/"bootstrap":/i, /bootstrap\.min\.(css|js)/i] },
];

const stackLockContent = readIfExists(stackLockPath);
if (!stackLockContent) {
  report.notes.push('AVISO: 00-brief/stack-lock.md não encontrado — verificação de stack rodou só contra a lista padrão de frameworks conhecidos.');
}

let allowedList = [];
if (stackLockContent) {
  const permitidoMatch = stackLockContent.match(/## Permitido([\s\S]*?)(##|$)/i);
  if (permitidoMatch) {
    allowedList = permitidoMatch[1]
      .split('\n')
      .map((l) => l.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }
}

function isExplicitlyAllowed(frameworkName) {
  return allowedList.some((a) => a.toLowerCase().includes(frameworkName.toLowerCase()));
}

const relevantFiles = findFilesRecursive(buildDir, ['.html', '.js', '.jsx', '.ts', '.tsx', '.json', '.css'], IGNORE_DIRS);

for (const file of relevantFiles) {
  const content = readIfExists(file);
  if (!content) continue;
  for (const fw of KNOWN_FRAMEWORKS) {
    if (isExplicitlyAllowed(fw.name)) continue;
    for (const pattern of fw.patterns) {
      if (pattern.test(content)) {
        report.stackViolations.push({
          framework: fw.name,
          file: path.relative(projectRoot, file),
          matchedPattern: pattern.toString(),
        });
        break;
      }
    }
  }
}

// 2) Texto placeholder
const PLACEHOLDER_PATTERNS = [
  />\s*Header\s*</i,
  />\s*Main Content\s*</i,
  />\s*Side\s*</i,
  /lorem ipsum/i,
  /t[ií]tulo aqui/i,
  /texto aqui/i,
  /conte[uú]do aqui/i,
  /se[cç][aã]o\s*\d*\s*</i,
  /placeholder/i,
];

const htmlFiles = findFilesRecursive(buildDir, ['.html'], IGNORE_DIRS);
for (const file of htmlFiles) {
  const content = readIfExists(file);
  if (!content) continue;
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      report.placeholderText.push({
        file: path.relative(projectRoot, file),
        matchedText: match[0].trim(),
      });
    }
  }
}

// 3) Headings semânticos ausentes
for (const file of htmlFiles) {
  const content = readIfExists(file);
  if (!content) continue;
  const hasAnyHeading = /<h[1-6][\s>]/i.test(content);
  if (!hasAnyHeading) {
    report.missingHeadings.push({
      file: path.relative(projectRoot, file),
      issue: 'Nenhuma tag <h1> a <h6> encontrada — qualquer regra de tipografia para headings no CSS não será aplicada a nada.',
    });
  }
}

// 4) Cores órfãs
const designSystemContent = readIfExists(designSystemPath);
const HEX_PATTERN = /#[0-9a-fA-F]{3,8}\b/g;

if (designSystemContent) {
  const specifiedColors = new Set((designSystemContent.match(HEX_PATTERN) || []).map((c) => c.toLowerCase()));
  const cssFiles = findFilesRecursive(buildDir, ['.css'], IGNORE_DIRS);
  for (const file of cssFiles) {
    const content = readIfExists(file);
    if (!content) continue;
    const usedColors = new Set((content.match(HEX_PATTERN) || []).map((c) => c.toLowerCase()));
    for (const color of usedColors) {
      if (!specifiedColors.has(color)) {
        report.orphanColors.push({
          file: path.relative(projectRoot, file),
          color,
          issue: 'Cor usada no CSS mas não encontrada em design-system.md — pode ter sido inventada pelo build em vez de especificada no design.',
        });
      }
    }
  }
} else {
  report.notes.push('AVISO: 04-design/design-system.md não encontrado — não foi possível checar cores órfãs.');
}

console.log(JSON.stringify(report, null, 2));

const totalViolations =
  report.stackViolations.length +
  report.placeholderText.length +
  report.missingHeadings.length +
  report.orphanColors.length;

if (totalViolations > 0) {
  process.exitCode = 1;
}
