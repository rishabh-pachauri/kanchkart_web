import os
from PIL import Image

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
banner_p = os.path.join(public_products, "square-check-1l-banner.jpg")
macro_dest = os.path.join(public_products, "square-check-1l-macro.jpg")

if os.path.exists(banner_p):
    img = Image.open(banner_p)
    width, height = img.size
    
    # Let's crop the neck and cap region of the square check bottle
    # In the poster, the bottle is in the center-left.
    # Cap coordinates (Left, Top, Right, Bottom)
    left = int(width * 0.28)
    top = int(height * 0.10)
    right = int(width * 0.48)
    bottom = int(height * 0.32)
    
    cap_crop = img.crop((left, top, right, bottom))
    max_dim = max(cap_crop.size)
    square_img = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
    offset = ((max_dim - cap_crop.width) // 2, (max_dim - cap_crop.height) // 2)
    square_img.paste(cap_crop, offset)
    
    square_img = square_img.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_img.save(macro_dest, "JPEG", quality=95)
    print("SUCCESS! Cropped cap close-up from banner poster!")
else:
    print("Error: banner file not found!")
