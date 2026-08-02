import os
from PIL import Image

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
banner_p = os.path.join(public_products, "round-ribbed-750-banner.jpg")

dest_studio = os.path.join(public_products, "round-ribbed-750-studio.jpg")
dest_macro = os.path.join(public_products, "round-ribbed-750-macro.jpg")
dest_desk = os.path.join(public_products, "round-ribbed-750-desk.jpg")

if os.path.exists(banner_p):
    img = Image.open(banner_p)
    width, height = img.size
    
    # 1. Studio View: Crop the entire bottle from the center
    # Box coordinates (Left, Top, Right, Bottom)
    left_s = int(width * 0.28)
    top_s = int(height * 0.12)
    right_s = int(width * 0.70)
    bottom_s = int(height * 0.94)
    
    bottle_crop = img.crop((left_s, top_s, right_s, bottom_s))
    max_dim_s = max(bottle_crop.size)
    square_s = Image.new("RGB", (max_dim_s, max_dim_s), (255, 255, 255))
    offset_s = ((max_dim_s - bottle_crop.width) // 2, (max_dim_s - bottle_crop.height) // 2)
    square_s.paste(bottle_crop, offset_s)
    square_s = square_s.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_s.save(dest_studio, "JPEG", quality=95)
    
    # 2. Macro Cap View: Crop the neck & cap region of the bottle
    left_m = int(width * 0.35)
    top_m = int(height * 0.12)
    right_m = int(width * 0.63)
    bottom_m = int(height * 0.38)
    
    cap_crop = img.crop((left_m, top_m, right_m, bottom_m))
    max_dim_m = max(cap_crop.size)
    square_m = Image.new("RGB", (max_dim_m, max_dim_m), (255, 255, 255))
    offset_m = ((max_dim_m - cap_crop.width) // 2, (max_dim_m - cap_crop.height) // 2)
    square_m.paste(cap_crop, offset_m)
    square_m = square_m.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_m.save(dest_macro, "JPEG", quality=95)
    
    # 3. Lifestyle Close-up: Crop a diagonal section showing the spiral ribbed body details
    left_d = int(width * 0.32)
    top_d = int(height * 0.35)
    right_d = int(width * 0.68)
    bottom_d = int(height * 0.75)
    
    body_crop = img.crop((left_d, top_d, right_d, bottom_d))
    max_dim_d = max(body_crop.size)
    square_d = Image.new("RGB", (max_dim_d, max_dim_d), (255, 255, 255))
    offset_d = ((max_dim_d - body_crop.width) // 2, (max_dim_d - body_crop.height) // 2)
    square_d.paste(body_crop, offset_d)
    square_d = square_d.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_d.save(dest_desk, "JPEG", quality=95)
    
    print("SUCCESS! Generated 3 distinct cropped images for Round Spiral Ribbed Bottle!")
else:
    print("Error: banner file not found!")
