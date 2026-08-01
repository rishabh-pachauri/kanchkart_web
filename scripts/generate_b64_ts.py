import os
import base64

brain_dir = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f"
cover_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products/pure-glass-water-bottle.jpg"

desk_path = ""
macro_path = ""
kitchen_path = ""

for f in os.listdir(brain_dir):
    if f.startswith("bottle_lifestyle_desk"):
        desk_path = os.path.join(brain_dir, f)
    elif f.startswith("bottle_macro_cap"):
        macro_path = os.path.join(brain_dir, f)
    elif f.startswith("bottle_kitchen_counter"):
        kitchen_path = os.path.join(brain_dir, f)

def get_b64(file_path):
    if os.path.exists(file_path):
        with open(file_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

cover_b64 = get_b64(cover_path)
desk_b64 = get_b64(desk_path)
macro_b64 = get_b64(macro_path)
kitchen_b64 = get_b64(kitchen_path)

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

print(f"Generated {out_path} with sizes: Cover={len(cover_b64)}, Desk={len(desk_b64)}, Macro={len(macro_b64)}, Kitchen={len(kitchen_b64)}")
