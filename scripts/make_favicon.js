const fs = require('fs');
const path = require('path');

const srcPng = path.resolve(__dirname, '..', 'src', 'assets', 'images', 'logo-favicon.png');
const out1 = path.resolve(__dirname, '..', 'src', 'favicon.ico');
const out2 = path.resolve(__dirname, '..', 'public', 'favicon.ico');

if (!fs.existsSync(srcPng)) {
    console.error('Source PNG not found:', srcPng);
    process.exit(1);
}

const png = fs.readFileSync(srcPng);
// parse IHDR
if (png.readUInt32BE(12) !== 0x49484452) {
    // IHDR chunk name
    // but sometimes offset different; safe search for IHDR
    let ihdrIndex = png.indexOf(Buffer.from('IHDR'));
    if (ihdrIndex === -1) {
        console.error('IHDR chunk not found');
        process.exit(1);
    }
    const width = png.readUInt32BE(ihdrIndex + 4);
    const height = png.readUInt32BE(ihdrIndex + 8);
    console.log('PNG size', width, height);
} else {
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    console.log('PNG size', width, height);
}

const pngSize = png.length;
const ICONDIR = Buffer.alloc(6);
ICONDIR.writeUInt16LE(0, 0); // reserved
ICONDIR.writeUInt16LE(1, 2); // type 1 = icon
ICONDIR.writeUInt16LE(1, 4); // count

const ICONDIRENTRY = Buffer.alloc(16);
// width and height - set to 0 if >=256, else actual
let w = png[16] || 0;
let h = png[20] || 0;
// Try parse IHDR properly
let ihdrIndex = png.indexOf(Buffer.from('IHDR'));
if (ihdrIndex !== -1) {
    w = png.readUInt32BE(ihdrIndex + 4);
    h = png.readUInt32BE(ihdrIndex + 8);
}
ICONDIRENTRY.writeUInt8(w >= 256 ? 0 : w, 0);
ICONDIRENTRY.writeUInt8(h >= 256 ? 0 : h, 1);
ICONDIRENTRY.writeUInt8(0, 2); // color count
ICONDIRENTRY.writeUInt8(0, 3); // reserved
ICONDIRENTRY.writeUInt16LE(1, 4); // planes
ICONDIRENTRY.writeUInt16LE(32, 6); // bitcount
ICONDIRENTRY.writeUInt32LE(pngSize, 8); // bytes in resource
const imageOffset = 6 + 16; // ICONDIR + one ICONDIRENTRY
ICONDIRENTRY.writeUInt32LE(imageOffset, 12);

const out = Buffer.concat([ICONDIR, ICONDIRENTRY, png]);

// ensure directories
fs.mkdirSync(path.dirname(out1), { recursive: true });
fs.mkdirSync(path.dirname(out2), { recursive: true });
fs.writeFileSync(out1, out);
fs.writeFileSync(out2, out);
console.log('Wrote', out1, 'and', out2);
