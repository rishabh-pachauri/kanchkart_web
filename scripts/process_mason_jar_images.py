import os
import base64

banner_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/.user_uploaded/media__1785566498003.jpg"
studio_p = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f/mason_jar_studio_1785566602755.jpg"

def get_b64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
    return ""

banner_b64 = get_b64(banner_p)
studio_b64 = get_b64(studio_p)

# Copy files into public/products
out_dir = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
with open(os.path.join(out_dir, "mason-jar-banner.jpg"), "wb") as f:
    with open(banner_p, "rb") as src:
        f.write(src.read())

with open(os.path.join(out_dir, "mason-jar-studio.jpg"), "wb") as f:
    with open(studio_p, "rb") as src:
        f.write(src.read())

content = f'''// Auto-generated base64 image data for Glass Mason Jar Mug Cloudinary upload
export const MASON_JAR_IMAGES_DATA = {{
  banner: "{banner_b64}",
  studio: "{studio_b64}"
}};
'''

out_path = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/src/lib/mason-jar-images-data.ts"
with open(out_path, "w") as out:
    out.write(content)

print(f"SUCCESS! Processed Glass Mason Jar Mug images and created {out_path}!")
