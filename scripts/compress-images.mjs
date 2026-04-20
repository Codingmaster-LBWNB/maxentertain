import sharp from 'sharp'
import { readdir, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HD_DIR = path.join(__dirname, '..', 'public', 'Airbnb picture', '1975 Point Nepean Road- HD')
const OUT_DIR = path.join(HD_DIR, 'compressed')

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

async function main() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  const files = await readdir(HD_DIR)
  const images = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()))

  console.log(`Compressing ${images.length} images → ${OUT_DIR}`)

  for (const file of images) {
    const src = path.join(HD_DIR, file)
    const outName = path.parse(file).name + '.jpg'
    const dest = path.join(OUT_DIR, outName)

    try {
      await sharp(src)
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toFile(dest)
      console.log(`  ✓ ${file} → ${outName}`)
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`)
    }
  }

  console.log('\nDone. Add these to imagesCompressed in config/property.ts:')
  for (const file of images) {
    const outName = path.parse(file).name + '.jpg'
    console.log(`  "/Airbnb picture/1975 Point Nepean Road- HD/compressed/${outName}",`)
  }
}

main()
