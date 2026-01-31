const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createWorker() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10)

    const worker = await prisma.user.create({
      data: {
        name: 'Worker Test',
        email: 'worker@crowleeart.com',
        password: hashedPassword,
        role: 'worker',
        phone: '+34600111222',
        address: 'Test Address'
      }
    })

    console.log('\n✅ Worker creado exitosamente!\n')
    console.log('═'.repeat(60))
    console.log('👷 CREDENCIALES DEL WORKER:')
    console.log('═'.repeat(60))
    console.log(`📧 Email: ${worker.email}`)
    console.log(`🔑 Password: 123456`)
    console.log(`👤 Nombre: ${worker.name}`)
    console.log(`🆔 ID: ${worker.id}`)
    console.log('═'.repeat(60))
    console.log('\n🚀 Ahora puedes:')
    console.log('   1. Login en http://localhost:3000/login')
    console.log('   2. Usar: worker@crowleeart.com / 123456')
    console.log('   3. Ir a /dashboard/worker')
    console.log('   4. Probar Clock In/Out\n')

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('\n⚠️  El worker ya existe!')
      console.log('   Email: worker@crowleeart.com')
      console.log('   Password: 123456\n')
    } else {
      console.error('❌ Error:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createWorker()
