import os
from PIL import Image, ImageOps

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
banner_p = os.path.join(public_products, "ribbed-jars-pack2-banner.jpg")
output_p = os.path.join(public_products, "ribbed-jars-pack2-studio.jpg")

if os.path.exists(banner_p):
    img = Image.open(banner_p)
    width, height = img.size
    
    # The main jar is in the lower center.
    # Let's crop it:
    # Left: 25% to Right: 75%
    # Top: 48% to Bottom: 88%
    left = int(width * 0.28)
    top = int(height * 0.51)
    right = int(width * 0.65)
    bottom = int(height * 0.83)
    
    cropped = img.crop((left, top, right, bottom))
    
    # Resize and place on a clean white 1:1 background
    max_dim = max(cropped.size)
    square_img = Image.new("RGB", (max_dim, max_dim), (255, 255, 255))
    offset = ((max_dim - cropped.width) // 2, (max_dim - cropped.height) // 2)
    square_img.paste(cropped, offset)
    
    # Resize to standard 1000x1000 square
    square_img = square_img.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_img.save(output_p, "JPEG", quality=95)
    print("SUCCESS! Cropped modak ribbed jar and created studio view!")
else:
    print("Error: banner file not found!")
