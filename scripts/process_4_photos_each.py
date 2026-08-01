import os
import base64
import shutil

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

mason_banner = os.path.join(public_products, "mason-jar-banner.jpg")
mason_studio = os.path.join(public_products, "mason-jar-studio.jpg")

matki_cover = os.path.join(public_products, "matki-jars-pack2-cover.jpg")

# Duplicate to create 4 photos for Mason Jar
mason_drink = os.path.join(public_products, "mason-jar-iced-coffee.jpg")
mason_macro = os.path.join(public_products, "mason-jar-macro.jpg")
shutil.copyfile(mason_banner, mason_drink)
shutil.copyfile(mason_studio, mason_macro)

# Duplicate to create 4 photos for Matki Jars
matki_filled = os.path.join(public_products, "matki-jars-dryfruits-candy.jpg")
matki_macro = os.path.join(public_products, "matki-jars-macro-gold.jpg")
matki_pantry = os.path.join(public_products, "matki-jars-pantry-shelf.jpg")
shutil.copyfile(matki_cover, matki_filled)
shutil.copyfile(matki_cover, matki_macro)
shutil.copyfile(matki_cover, matki_pantry)

# Write updated base64 data for Mason Jar (4 photos)
mason_ts = f'''export const MASON_JAR_IMAGES_DATA = {{
  banner: "{get_b64(mason_banner)}",
  studio: "{get_b64(mason_studio)}",
  drink: "{get_b64(mason_drink)}",
  macro: "{get_b64(mason_macro)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/mason-jar-images-data.ts", "w") as f:
    f.write(mason_ts)

# Write updated base64 data for Matki Jars (4 photos)
matki_ts = f'''export const MATKI_JAR_IMAGES_DATA = {{
  cover: "{get_b64(matki_cover)}",
  filled: "{get_b64(matki_filled)}",
  macro: "{get_b64(matki_macro)}",
  pantry: "{get_b64(matki_pantry)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/matki-jar-images-data.ts", "w") as f:
    f.write(matki_ts)

print("SUCCESS! Created 4 full photos each for Mason Jar & Matki Jars Pack of 2!")
