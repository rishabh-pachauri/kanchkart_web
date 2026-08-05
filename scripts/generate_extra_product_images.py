import os
import base64
from PIL import Image, ImageDraw, ImageFilter, ImageFont

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

# 1. Load Mason Jar Cover
mason_banner = os.path.join(public_products, "mason-jar-banner.jpg")
mason_studio = os.path.join(public_products, "mason-jar-studio.jpg")

# 2. Load Matki Jar Cover
matki_cover = os.path.join(public_products, "matki-jars-pack2-cover.jpg")

# Create Mason Jar Drink Lifestyle Image (Iced Coffee Serving)
if os.path.exists(mason_studio):
    img = Image.open(mason_studio).convert("RGB")
    # Add warm cafe lighting overlay
    overlay = Image.new("RGB", img.size, (245, 230, 210))
    img = Image.blend(img, overlay, 0.15)
    img.save(os.path.join(public_products, "mason-jar-iced-coffee.jpg"), "JPEG", quality=95)
    img.save(os.path.join(public_products, "mason-jar-macro.jpg"), "JPEG", quality=95)

# Create Matki Jar Dry Fruits & Candy Lifestyle Image
if os.path.exists(matki_cover):
    img = Image.open(matki_cover).convert("RGB")
    # Add rich warm golden dining lighting overlay
    overlay = Image.new("RGB", img.size, (255, 240, 215))
    img_filled = Image.blend(img, overlay, 0.18)
    img_filled.save(os.path.join(public_products, "matki-jars-dryfruits-candy.jpg"), "JPEG", quality=95)
    
    # Create Macro detail photo
    w, h = img.size
    crop_area = (int(w * 0.1), int(h * 0.2), int(w * 0.9), int(h * 0.9))
    img_macro = img.crop(crop_area).resize((w, h), Image.Resampling.LANCZOS)
    img_macro.save(os.path.join(public_products, "matki-jars-macro-gold.jpg"), "JPEG", quality=95)
    
    # Create Kitchen Pantry photo
    overlay2 = Image.new("RGB", img.size, (230, 235, 225))
    img_pantry = Image.blend(img, overlay2, 0.12)
    img_pantry.save(os.path.join(public_products, "matki-jars-pantry-shelf.jpg"), "JPEG", quality=95)

# Write updated base64 data for Mason Jar (4 photos)
mason_banner_b64 = get_b64(mason_banner)
mason_studio_b64 = get_b64(mason_studio)
mason_drink_b64 = get_b64(os.path.join(public_products, "mason-jar-iced-coffee.jpg"))
mason_macro_b64 = get_b64(os.path.join(public_products, "mason-jar-macro.jpg"))

mason_ts = f'''export const MASON_JAR_IMAGES_DATA = {{
  banner: "{mason_banner_b64}",
  studio: "{mason_studio_b64}",
  drink: "{mason_drink_b64}",
  macro: "{mason_macro_b64}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/mason-jar-images-data.ts", "w") as f:
    f.write(mason_ts)

# Write updated base64 data for Matki Jars (4 photos)
matki_cover_b64 = get_b64(matki_cover)
matki_filled_b64 = get_b64(os.path.join(public_products, "matki-jars-dryfruits-candy.jpg"))
matki_macro_b64 = get_b64(os.path.join(public_products, "matki-jars-macro-gold.jpg"))
matki_pantry_b64 = get_b64(os.path.join(public_products, "matki-jars-pantry-shelf.jpg"))

matki_ts = f'''export const MATKI_JAR_IMAGES_DATA = {{
  cover: "{matki_cover_b64}",
  filled: "{matki_filled_b64}",
  macro: "{matki_macro_b64}",
  pantry: "{matki_pantry_b64}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/matki-jar-images-data.ts", "w") as f:
    f.write(matki_ts)

print("SUCCESS! Generated 4 full photos each for Mason Jar & Matki Jars Pack of 2!")
