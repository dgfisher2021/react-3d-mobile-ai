import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const SVG_DIR = join(import.meta.dirname, '../../src/components/svgs/construction');
const OUTPUT_DIR = join(import.meta.dirname, '../../src/components/svgs');

const COLOR_MAP = {
  '#F8F8F9': { v: 'g50', e: "getColor('gray', 50)" },
  '#EDEDED': { v: 'g100', e: "getColor('gray', 100)" },
  '#DBDBDB': { v: 'g200', e: "getColor('gray', 200)" },
  '#CCCCCE': { v: 'g300', e: "getColor('gray', 300)" },
  '#C5C5CA': { v: 'g300b', e: "getColor('gray', 300)" },
  '#ACAAB0': { v: 'g400', e: "getColor('gray', 400)" },
  '#88888F': { v: 'g500', e: "getColor('gray', 500)" },
  '#797781': { v: 'g600', e: "getColor('gray', 600)" },
  '#58575D': { v: 'g700', e: "getColor('gray', 700)" },
  '#49484C': { v: 'g800', e: "getColor('gray', 800)" },
  '#D1E5F5': { v: 'cs100', e: 'getColor(colorScheme, 100)' },
  '#B4D8F1': { v: 'cs200', e: 'getColor(colorScheme, 200)' },
  '#7AB9E8': { v: 'cs300', e: 'getColor(colorScheme, 300)' },
  '#61AAE4': { v: 'cs400', e: 'getColor(colorScheme, 400)' },
  '#4A82CA': { v: 'cs500', e: 'getColor(colorScheme, 500)' },
  '#F7E3C6': { v: 'ac50', e: 'getColor(accentColor, 50)' },
  '#F8E99B': { v: 'ac100', e: 'getColor(accentColor, 100)' },
  '#F4D8AA': { v: 'ac100b', e: 'getColor(accentColor, 100)' },
  '#F6E27D': { v: 'ac200', e: 'getColor(accentColor, 200)' },
  '#EFC27B': { v: 'ac300', e: 'getColor(accentColor, 300)' },
  '#ECB45C': { v: 'ac400', e: 'getColor(accentColor, 400)' },
  '#E9A440': { v: 'ac500', e: 'getColor(accentColor, 500)' },
  '#EBE4DD': { v: 'w50', e: "getColor('orange', 50)" },
  '#D8CCBC': { v: 'w100', e: "getColor('orange', 100)" },
  '#BFA993': { v: 'w200', e: "getColor('orange', 200)" },
  '#B29A7E': { v: 'w300', e: "getColor('orange', 300)" },
  '#A58868': { v: 'w400', e: "getColor('orange', 400)" },
  '#6A5740': { v: 'w600', e: "getColor('orange', 600)" },
  '#95D5A7': { v: 'gn300', e: "getColor('green', 300)" },
  '#80CB93': { v: 'gn400', e: "getColor('green', 400)" },
  '#6DC180': { v: 'gn500', e: "getColor('green', 500)" },
  '#D38D94': { v: 'rd200', e: "getColor('red', 200)" },
  '#C18089': { v: 'rd300', e: "getColor('red', 300)" },
  '#AD717B': { v: 'rd400', e: "getColor('red', 400)" },
  '#E07188': { v: 'rd300b', e: "getColor('red', 300)" },
  '#E02753': { v: 'rd500', e: "getColor('red', 500)" },
  '#C5142C': { v: 'rd600', e: "getColor('red', 600)" },
};

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join('');
}

