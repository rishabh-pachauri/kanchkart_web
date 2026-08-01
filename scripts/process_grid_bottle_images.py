import os
import base64

cover_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785564585291.jpg"
studio_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/grid_bottle_cover_1785564630228.jpg"
macro_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/grid_bottle_macro_1785564649834.jpg"
desk_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/grid_bottle_desk_1785564670408.jpg"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

cover_b64 = get_b64(cover_p)
studio_b64 = get_b64(studio_p)
macro_b64 = get_b64(macro_p)
desk_b64 = get_b64(desk_p)

# Copy files directly into public/products
out_dir = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
with open(os.path.join(out_dir, "grid-glass-bottle-banner.jpg"), "wb") as f:
    with open(cover_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "grid-glass-bottle-studio.jpg"), "wb") as f:
    with open(studio_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "grid-glass-bottle-macro.jpg"), "wb") as f:
    with open(macro_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "grid-glass-bottle-desk.jpg"), "wb") as f:
    with open(desk_p, "rb") as src:
        f.write(src.read())

content = f'''// Auto-generated base64 image data for 500ml Grid Textured Bottle Cloudinary upload
export const GRID_BOTTLE_IMAGES_DATA = {{
  banner: "{cover_b64}",
  studio: "{studio_b64}",
  macro: "{macro_b64}",
  desk: "{desk_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/grid-bottle-images-data.ts"
with open(out_path, "w") as out:
    out.write(content)

print(f"SUCCESS! Processed 500ml Grid Bottle images and created {out_path}!")
