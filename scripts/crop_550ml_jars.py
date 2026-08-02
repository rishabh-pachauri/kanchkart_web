import os
from PIL import Image

public_products = "/Users/admin/.gemini/antigravity/scratch/kanchkart_web/public/products"
banner_p = os.path.join(public_products, "jars-550ml-pack2-banner.jpg")

dest_studio = os.path.join(public_products, "jars-550ml-pack2-studio.jpg")
dest_macro = os.path.join(public_products, "jars-550ml-pack2-macro.jpg")
dest_desk = os.path.join(public_products, "jars-550ml-pack2-desk.jpg")

if os.path.exists(banner_p):
    img = Image.open(banner_p)
    width, height = img.size
    
    # 1. Studio/Single Jar View: Crop the Cashew Jar (sitting on the right side of the board)
    # Box coordinates (Left, Top, Right, Bottom)
    left_c = int(width * 0.47)
    top_c = int(height * 0.53)
    right_c = int(width * 0.76)
    bottom_c = int(height * 0.87)
    
    cashew_jar = img.crop((left_c, top_c, right_c, bottom_c))
    max_dim_c = max(cashew_jar.size)
    square_c = Image.new("RGB", (max_dim_c, max_dim_c), (255, 255, 255))
    offset_c = ((max_dim_c - cashew_jar.width) // 2, (max_dim_c - cashew_jar.height) // 2)
    square_c.paste(cashew_jar, offset_c)
    square_c = square_c.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_c.save(dest_studio, "JPEG", quality=95)
    
    # 2. Macro Close-Up: Crop the Almond Jar (sitting on the left side of the board)
    left_a = int(width * 0.18)
    top_a = int(height * 0.53)
    right_a = int(width * 0.46)
    bottom_a = int(height * 0.87)
    
    almond_jar = img.crop((left_a, top_a, right_a, bottom_a))
    max_dim_a = max(almond_jar.size)
    square_a = Image.new("RGB", (max_dim_a, max_dim_a), (255, 255, 255))
    offset_a = ((max_dim_a - almond_jar.width) // 2, (max_dim_a - almond_jar.height) // 2)
    square_a.paste(almond_jar, offset_a)
    square_a = square_a.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_a.save(dest_macro, "JPEG", quality=95)
    
    # 3. Kitchen/Pantry/Lady View: Crop the upper portion showing the lady holding the jar
    left_l = int(width * 0.3)
    top_l = int(height * 0.0)
    right_l = int(width * 0.85)
    bottom_l = int(height * 0.55)
    
    lady_jar = img.crop((left_l, top_l, right_l, bottom_l))
    max_dim_l = max(lady_jar.size)
    square_l = Image.new("RGB", (max_dim_l, max_dim_l), (255, 255, 255))
    offset_l = ((max_dim_l - lady_jar.width) // 2, (max_dim_l - lady_jar.height) // 2)
    square_l.paste(lady_jar, offset_l)
    square_l = square_l.resize((1000, 1000), Image.Resampling.LANCZOS)
    square_l.save(dest_desk, "JPEG", quality=95)
    
    print("SUCCESS! Generated 3 distinct matching cropped images for 550ml storage jars!")
else:
    print("Error: banner file not found!")
