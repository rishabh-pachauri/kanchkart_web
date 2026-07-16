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
    update: {},
    create: {
      name: "Glass Bottles",
      slug: "glass-bottles",
      description: "Premium borosilicate bottles for daily hydration.",
      imageUrl: "/brand/drinkware.svg",
      seoTitle: "Premium Glass Water Bottles",
      seoDesc: "Shop elegant borosilicate glass bottles from KanchKart."
    }
  });

  const storage = await prisma.category.upsert({
    where: { slug: "storage-jars" },
    update: {},
    create: {
      name: "Storage Jars",
      slug: "storage-jars",
      description: "Airtight glass jars for refined kitchens and pantries.",
      imageUrl: "/brand/pantry-jars.svg",
      seoTitle: "Airtight Glass Storage Jars",
      seoDesc: "Organize your kitchen with premium airtight glass jars."
    }
  });

  const drinkware = await prisma.category.upsert({
    where: { slug: "drinkware" },
    update: {},
    create: {
      name: "Drinkware",
      slug: "drinkware",
      description: "Clear glass cups, mugs, tumblers, and everyday drinkware.",
      imageUrl: "/brand/drinkware.svg",
      seoTitle: "Premium Glass Drinkware",
      seoDesc: "Bring refined glass drinkware into every serve."
    }
  });

  const signature = await prisma.collection.upsert({
    where: { slug: "signature-clear-glass" },
    update: {},
    create: {
      name: "Signature Clear Glass",
      slug: "signature-clear-glass",
      description: "A launch edit of clear, durable glassware for modern homes.",
      imageUrl: "/brand/hero-glassware.svg",
      isFeatured: true
    }
  });

  const products = [
    {
      name: "Borosilicate Glass Water Bottle",
      slug: "borosilicate-glass-water-bottle",
      sku: "KK-BTL-750-CLR",
      description:
        "A refined borosilicate glass bottle designed for everyday hydration, office desks, and premium gifting.",
      shortDescription: "Durable clear glass bottle for everyday hydration.",
      categoryId: bottles.id,
      price: "699.00",
      compareAtPrice: "899.00",
      stock: 64,
      image: "/brand/drinkware.svg",
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      specifications: {
        capacity: "750 ml",
        material: "Borosilicate glass",
        care: "Dishwasher safe",
        lid: "BPA-free cap"
      }
    },
    {
      name: "Airtight Glass Pantry Jar Set",
      slug: "airtight-glass-pantry-jar-set",
      sku: "KK-JAR-SET-04",
      description:
        "A four-piece airtight glass jar set for lentils, pasta, grains, spices, and elevated open-shelf storage.",
      shortDescription: "Four-piece airtight jar set for premium pantry storage.",
      categoryId: storage.id,
      price: "1499.00",
      compareAtPrice: "1899.00",
      stock: 38,
      image: "/brand/pantry-jars.svg",
      isFeatured: true,
      isBestSeller: true,
      specifications: {
        set: "4 jars",
        seal: "Airtight lid",
        material: "Clear glass",
        care: "Hand wash lids"
      }
    },
    {
      name: "Classic Glass Cup Set",
      slug: "classic-glass-cup-set",
      sku: "KK-CUP-SET-06",
      description:
        "Minimal glass cups with a balanced hand feel for water, cold brew, cocktails, and table styling.",
      shortDescription: "Six minimal clear glass cups for every table.",
      categoryId: drinkware.id,
      price: "999.00",
      compareAtPrice: "1299.00",
      stock: 52,
      image: "/brand/drinkware.svg",
      isFeatured: true,
      isNewArrival: true,
      specifications: {
        set: "6 cups",
        capacity: "300 ml",
        material: "Lead-free glass",
        care: "Dishwasher safe"
      }
    }
  ];

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId: product.categoryId,
        collectionId: signature.id,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller ?? false,
        isNewArrival: product.isNewArrival ?? false
      },
      create: {
        ...product,
        collectionId: signature.id,
        gstPercent: "18.00",
        dimensions: "Standard retail packaging",
        weightGrams: 900,
        lowStockAt: 8,
        seoTitle: product.name,
        seoDesc: product.shortDescription
      }
    });

    await prisma.productMedia.upsert({
      where: {
        id: `${saved.id}-primary`
      },
      update: {
        url: product.image,
        alt: product.name
      },
      create: {
        id: `${saved.id}-primary`,
        productId: saved.id,
        url: product.image,
        alt: product.name
      }
    });
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
    update: {},
    create: {
      key: "brand",
      value: {
        name: "KanchKart",
        domain: "https://www.kanchkart.com",
        email: "care@kanchkart.com",
        phone: "+91 90000 00000",
        address: "Configure business address from Admin > CMS",
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

