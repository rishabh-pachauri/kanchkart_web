import os
import base64

banner_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785565568282.jpg"
studio_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/beer_mug_studio_1785565629593.jpg"
macro_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/beer_mug_macro_1785565657387.jpg"
bar_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/beer_mug_bar_1785565679644.jpg"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

banner_b64 = get_b64(banner_p)
studio_b64 = get_b64(studio_p)
macro_b64 = get_b64(macro_p)
bar_b64 = get_b64(bar_p)

# Copy files into public/products
out_dir = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
with open(os.path.join(out_dir, "beer-mug-banner.jpg"), "wb") as f:
    with open(banner_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "beer-mug-studio.jpg"), "wb") as f:
    with open(studio_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "beer-mug-macro.jpg"), "wb") as f:
    with open(macro_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "beer-mug-bar.jpg"), "wb") as f:
    with open(bar_p, "rb") as src:
        f.write(src.read())

content = f'''// Auto-generated base64 image data for 450ml Beer Mug Cloudinary upload
export const BEER_MUG_IMAGES_DATA = {{
  banner: "{banner_b64}",
  studio: "{studio_b64}",
  macro: "{macro_b64}",
  bar: "{bar_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/beer-mug-images-data.ts"
with open(out_path, "w") as out:
    out.write(content)

print(f"SUCCESS! Processed 450ml Beer Mug images and created {out_path}!")
