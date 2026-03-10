const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceCss = path.join(
  root,
  'node_modules',
  '@fortawesome',
  'fontawesome-free',
  'css',
  'all.min.css'
);
const sourceWebfonts = path.join(
  root,
  'node_modules',
  '@fortawesome',
  'fontawesome-free',
  'webfonts'
);
const destRoot = path.join(root, 'src', 'public', 'vendor', 'fontawesome');
const destCssDir = path.join(destRoot, 'css');
const destWebfonts = path.join(destRoot, 'webfonts');
const destCssFile = path.join(destCssDir, 'all.min.css');

function assertExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} nao encontrado: ${filePath}`);
  }
}

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFontAwesomeAssets() {
  assertExists(sourceCss, 'Arquivo CSS do Font Awesome');
  assertExists(sourceWebfonts, 'Pasta webfonts do Font Awesome');

  ensureCleanDir(destRoot);
  fs.mkdirSync(destCssDir, { recursive: true });

  fs.copyFileSync(sourceCss, destCssFile);
  fs.cpSync(sourceWebfonts, destWebfonts, { recursive: true });

  console.log('Font Awesome sincronizado em src/public/vendor/fontawesome');
}

try {
  copyFontAwesomeAssets();
} catch (error) {
  console.error('Falha ao copiar Font Awesome:', error.message);
  process.exit(1);
}
