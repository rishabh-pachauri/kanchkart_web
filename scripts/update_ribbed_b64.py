import os
import base64

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_dest = os.path.join(public_products, "ribbed-jars-pack2-banner.jpg")
studio_dest = os.path.join(public_products, "ribbed-jars-pack2-studio.jpg")
macro_dest = os.path.join(public_products, "ribbed-jars-pack2-macro.jpg")
pantry_dest = os.path.join(public_products, "ribbed-jars-pack2-pantry.jpg")

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

print("SUCCESS! Updated ribbed jar base64 TS data module with cropped studio photo!")
