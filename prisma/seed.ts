import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@retail.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@retail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create shipper user
  const shipperPassword = await bcrypt.hash('shipper123', 10);
  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@retail.com' },
    update: {},
    create: {
      name: 'Shipper User',
      email: 'shipper@retail.com',
      password: shipperPassword,
      role: 'SHIPPER',
    },
  });

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@retail.com' },
    update: {},
    create: {
      name: 'Jane Customer',
      email: 'customer@retail.com',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  });

  console.log('Users created:', { admin: admin.email, shipper: shipper.email, customer: customer.email });

  // Create products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium sound quality with active noise cancellation. Up to 30 hours battery life.',
      price: 89.99,
      stock: 25,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    },
    {
      name: 'Smartphone Stand & Charger',
      description: '3-in-1 wireless charging stand for phone, watch, and earbuds.',
      price: 45.99,
      stock: 15,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400',
    },
    {
      name: 'USB-C Hub 7-in-1',
      description: 'Expand your laptop connectivity with HDMI, USB 3.0, SD card reader, and more.',
      price: 34.99,
      stock: 30,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400',
    },
    {
      name: 'Men\'s Classic Polo Shirt',
      description: 'Premium cotton polo shirt, available in multiple colors. Machine washable.',
      price: 29.99,
      stock: 50,
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400',
    },
    {
      name: 'Women\'s Running Sneakers',
      description: 'Lightweight and breathable running shoes with cushioned sole. Sizes 5-11.',
      price: 65.99,
      stock: 20,
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    },
    {
      name: 'Denim Jacket',
      description: 'Classic denim jacket with modern fit. Perfect for layering in any season.',
      price: 79.99,
      stock: 18,
      category: 'Clothing',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    },
    {
      name: 'Organic Green Tea (50 bags)',
      description: 'Premium organic green tea from Japan. Rich in antioxidants, smooth flavor.',
      price: 12.99,
      stock: 100,
      category: 'Food',
      imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
    },
    {
      name: 'Dark Chocolate Gift Box',
      description: 'Assorted premium dark chocolates. 70% cacao, fair trade certified. 500g.',
      price: 24.99,
      stock: 40,
      category: 'Food',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400',
    },
    {
      name: 'Artisan Coffee Beans 1kg',
      description: 'Single-origin Ethiopian coffee beans, medium roast. Rich, fruity notes.',
      price: 18.99,
      stock: 3,
      category: 'Food',
      imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    },
    {
      name: 'Smart LED Desk Lamp',
      description: 'Adjustable color temperature and brightness. USB charging port included.',
      price: 42.99,
      stock: 12,
      category: 'Electronics',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`${products.length} products created`);

  // Create sample expenses
  const now = new Date();
  const expenses = [
    {
      title: 'Office Rent',
      category: 'Operations',
      amount: 2500.00,
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      notes: 'Monthly office rent',
    },
    {
      title: 'Inventory Restocking',
      category: 'Inventory',
      amount: 4800.00,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: 'Electronics restock from supplier',
    },
    {
      title: 'Marketing Ads',
      category: 'Marketing',
      amount: 750.00,
      date: new Date(now.getFullYear(), now.getMonth(), 8),
      notes: 'Social media campaign',
    },
    {
      title: 'Shipping Supplies',
      category: 'Operations',
      amount: 320.00,
      date: new Date(now.getFullYear(), now.getMonth(), 12),
      notes: 'Boxes, tape, packaging materials',
    },
    {
      title: 'Staff Salaries',
      category: 'Payroll',
      amount: 8500.00,
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      notes: 'Monthly payroll',
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }

  console.log(`${expenses.length} expenses created`);

  // Create a welcome notification for admin
  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Welcome to RetailHub',
      message: 'Your admin account is ready. Start managing your store!',
      type: 'INFO',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
