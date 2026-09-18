const fs = require('fs');
const path = require('path');
const png2icons = require('png2icons');

const src = path.join(__dirname, '..', 'src', 'assets', 'icon-app.png');
const dest = path.join(__dirname, '..', 'build', 'icon.ico');

function convert() {
  const buildDir = path.dirname(dest);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  const pngBuf = fs.readFileSync(src);
  const icoBuf = png2icons.createICO(pngBuf, png2icons.BILINEAR, 0, true, false);
  if (!icoBuf || icoBuf.length === 0) {
    console.error('Failed to create ICO');
    process.exit(1);
  }
  fs.writeFileSync(dest, icoBuf);
  console.log('icon.ico created at', dest, '(' + icoBuf.length + ' bytes)');
}

convert();
