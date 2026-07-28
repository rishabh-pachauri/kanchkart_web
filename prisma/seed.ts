import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "founder@kanchkart.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-this-before-seeding";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: "KanchKart Admin",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash(adminPassword, 12)
    }
  });

  const bottles = await prisma.category.upsert({
    where: { slug: "glass-bottles" },
    update: { imageUrl: "/categories/glass-bottles.jpg" },
    create: {
      name: "Glass Bottles",
      slug: "glass-bottles",
      description: "Premium borosilicate bottles for daily hydration.",
      imageUrl: "/categories/glass-bottles.jpg",
      seoTitle: "Premium Glass Water Bottles",
      seoDesc: "Shop elegant borosilicate glass bottles from KanchKart."
    }
  });

  const storage = await prisma.category.upsert({
    where: { slug: "storage-jars" },
    update: { imageUrl: "/categories/storage-jars.jpg" },
    create: {
      name: "Storage Jars",
      slug: "storage-jars",
      description: "Airtight glass jars for refined kitchens and pantries.",
      imageUrl: "/categories/storage-jars.jpg",
      seoTitle: "Airtight Glass Storage Jars",
      seoDesc: "Organize your kitchen with premium airtight glass jars."
    }
  });

  const drinkware = await prisma.category.upsert({
    where: { slug: "drinkware" },
    update: { imageUrl: "/categories/drinkware.jpg" },
    create: {
      name: "Drinkware",
      slug: "drinkware",
      description: "Clear glass cups, mugs, tumblers, and everyday drinkware.",
      imageUrl: "/categories/drinkware.jpg",
      seoTitle: "Premium Glass Drinkware",
      seoDesc: "Bring refined glass drinkware into every serve."
    }
  });

  const signature = await prisma.collection.upsert({
    where: { slug: "signature-clear-glass" },
    update: { imageUrl: "/collections/signature-clear-glass.jpg" },
    create: {
      name: "Signature Clear Glass",
      slug: "signature-clear-glass",
      description: "A launch edit of clear, durable glassware for modern homes.",
      imageUrl: "/collections/signature-clear-glass.jpg",
      isFeatured: true
    }
  });

  const products = [
    {
      name: "Pure Glass Textured Water Bottle",
      slug: "pure-glass-textured-water-bottle",
      sku: "KK-BTL-PG-199",
      description:
        "Switch from plastic to pure glass. Crafted from high-grade borosilicate glass, this eco-friendly 750ml water bottle features an elegant textured beaded grip and a leak-proof stainless steel cap. Pure, safe, and sustainable for everyday hydration.",
      shortDescription: "Pure, safe, and sustainable 750ml glass water bottle with stainless steel cap.",
      categoryId: bottles.id,
      price: "199.00",
      compareAtPrice: "299.00",
      stock: 500,
      images: [
        "/products/pure-glass-water-bottle.jpg",
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"
      ],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      specifications: {
        capacity: "750 ml",
        material: "Borosilicate Glass",
        cap: "Stainless Steel Cap",
        care: "Dishwasher safe",
        safety: "Lead-free & BPA-free"
      }
    },
    {
      name: "Crystal Diamond Cut Glass Bottle (1000ml)",
      slug: "crystal-diamond-cut-glass-bottle-1000ml",
      sku: "KK-BTL-DC-299",
      description:
        "Elevate your dining table and office desk with our 1-Liter Crystal Diamond Cut Glass Bottle. Engineered with thick borosilicate glass, non-slip textured diamond pattern, and an airtight leak-proof cap.",
      shortDescription: "1-Liter premium diamond cut glass bottle for fridge & table serving.",
      categoryId: bottles.id,
      price: "299.00",
      compareAtPrice: "449.00",
      stock: 400,
      images: [
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80",
        "/products/pure-glass-water-bottle.jpg"
      ],
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      specifications: {
        capacity: "1000 ml",
        material: "Heavy-Duty Glass",
        care: "Dishwasher safe"
      }
    },
    {
      name: "Airtight Glass Pantry Storage Jar Set",
      slug: "airtight-glass-pantry-jar-set",
      sku: "KK-JAR-SET-04",
      description:
        "A four-piece airtight glass jar set for lentils, pasta, grains, spices, and elevated open-shelf storage.",
      shortDescription: "Four-piece airtight jar set for premium pantry storage.",
      categoryId: storage.id,
      price: "699.00",
      compareAtPrice: "999.00",
      stock: 150,
      images: [
        "/brand/pantry-jars.svg",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80"
      ],
      isFeatured: true,
      isBestSeller: true,
      specifications: {
        set: "4 jars",
        seal: "Airtight lid",
        material: "Clear glass"
      }
    },
    {
      name: "Hand-Blown Double Wall Glass Cup Set",
      slug: "hand-blown-double-wall-glass-cup-set",
      sku: "KK-CUP-DW-02",
      description:
        "Hand-blown double wall borosilicate glass cups that keep hot drinks warm and iced beverages chilled without condensation on your hands or table.",
      shortDescription: "Set of 2 heat-resistant double wall glass cups for espresso and tea.",
      categoryId: drinkware.id,
      price: "499.00",
      compareAtPrice: "749.00",
      stock: 200,
      images: [
        "/brand/drinkware.svg",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80"
      ],
      isFeatured: true,
      isNewArrival: true,
      specifications: {
        set: "2 cups",
        capacity: "350 ml",
        material: "Borosilicate glass"
      }
    }
  ];

  for (const product of products) {
    const { images, ...productData } = product;
    const saved = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        categoryId: productData.categoryId,
        collectionId: signature.id,
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        stock: productData.stock,
        isFeatured: productData.isFeatured,
        isBestSeller: productData.isBestSeller ?? false,
        isNewArrival: productData.isNewArrival ?? false
      },
      create: {
        ...productData,
        collectionId: signature.id,
        gstPercent: "18.00",
        dimensions: "Standard retail packaging",
        weightGrams: 900,
        lowStockAt: 8,
        seoTitle: productData.name,
        seoDesc: productData.shortDescription
      }
    });

    // Re-create ProductMedia with positions 0, 1, 2...
    if (images && images.length > 0) {
      await prisma.productMedia.deleteMany({ where: { productId: saved.id } });
      await prisma.productMedia.createMany({
        data: images.map((url, idx) => ({
          productId: saved.id,
          url,
          alt: `${productData.name} image ${idx + 1}`,
          position: idx
        }))
      });
    }
  }

  await prisma.cmsSection.upsert({
    where: { key: "home-hero" },
    update: {},
    create: {
      key: "home-hero",
      placement: "HOME_HERO",
      eyebrow: "Premium glassware for modern homes",
      title: "Luxury glassware, made beautifully practical.",
      body:
        "KanchKart curates durable bottles, jars, cups, and kitchen storage pieces with clean design, refined materials, and everyday utility.",
      imageUrl: "/brand/hero-glassware.svg",
      ctaLabel: "Shop glassware",
      ctaHref: "/shop",
      sortOrder: 1,
      metadata: {
        secondaryCtaLabel: "Explore collections",
        secondaryCtaHref: "/collections"
      }
    }
  });

  await prisma.cmsSection.upsert({
    where: { key: "why-kanchkart" },
    update: {},
    create: {
      key: "why-kanchkart",
      placement: "PROMOTION",
      title: "Designed for clarity, packed for care.",
      body:
        "Every piece is selected for premium finish, daily durability, secure packaging, and service that respects your home.",
      sortOrder: 2,
      metadata: {
        items: [
          "Premium borosilicate and lead-free glass",
          "Secure protective shipping across India",
          "GST invoices and easy order tracking",
          "COD and Razorpay support"
        ]
      }
    }
  });

  await prisma.siteSetting.upsert({
    where: { key: "brand" },
    update: {
      value: {
        name: "KanchKart",
        domain: "https://www.kanchkart.com",
        email: "kanchkart@gmail.com",
        phone: "+91 82184 41794",
        address: "Mahaveer Nagar, Firozabad, Uttar Pradesh - 283203, India",
        socials: {
          instagram: "https://instagram.com/kanchkart",
          facebook: "https://facebook.com/kanchkart"
        }
      }
    },
    create: {
      key: "brand",
      value: {
        name: "KanchKart",
        domain: "https://www.kanchkart.com",
        email: "kanchkart@gmail.com",
        phone: "+91 82184 41794",
        address: "Mahaveer Nagar, Firozabad, Uttar Pradesh - 283203, India",
        socials: {
          instagram: "https://instagram.com/kanchkart",
          facebook: "https://facebook.com/kanchkart"
        }
      }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
