// prisma/seed.ts
// Archivo de semillas para poblar la base de datos con datos iniciales

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // 🧹 Limpiar datos existentes (opcional en desarrollo)
  await prisma.surveyResponse.deleteMany({});
  await prisma.survey.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({});

  // 👤 Crear usuarios de ejemplo
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.user.create({
    data: {
      name: 'Admin Crowlee',
      email: 'admin@crowleeart.com',
      password: hashedPassword,
      role: 'admin',
      address: 'Calle Principal 123, Ciudad',
      phone: '+34600123456',
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      name: 'Juan Pérez',
      email: 'juan@email.com',
      password: hashedPassword,
      role: 'client',
      address: 'Avenida Segunda 456, Ciudad',
      phone: '+34600654321',
    },
  });

  const clientUser2 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@email.com',
      password: hashedPassword,
      role: 'client',
      address: 'Plaza Mayor 789, Ciudad',
      phone: '+34600987654',
    },
  });

  // 🛠️ Crear servicios de ejemplo
  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: 'Plomería General',
        description: 'Reparación de tuberías, grifos y sistemas de agua',
        price: 45.0,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Electricidad Residencial',
        description: 'Instalación y reparación de sistemas eléctricos',
        price: 55.0,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Pintura Interior',
        description: 'Pintura de paredes y techos interiores',
        price: 35.0,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Carpintería',
        description: 'Reparación y construcción de muebles de madera',
        price: 40.0,
      },
    }),
    prisma.service.create({
      data: {
        title: 'Jardinería',
        description: 'Mantenimiento de jardines y paisajismo',
        price: 30.0,
      },
    }),
  ]);

  // 📅 Crear algunas reservas de ejemplo
  await Promise.all([
    prisma.booking.create({
      data: {
        serviceId: services[0].id,
        userId: clientUser.id,
        date: new Date('2025-10-25T10:00:00Z'),
        description: 'Reparación de fuga en el baño',
        phone: '+34600654321',
        status: 'confirmed',
      },
    }),
    prisma.booking.create({
      data: {
        serviceId: services[1].id,
        userId: clientUser2.id,
        date: new Date('2025-10-28T14:00:00Z'),
        description: 'Instalación de punto de luz en el salón',
        phone: '+34600987654',
        status: 'pending',
      },
    }),
  ]);

  // ⭐ Crear algunas reseñas de ejemplo
  await Promise.all([
    prisma.review.create({
      data: {
        userId: clientUser.id,
        rating: 5,
        comment: '¡Excelente servicio! Muy profesional y puntual.',
      },
    }),
    prisma.review.create({
      data: {
        userId: clientUser2.id,
        rating: 4,
        comment: 'Buen trabajo, aunque llegó un poco tarde.',
      },
    }),
  ]);

  // 💬 Crear algunos mensajes de ejemplo
  await Promise.all([
    prisma.message.create({
      data: {
        userId: clientUser.id,
        subject: 'Consulta sobre servicios',
        content: '¿Hacen trabajos de plomería los fines de semana?',
      },
    }),
    prisma.message.create({
      data: {
        userId: clientUser2.id,
        subject: 'Presupuesto pintura',
        content: 'Necesito un presupuesto para pintar una casa de 100m²',
      },
    }),
  ]);

  console.log('✅ Seed completado con éxito!');
  console.log(`👤 Usuarios creados: ${await prisma.user.count()}`);
  console.log(`🛠️ Servicios creados: ${await prisma.service.count()}`);
  console.log(`📅 Reservas creadas: ${await prisma.booking.count()}`);
  console.log(`⭐ Reseñas creadas: ${await prisma.review.count()}`);
  console.log(`💬 Mensajes creados: ${await prisma.message.count()}`);
  console.log('');
  console.log('🔑 Credenciales de prueba:');
  console.log('👨‍💼 Admin: admin@crowleeart.com / 123456');
  console.log('👤 Cliente: juan@email.com / 123456');
  console.log('👤 Cliente: maria@email.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
