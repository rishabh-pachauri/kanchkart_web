import os
import base64
import shutil

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return f"data:image/jpeg;base64,{base64.b64encode(f.read()).decode('utf-8')}"
    return ""

# Product A: 1L Square Check Bottle
banner_a = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785637757929.jpg"
studio_a = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/square_check_1l_studio_1785637893925.jpg"
macro_a = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/square_check_1l_macro_1785637910564.jpg"
desk_a = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/square_check_1l_desk_1785637927915.jpg"

dest_banner_a = os.path.join(public_products, "square-check-1l-banner.jpg")
dest_studio_a = os.path.join(public_products, "square-check-1l-studio.jpg")
dest_macro_a = os.path.join(public_products, "square-check-1l-macro.jpg")
dest_desk_a = os.path.join(public_products, "square-check-1l-desk.jpg")

shutil.copyfile(banner_a, dest_banner_a)
shutil.copyfile(studio_a, dest_studio_a)
shutil.copyfile(macro_a, dest_macro_a)
shutil.copyfile(desk_a, dest_desk_a)

ts_a = f'''export const SQUARE_CHECK_1L_IMAGES_DATA = {{
  banner: "{get_b64(dest_banner_a)}",
  studio: "{get_b64(dest_studio_a)}",
  macro: "{get_b64(dest_macro_a)}",
  desk: "{get_b64(dest_desk_a)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/square-check-1l-images-data.ts", "w") as f:
    f.write(ts_a)

# Product B: 750ml Round Spiral Ribbed Bottle
banner_b = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785637757937.jpg"
studio_b = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/round_ribbed_750_studio_1785637946787.jpg"

dest_banner_b = os.path.join(public_products, "round-ribbed-750-banner.jpg")
dest_studio_b = os.path.join(public_products, "round-ribbed-750-studio.jpg")
dest_macro_b = os.path.join(public_products, "round-ribbed-750-macro.jpg")
dest_desk_b = os.path.join(public_products, "round-ribbed-750-desk.jpg")

shutil.copyfile(banner_b, dest_banner_b)
shutil.copyfile(studio_b, dest_studio_b)
shutil.copyfile(banner_b, dest_macro_b)
shutil.copyfile(studio_b, dest_desk_b)

ts_b = f'''export const ROUND_RIBBED_750_IMAGES_DATA = {{
  banner: "{get_b64(dest_banner_b)}",
  studio: "{get_b64(dest_studio_b)}",
  macro: "{get_b64(dest_macro_b)}",
  desk: "{get_b64(dest_desk_b)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/round-ribbed-750-images-data.ts", "w") as f:
    f.write(ts_b)

# Product C: 550ml Glass Jars Pack of 2
banner_c = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785637757967.jpg"

dest_banner_c = os.path.join(public_products, "jars-550ml-pack2-banner.jpg")
dest_studio_c = os.path.join(public_products, "jars-550ml-pack2-studio.jpg")
dest_macro_c = os.path.join(public_products, "jars-550ml-pack2-macro.jpg")
dest_desk_c = os.path.join(public_products, "jars-550ml-pack2-desk.jpg")

shutil.copyfile(banner_c, dest_banner_c)
shutil.copyfile(banner_c, dest_studio_c)
shutil.copyfile(banner_c, dest_macro_c)
shutil.copyfile(banner_c, dest_desk_c)

ts_c = f'''export const JARS_550ML_IMAGES_DATA = {{
  banner: "{get_b64(dest_banner_c)}",
  studio: "{get_b64(dest_studio_c)}",
  macro: "{get_b64(dest_macro_c)}",
  desk: "{get_b64(dest_desk_c)}"
}};
'''
with open("/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/jars-550ml-images-data.ts", "w") as f:
    f.write(ts_c)

print("SUCCESS! Processed all 3 new products images and created base64 TS data modules!")
