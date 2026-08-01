import os
import base64

cover_p = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products/pure-glass-water-bottle.jpg"
desk_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/bottle_lifestyle_desk_1785561887209.jpg"
macro_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/bottle_macro_cap_1785561900879.jpg"
kitchen_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/bottle_kitchen_counter_1785561914560.jpg"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

cover_b64 = get_b64(cover_p)
desk_b64 = get_b64(desk_p)
macro_b64 = get_b64(macro_p)
kitchen_b64 = get_b64(kitchen_p)

# Also copy files directly into public/products
out_dir = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
with open(os.path.join(out_dir, "pure-glass-bottle-desk.jpg"), "wb") as f:
    with open(desk_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "pure-glass-bottle-macro.jpg"), "wb") as f:
    with open(macro_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "pure-glass-bottle-kitchen.jpg"), "wb") as f:
    with open(kitchen_p, "rb") as src:
        f.write(src.read())

content = f'''// Auto-generated base64 image data for Cloudinary upload
export const BOTTLE_IMAGES_DATA = {{
  cover: "{cover_b64}",
  desk: "{desk_b64}",
  macro: "{macro_b64}",
  kitchen: "{kitchen_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/bottle-images-data.ts"
with open(out_path, "w") as out:
    out.write(content)

print(f"SUCCESS! Created {out_path} and copied files into public/products!")
