import os
import base64

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

banner_dest = os.path.join(public_products, "square-check-1l-banner.jpg")
studio_dest = os.path.join(public_products, "square-check-1l-studio.jpg")
macro_dest = os.path.join(public_products, "square-check-1l-macro.jpg")
desk_dest = os.path.join(public_products, "square-check-1l-desk.jpg")

# Write updated base64 data for 1L Square Check Bottle
ts_content = f'''export const SQUARE_CHECK_1L_IMAGES_DATA = {{
  banner: "{get_b64(banner_dest)}",
  studio: "{get_b64(studio_dest)}",
  macro: "{get_b64(macro_dest)}",
  desk: "{get_b64(desk_dest)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/square-check-1l-images-data.ts", "w") as f:
    f.write(ts_content)

print("SUCCESS! Updated 1L square check bottle base64 TS data module with cropped cap photo!")
