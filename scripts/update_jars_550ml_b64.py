import os
import base64

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_dest = os.path.join(public_products, "jars-550ml-pack2-banner.jpg")
studio_dest = os.path.join(public_products, "jars-550ml-pack2-studio.jpg")
macro_dest = os.path.join(public_products, "jars-550ml-pack2-macro.jpg")
pantry_dest = os.path.join(public_products, "jars-550ml-pack2-desk.jpg")

# Write updated base64 data for 550ml Jars
ts_content = f'''export const JARS_550ML_IMAGES_DATA = {{
  banner: "{get_b64(banner_dest)}",
  studio: "{get_b64(studio_dest)}",
  macro: "{get_b64(macro_dest)}",
  desk: "{get_b64(pantry_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/jars-550ml-images-data.ts", "w") as f:
    f.write(ts_content)

print("SUCCESS! Updated 550ml jars base64 TS data module with cropped photos!")
