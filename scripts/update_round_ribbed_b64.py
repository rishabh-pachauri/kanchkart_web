import os
import base64

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_dest = os.path.join(public_products, "round-ribbed-750-banner.jpg")
studio_dest = os.path.join(public_products, "round-ribbed-750-studio.jpg")
macro_dest = os.path.join(public_products, "round-ribbed-750-macro.jpg")
desk_dest = os.path.join(public_products, "round-ribbed-750-desk.jpg")

# Write updated base64 data for 750ml Round Spiral Ribbed Bottle
ts_content = f'''export const ROUND_RIBBED_750_IMAGES_DATA = {{
  banner: "{get_b64(banner_dest)}",
  studio: "{get_b64(studio_dest)}",
  macro: "{get_b64(macro_dest)}",
  desk: "{get_b64(desk_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/round-ribbed-750-images-data.ts", "w") as f:
    f.write(ts_content)

print("SUCCESS! Updated 750ml Round Spiral Ribbed Bottle base64 TS data module with cropped photos!")
