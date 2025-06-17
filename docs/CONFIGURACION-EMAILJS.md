# Configuración de EmailJS para el Formulario de Contacto

## ¿Qué es EmailJS?

EmailJS es un servicio que permite enviar emails directamente desde JavaScript sin necesidad de un servidor backend. Es perfecto para sitios web estáticos.

## Pasos para configurar EmailJS

### 1. Crear una cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en "Sign Up Free"
3. Crea tu cuenta con email y contraseña

### 2. Configurar un servicio de email

1. En el dashboard de EmailJS, ve a "Email Services"
2. Haz clic en "Add New Service"
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Anota el **Service ID** (lo necesitarás)

### 3. Crear una plantilla de email

1. Ve a "Email Templates"
2. Haz clic en "Create New Template"
3. Usa esta plantilla de ejemplo:

**Subject:**
```
Nuevo mensaje de {{from_name}} - {{subject}}
```

**Content:**
```
Has recibido un nuevo mensaje desde el formulario de contacto de {{site_name}}.

DATOS DEL CONTACTO:
==================
Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}
Fecha de entrada: {{checkin}}
Fecha de salida: {{checkout}}

ASUNTO:
=======
{{subject}}

MENSAJE:
========
{{message}}

---
Este mensaje fue enviado el {{sent_date}}
```

4. Anota el **Template ID**

### 4. Obtener tu Public Key

1. Ve a "Account" > "API Keys"
2. Copia tu **Public Key**

### 5. Configurar el archivo JavaScript

Edita el archivo `/js/contact-emailjs.js` y actualiza estas líneas con tus datos:

```javascript
const EMAILJS_CONFIG = {
    serviceId: 'TU_SERVICE_ID',    // Reemplaza con tu Service ID
    templateId: 'TU_TEMPLATE_ID',   // Reemplaza con tu Template ID
    publicKey: 'TU_PUBLIC_KEY'      // Reemplaza con tu Public Key
};
```

### 6. Configurar el email de destino

En la plantilla de EmailJS, puedes configurar el campo "To Email" con el email donde quieres recibir los mensajes, por ejemplo: `info@villarromana.com`

## Límites del plan gratuito

- 200 emails por mes
- 2 plantillas de email
- Historial de 30 días

## Prueba del formulario

1. Abre la página de contacto en tu navegador
2. Rellena el formulario con datos de prueba
3. Envía el formulario
4. Verifica que llegue el email a tu bandeja de entrada
5. Revisa la consola del navegador (F12) por si hay errores

## Solución de problemas

### El email no llega
- Verifica que los IDs estén correctos
- Revisa la carpeta de spam
- Comprueba el historial en el dashboard de EmailJS

### Error de autenticación
- Asegúrate de que la Public Key sea correcta
- Verifica que el servicio esté activo

### Error de plantilla
- Comprueba que todos los campos {{variable}} coincidan con los parámetros enviados

## Seguridad

- EmailJS es seguro para usar en producción
- Tu email y contraseña nunca se exponen en el código
- Los usuarios no pueden ver tu configuración de email

## Alternativas

Si prefieres no usar EmailJS, puedes:
1. Usar Formspree (https://formspree.io/)
2. Usar Netlify Forms si alojas en Netlify
3. Implementar una función serverless con AWS Lambda o Vercel