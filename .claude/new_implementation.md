Resumen del Sistema a Implementar

CLAUDE PLAN: C:\Users\seku_\.claude\plans\purrfect-giggling-cosmos.md

Objetivo principal: Sistema de control de jornada laboral (clock in/out) con geolocalización

Componentes:
Nuevo rol "worker" (trabajador)

Se añade a los roles existentes (client, admin)
Sistema de fichaje (Clock In/Out)

Workers pueden registrar entrada y salida
Captura automática de geolocalización al fichar
Workers pueden añadir notas opcionales (ej: "Salí 2h antes por lluvia")
Gestión de Time Logs (registros de tiempo)

Cada registro guarda:
Hora de entrada y salida
Ubicación GPS de entrada y salida
Nota del worker
Nota del admin
Estado: pending/approved/rejected
Panel Worker

Botón grande para Clock In/Out
Muestra estado actual (si está fichado o no)
Campo para añadir notas opcionales
Tabla con historial de sus propios fichajes
Ver notas del admin y estado de aprobación
Panel Admin

Ver todos los fichajes de todos los workers
Ver ubicaciones GPS de entrada/salida
Ver notas de los workers
Aprobar/rechazar fichajes
Añadir notas administrativas
Cambiar estado de los registros
Flujo:
Worker hace clock in → pide permiso de ubicación → guarda hora + GPS + nota opcional
Worker hace clock out → captura GPS de salida + nota opcional
Admin revisa → lee notas del worker → aprueba/rechaza → añade sus notas
Tecnología:
Backend: Nueva tabla TimeLog en base de datos
Frontend: Geolocalización del navegador (navigator.geolocation)
Coordenadas guardadas como JSON en string