function convertSvg(filename) {
  const raw = readFileSync(join(SVG_DIR, filename), 'utf8');
  const base = basename(filename, '.svg');
  const name = toPascalCase(base) + 'SVG';

  const vbMatch = raw.match(/viewBox="([^"]+)"/);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 512 512';

  const innerMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!innerMatch) return null;
  let inner = innerMatch[1];

  inner = inner.replace(/<!--[\s\S]*?-->/g, '');
  inner = inner.replace(/<g>\s*<\/g>\s*/g, '');

  const usedHexes = new Set();
  const fillRe = /style="fill:(#[A-Fa-f0-9]{6});?"/g;
  let m;
  while ((m = fillRe.exec(inner)) !== null) {
    usedHexes.add(m[1].toUpperCase());
  }

  // Check for complex style attributes (stroke styles)
  const complexStyleRe = /style="fill:none;[^"]*stroke[^"]*"/g;
  const hasComplexStyles = complexStyleRe.test(inner);

  const usedEntries = [...usedHexes]
    .map((hex) => ({ hex, info: COLOR_MAP[hex] }))
    .filter((e) => e.info);
  const needsColorScheme = usedEntries.some((e) => e.info.e.includes('colorScheme'));
  const needsAccentColor = usedEntries.some((e) => e.info.e.includes('accentColor'));

  const varDecls = [];
  const varNames = {};
  for (const { hex, info } of usedEntries) {
    varDecls.push(`  const ${info.v} = ${info.e};`);
    varNames[hex] = info.v;
  }

  // If complex styles exist, add g800 for stroke color
  if (hasComplexStyles && !varNames['#2E2D31']) {
    varDecls.push("  const strokeDk = getColor('gray', 800);");
  }

  for (const hex of usedHexes) {
    if (!varNames[hex]) {
      const safeVar = 'c_' + hex.slice(1).toLowerCase();
      varDecls.push(`  const ${safeVar} = '${hex.toLowerCase()}';`);
      varNames[hex] = safeVar;
    }
  }

  let jsx = inner.replace(/style="fill:(#[A-Fa-f0-9]{6});?"/g, (_, hex) => {
    const vn = varNames[hex.toUpperCase()];
    return `fill={${vn}}`;
  });

  // Convert complex style attributes with strokes to JSX attributes
  jsx = jsx.replace(
    /style="fill:none;stroke:#[A-Fa-f0-9]{6};[^"]*stroke-miterlimit:\d+;?"/g,
    'fill="none" stroke={strokeDk} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={10}'
  );

  jsx = jsx.replace(/\s*style="enable-background:[^"]*"/g, '');
  jsx = jsx.replace(/stroke-dasharray/g, 'strokeDasharray');
  jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
  jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
  jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
  jsx = jsx.replace(/stroke-miterlimit/g, 'strokeMiterlimit');
  jsx = jsx.replace(/fill-rule/g, 'fillRule');
  jsx = jsx.replace(/clip-rule/g, 'clipRule');
  jsx = jsx.replace(/xmlns:xlink="[^"]*"/g, '');
  jsx = jsx.replace(/xml:space="[^"]*"/g, '');
  jsx = jsx.replace(/xlink:href/g, 'xlinkHref');

  jsx = jsx.trim();
  jsx = jsx.replace(/\n{3,}/g, '\n\n');

  const lines = [];
  lines.push("import type { SVGProps } from 'react';");
  lines.push("import { getColor } from './colors';");
  lines.push('');
  lines.push(`interface ${name}Props extends SVGProps<SVGSVGElement> {`);
  if (needsColorScheme) lines.push('  colorScheme?: string;');
  if (needsAccentColor) lines.push('  accentColor?: string;');
  lines.push('  size?: number;');
  lines.push('}');
  lines.push('');
  lines.push(`export default function ${name}({`);
  if (needsColorScheme) lines.push("  colorScheme = 'blue',");
  if (needsAccentColor) lines.push("  accentColor = 'yellow',");
  lines.push('  size = 32,');
  lines.push('  ...props');
  lines.push(`}: ${name}Props) {`);
  for (const d of varDecls) {
    lines.push(d);
  }
  lines.push('');
  lines.push('  return (');
  lines.push('    <svg');
  lines.push('      fill="none"');
  lines.push('      width={size}');
  lines.push('      height={size}');
  lines.push(`      viewBox="${viewBox}"`);
  lines.push('      xmlns="http://www.w3.org/2000/svg"');
  lines.push('      {...props}');
  lines.push('    >');
  const indented = jsx
    .split('\n')
    .map((l) => '      ' + l)
    .join('\n');
  lines.push(indented);
  lines.push('    </svg>');
  lines.push('  );');
  lines.push('}');
  lines.push('');

  return { name, content: lines.join('\n') };
}

const files = readdirSync(SVG_DIR).filter((f) => f.endsWith('.svg'));
const components = [];

for (const file of files) {
  const result = convertSvg(file);
  if (result) {
    const outPath = join(OUTPUT_DIR, `${result.name}.tsx`);
    writeFileSync(outPath, result.content);
    components.push(result.name);
    console.log(`+ ${file} -> ${result.name}.tsx`);
  } else {
    console.log(`! ${file} - FAILED`);
  }
}

console.log('\n// Barrel exports to add to index.ts:');
for (const c of components.sort()) {
  console.log(`export { default as ${c} } from './${c}';`);
}
