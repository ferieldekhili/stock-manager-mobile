import { prisma } from '../src/lib/prisma';

const products = [
  {
    name: 'Ordinateur portable Dell Latitude',
    reference: 'INFO-LAT-001',
    description: 'Ordinateur portable destiné aux équipes administratives.',
    category: 'Informatique',
    quantity: 12,
    alertThreshold: 5,
  },
  {
    name: 'Écran 24 pouces',
    reference: 'INFO-ECR-002',
    description: 'Écran Full HD avec connectiques HDMI et DisplayPort.',
    category: 'Informatique',
    quantity: 4,
    alertThreshold: 5,
  },
  {
    name: 'Clavier sans fil',
    reference: 'INFO-CLA-003',
    description: null,
    category: 'Informatique',
    quantity: 0,
    alertThreshold: 3,
  },
  {
    name: 'Perceuse-visseuse',
    reference: 'OUT-PER-001',
    description: 'Perceuse sans fil avec deux batteries.',
    category: 'Outillage',
    quantity: 7,
    alertThreshold: 2,
  },
  {
    name: 'Jeu de tournevis',
    reference: 'OUT-TOU-002',
    description: 'Jeu de six tournevis plats et cruciformes.',
    category: 'Outillage',
    quantity: 2,
    alertThreshold: 2,
  },
  {
    name: 'Gants de protection',
    reference: 'SEC-GAN-001',
    description: 'Gants de manutention renforcés, taille unique.',
    category: 'Sécurité',
    quantity: 25,
    alertThreshold: 10,
  },
  {
    name: 'Lunettes de protection',
    reference: 'SEC-LUN-002',
    description: null,
    category: 'Sécurité',
    quantity: 0,
    alertThreshold: 5,
  },
  {
    name: 'Ramette papier A4',
    reference: 'BUR-PAP-001',
    description: 'Ramette de 500 feuilles, 80 g/m².',
    category: 'Fournitures',
    quantity: 40,
    alertThreshold: 15,
  },
  {
    name: 'Cartouche imprimante noire',
    reference: 'BUR-ENC-002',
    description: 'Cartouche haute capacité pour imprimante laser.',
    category: 'Fournitures',
    quantity: 3,
    alertThreshold: 4,
  },
] as const;

async function seed() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { reference: product.reference },
      update: product,
      create: product,
    });
  }

  console.info(`${products.length} products seeded`);
}

seed()
  .catch((error: unknown) => {
    console.error('Unable to seed products', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
