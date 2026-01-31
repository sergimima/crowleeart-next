const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    })

    console.log('\n📋 USUARIOS EN LA BASE DE DATOS:\n')
    console.log('═'.repeat(80))

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos')
    } else {
      users.forEach(user => {
        const roleEmoji = user.role === 'admin' ? '👑' : user.role === 'worker' ? '👷' : '👤'
        console.log(`${roleEmoji} ID: ${user.id}`)
        console.log(`   Nombre: ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Rol: ${user.role.toUpperCase()}`)
        console.log(`   Creado: ${user.createdAt.toLocaleDateString()}`)
        console.log('─'.repeat(80))
      })

      const adminCount = users.filter(u => u.role === 'admin').length
      const workerCount = users.filter(u => u.role === 'worker').length
      const clientCount = users.filter(u => u.role === 'client').length

      console.log(`\n📊 RESUMEN:`)
      console.log(`   👑 Admins: ${adminCount}`)
      console.log(`   👷 Workers: ${workerCount}`)
      console.log(`   👤 Clients: ${clientCount}`)
      console.log(`   📈 Total: ${users.length}`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
