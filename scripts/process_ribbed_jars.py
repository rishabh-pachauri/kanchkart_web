import os
import base64
import shutil

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785636991634.jpg"
studio_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/ribbed_jar_studio_1785637076029.jpg"
macro_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/ribbed_jar_macro_1785637093882.jpg"
pantry_src = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/ribbed_jar_pantry_1785637113569.jpg"

banner_dest = os.path.join(public_products, "ribbed-jars-pack2-banner.jpg")
studio_dest = os.path.join(public_products, "ribbed-jars-pack2-studio.jpg")
macro_dest = os.path.join(public_products, "ribbed-jars-pack2-macro.jpg")
pantry_dest = os.path.join(public_products, "ribbed-jars-pack2-pantry.jpg")

if os.path.exists(banner_p):
    shutil.copyfile(banner_p, banner_dest)
if os.path.exists(studio_src):
    shutil.copyfile(studio_src, studio_dest)
if os.path.exists(macro_src):
    shutil.copyfile(macro_src, macro_dest)
if os.path.exists(pantry_src):
    shutil.copyfile(pantry_src, pantry_dest)

# Write updated base64 data for Ribbed Jars
ribbed_ts = f'''export const RIBBED_JAR_IMAGES_DATA = {{
  banner: "{get_b64(banner_dest)}",
  studio: "{get_b64(studio_dest)}",
  macro: "{get_b64(macro_dest)}",
  pantry: "{get_b64(pantry_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/ribbed-jar-images-data.ts", "w") as f:
    f.write(ribbed_ts)

print("SUCCESS! Copied 4 Ribbed Jars photos & created base64 data module!")
