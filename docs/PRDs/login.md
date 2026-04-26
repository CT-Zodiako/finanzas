# PRD: Login y Autenticación

## Problema

Cada persona cercana al núcleo familiar necesita gestionar SUS propias finanzas de forma privada. Actualmente, cualquiera con acceso a la URL ve todos los datos de todos. No existe separación de datos por usuario, ni control de acceso.

## Usuarios

**Actor Primario**: Personas cercanas al núcleo familiar (familia, pareja, amigos cercanos) que quieren gestionar sus propias finanzas de forma independiente y privada.

**Actor Admin**: Un usuario administrador que puede gestionar (crear, desactivar) cuentas de otros usuarios.

## Solución

### Flujo de Autenticación

1. **Auto-registro**: El usuario entra a la app, ingresa su nombre, email y contraseña. El sistema crea su cuenta y la activa inmediatamente.

2. **Login**: El usuario ingresa email + contraseña. El sistema verifica y crea una sesión.

3. **Sesión persistente**: El navegador "recuerda" al usuario con un token JWT. Al reabrir la app, está logueado automáticamente.

4. **Logout**: El usuario puede cerrar sesión, invalidando su token.

### Aislamiento de Datos

- Cada usuario vé SOLO sus propias cuentas, transacciones, categorías y metas.
- Los datos de un usuario NO son visibles para otros usuarios.
- El acceso a datos se filtra a nivel de consulta: `WHERE user_id = current_user`.

### Modelo de Usuario

| Campo | Tipo | Descripción |
|-------|------|------------|
| `id` | UUID | Identificador único |
| `email` | string | Email único del usuario |
| `password_hash` | string | Contraseña hasheada (bcrypt) |
| `nombre` | string | Nombre del usuario |
| `rol` | enum | `usuario` / `admin` |
| `activo` | bool | Si la cuenta está activa |
| `creado_en` | datetime | Fecha de creación |

## Alcance

### Dentro del Alcance

- [ ] Registro de usuarios (email, nombre, contraseña)
- [ ] Login (email + contraseña)
- [ ] Logout (invalidar sesión)
- [ ] Sesiones persistentes (JWT en cookies)
- [ ] Aislamiento de datos por usuario (filtro en todas las consultas)
- [ ] Expiración de tokens (24 horas)
- [ ] Renovación automática de token mientras la sesión está activa
- [ ] Bloqueo de cuenta tras 5 intentos fallidos consecutivos (30 min de bloqueo)
- [ ] Admin puede bloquear/desbloquear usuarios
- [ ] Contraseña mínima de 8 caracteres

### Fuera del Alcance

- [ ] Registro con verificación de email (enviar código)
- [ ] Login con Google OAuth
- [ ] Login con redes sociales
- [ ] Recuperación de contraseña (olvidé mi contraseña)
- [ ] Autenticación de dos factores (2FA)
- [ ] Notificaciones de login desde dispositivos nuevos
- [ ] Historial de logins por usuario

## Requisitos No Funcionales

- Las contraseñas se almacenan con **bcrypt** (nunca texto plano)
- Los tokens JWT incluyen `user_id`, `rol` y `exp` (expiración)
- Las consultas a base de datos filtran por `user_id` del token JWT
- El sistema no permite acceso a datos de otros usuarios bajo ninguna circunstancia

## Modelo de Datos

### Tabla: `usuarios`

```sql
CREATE TABLE usuarios (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT DEFAULT 'usuario',
    activo INTEGER DEFAULT 1,
    intentos_fallidos INTEGER DEFAULT 0,
    bloqueado_hasta TEXT NULL,
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `sesiones`

```sql
CREATE TABLE sesiones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES usuarios(id),
    token TEXT NOT NULL,
    expira_en TEXT NOT NULL,
    creado_en TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|------------|
| `POST` | `/api/auth/registro` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `GET` | `/api/auth/me` | Datos del usuario actual |
| `GET` | `/api/admin/usuarios` | Listar usuarios (admin) |
| `PATCH` | `/api/admin/usuarios/{id}/bloquear` | Bloquear usuario (admin) |
| `PATCH` | `/api/admin/usuarios/{id}/desbloquear` | Desbloquear usuario (admin) |

## Decisiones de Diseño

1. **Auto-registro abierto**: No hay invitación por código. Cualquier persona con email puede registrarse. El admin puede bloquear usuarios que no correspondan.

2. **Tokens JWT con expiración corta**: 24 horas. Se renuevan automáticamente con cada request si están cerca de expirar.

3. **Bloqueo por intentos**: 5 intentos fallidos → 30 min de bloqueo. El usuario no puede hacer login hasta que pase el tiempo o el admin lo desbloquee.

4. **Filtrado por usuario en TODAS las consultas**: No hay endpoint que devuelva datos sin filtrar por `user_id` del token.

## User Flows

### Registro
```
Usuario abre app → Ve formulario de registro → Ingresa nombre, email, contraseña
→ Sistema valida email único y contraseña >= 8 chars → Crea usuario → Redirige a login
```

### Login
```
Usuario abre app → Ve formulario de login → Ingresa email + contraseña
→ Sistema verifica usuario existe, activo, no bloqueado → Verifica contraseña
→ Si todo OK, crea JWT → Guardar en cookie → Redirige a dashboard
→ Si bloqueado, muestra "Cuenta bloqueada. Intenta en X minutos"
→ Si contraseña incorrecta, incrementa intentos_fallidos → Si >= 5, bloquea
```

### Acceso a Datos (ejemplo: transacciones)
```
Usuario autenticado → Solicita GET /api/transacciones
→ Sistema extrae user_id del token JWT → Filtra: WHERE user_id = user_id
→ Devuelve solo las transacciones del usuario
```

## Validación de Contraseña

- Mínimo 8 caracteres
- No se almacenan contraseñas en texto plano
- Se usa bcrypt con salt aleatorio

## Excepciones

| Escenario | Respuesta |
|----------|----------|
| Email ya registrado | 409 Conflict: "Este email ya tiene una cuenta" |
| Credenciales inválidas | 401 Unauthorized: "Email o contraseña incorrectos" |
| Cuenta bloqueada | 403 Forbidden: "Cuenta bloqueada. Intenta en X minutos" |
| Token expirado | 401 Unauthorized: "Sesión expirada. Iniciá sesión nuevamente" |
| Usuario inactivo | 403 Forbidden: "Cuenta desactivada" |
| Acceso a datos de otro | 403 Forbidden (el sistema filtra, no debería pasar) |