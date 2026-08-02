import os
import base64
import shutil

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_p = os.path.join(public_products, "mason-jar-banner.jpg")
studio_p = os.path.join(public_products, "mason-jar-studio.jpg")
coffee_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/mason_jar_iced_coffee_1785636480220.jpg"
macro_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/mason_jar_macro_1785636505546.jpg"
lemonade_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/mason_jar_lemonade_1785636537340.jpg"

coffee_dest = os.path.join(public_products, "mason-jar-iced-coffee.jpg")
macro_dest = os.path.join(public_products, "mason-jar-macro.jpg")
lemonade_dest = os.path.join(public_products, "mason-jar-lemonade.jpg")

if os.path.exists(coffee_src):
    shutil.copyfile(coffee_src, coffee_dest)
if os.path.exists(macro_src):
    shutil.copyfile(macro_src, macro_dest)
if os.path.exists(lemonade_src):
    shutil.copyfile(lemonade_src, lemonade_dest)

# Write updated base64 data for Mason Jar (4 photos: banner, studio, coffee, lemonade)
mason_ts = f'''export const MASON_JAR_IMAGES_DATA = {{
  banner: "{get_b64(banner_p)}",
  studio: "{get_b64(studio_p)}",
  drink: "{get_b64(coffee_dest)}",
  macro: "{get_b64(lemonade_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/mason-jar-images-data.ts", "w") as f:
    f.write(mason_ts)

print("SUCCESS! Copied 3 generated Mason Jar photos & updated base64 data module!")
