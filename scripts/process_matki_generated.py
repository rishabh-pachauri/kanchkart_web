import os
import base64
import shutil

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

cover_p = os.path.join(public_products, "matki-jars-pack2-cover.jpg")
dryfruits_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/matki_jars_dryfruits_1785636240720.jpg"
macro_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/matki_jars_macro_1785636267036.jpg"
pantry_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/matki_jars_pantry_1785636290282.jpg"

dryfruits_dest = os.path.join(public_products, "matki-jars-dryfruits-candy.jpg")
macro_dest = os.path.join(public_products, "matki-jars-macro-gold.jpg")
pantry_dest = os.path.join(public_products, "matki-jars-pantry-shelf.jpg")

if os.path.exists(dryfruits_src):
    shutil.copyfile(dryfruits_src, dryfruits_dest)
if os.path.exists(macro_src):
    shutil.copyfile(macro_src, macro_dest)
if os.path.exists(pantry_src):
    shutil.copyfile(pantry_src, pantry_dest)

# Write updated base64 data for Matki Jars
matki_ts = f'''export const MATKI_JAR_IMAGES_DATA = {{
  cover: "{get_b64(cover_p)}",
  filled: "{get_b64(dryfruits_dest)}",
  macro: "{get_b64(macro_dest)}",
  pantry: "{get_b64(pantry_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/matki-jar-images-data.ts", "w") as f:
    f.write(matki_ts)

print("SUCCESS! Copied 3 generated Matka Jar photos & updated base64 data module!")
