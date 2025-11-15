# Reglas de Seguridad de Firebase

## IMPORTANTE: Debes copiar estas reglas en tu consola de Firebase

### 1. Reglas de Firestore Database

Ve a Firebase Console → Firestore Database → Reglas y copia esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar si el usuario es admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'nassadj9@gmail.com';
    }
    
    // Reglas para la colección de canciones
    match /songs/{songId} {
      // Todos pueden leer
      allow read: if true;
      // Solo el admin puede crear, actualizar y eliminar
      allow create, update, delete: if isAdmin();
    }
    
    // Reglas para la colección de videos
    match /videos/{videoId} {
      // Todos pueden leer
      allow read: if true;
      // Solo el admin puede crear, actualizar y eliminar
      allow create, update, delete: if isAdmin();
    }
    
    // Reglas para la colección de bookings (formulario de contacto)
    match /bookings/{bookingId} {
      // Todos pueden crear bookings (enviar formulario de contacto)
      allow create: if true;
      // Solo el admin puede leer, actualizar y eliminar
      allow read, update, delete: if isAdmin();
    }
    
    // Bloquear acceso a cualquier otra colección por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2. Reglas de Storage

Ve a Firebase Console → Storage → Reglas y copia esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Función helper para verificar si el usuario es admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'nassadj9@gmail.com';
    }
    
    // Reglas para canciones
    match /songs/{songFile} {
      // Todos pueden leer/descargar
      allow read: if true;
      // Solo el admin puede subir
      allow write, delete: if isAdmin();
    }
    
    // Reglas para portadas de canciones
    match /covers/{coverFile} {
      // Todos pueden leer/ver
      allow read: if true;
      // Solo el admin puede subir
      allow write, delete: if isAdmin();
    }
    
    // Reglas para videos
    match /videos/{videoFile} {
      // Todos pueden leer/descargar
      allow read: if true;
      // Solo el admin puede subir
      allow write, delete: if isAdmin();
    }
    
    // Reglas para miniaturas de videos
    match /thumbnails/{thumbnailFile} {
      // Todos pueden leer/ver
      allow read: if true;
      // Solo el admin puede subir
      allow write, delete: if isAdmin();
    }
    
    // Bloquear acceso a cualquier otra ruta por defecto
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Instrucciones para aplicar las reglas:

### Paso 1: Ir a Firebase Console
1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto "dj-nassa"

### Paso 2: Configurar reglas de Firestore
1. En el menú lateral, haz clic en "Firestore Database"
2. Ve a la pestaña "Reglas"
3. Borra todo el contenido actual
4. Copia y pega las "Reglas de Firestore Database" de arriba
5. Haz clic en "Publicar"

### Paso 3: Configurar reglas de Storage
1. En el menú lateral, haz clic en "Storage"
2. Ve a la pestaña "Reglas"
3. Borra todo el contenido actual
4. Copia y pega las "Reglas de Storage" de arriba
5. Haz clic en "Publicar"

### Paso 4: Habilitar Google Sign-In
1. En el menú lateral, haz clic en "Authentication"
2. Ve a la pestaña "Sign-in method"
3. Haz clic en "Google"
4. Activa el toggle "Habilitar"
5. Selecciona un correo de soporte (puede ser nassadj9@gmail.com)
6. Haz clic en "Guardar"

## ¿Qué hacen estas reglas?

### Firestore (Base de datos):
- ✅ **Todos** pueden VER canciones, videos y contenido público
- ✅ **Todos** pueden ENVIAR formularios de contacto (bookings)
- ✅ **Solo nassadj9@gmail.com** puede SUBIR canciones y videos
- ✅ **Solo nassadj9@gmail.com** puede ELIMINAR canciones y videos
- ✅ **Solo nassadj9@gmail.com** puede ver los mensajes de contacto

### Storage (Archivos):
- ✅ **Todos** pueden DESCARGAR y VER archivos
- ✅ **Solo nassadj9@gmail.com** puede SUBIR archivos
- ✅ **Solo nassadj9@gmail.com** puede ELIMINAR archivos

## Seguridad implementada:

1. ✅ Autenticación con Google
2. ✅ Verificación del correo nassadj9@gmail.com
3. ✅ Controles de subida ocultos para usuarios no autorizados
4. ✅ Botones de eliminación ocultos para usuarios no autorizados
5. ✅ Validación en el frontend antes de permitir acciones
6. ✅ Reglas de seguridad en Firebase como capa adicional

**IMPORTANTE**: Una vez que copies estas reglas en Firebase, la seguridad estará completa. Cualquier intento de subir o eliminar contenido sin estar autenticado como nassadj9@gmail.com será bloqueado tanto en el frontend como en el backend.
