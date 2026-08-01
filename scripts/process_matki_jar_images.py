import os
import base64

cover_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785567566252.jpg"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

cover_b64 = get_b64(cover_p)

# Copy file into public/products
out_dir = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
with open(os.path.join(out_dir, "matki-jars-pack2-cover.jpg"), "wb") as f:
    with open(cover_p, "rb") as src:
        f.write(src.read())

content = f'''// Auto-generated base64 image data for 350ml Matki Jars Pack of 2 Cloudinary upload
export const MATKI_JAR_IMAGES_DATA = {{
  cover: "{cover_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/matki-jar-images-data.ts"
with open(out_path, "w") as out:
    out.write(content)

print(f"SUCCESS! Processed Matki Jars Pack of 2 image and created {out_path}!")
