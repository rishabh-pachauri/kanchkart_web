import os
import base64

brain_dir = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f"
public_cover = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products/pure-glass-water-bottle.jpg"

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

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as image_file:
            return "data:image/jpeg;base64," + base64.b64encode(image_file.read()).decode("utf-8")
    return ""

cover_b64 = get_b64(public_cover)
desk_b64 = get_b64(desk_path)
macro_b64 = get_b64(macro_path)
kitchen_b64 = get_b64(kitchen_path)

content = f'''export const BOTTLE_IMAGES_BASE64 = {{
  cover: "{cover_b64}",
  desk: "{desk_b64}",
  macro: "{macro_b64}",
  kitchen: "{kitchen_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/bottle-images-base64.ts"
with open(out_path, "w") as f:
    f.write(content)

print(f"Generated {out_path} successfully!")
