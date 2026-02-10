# Sistema de Adjuntos de Archivos

## 🎯 Funcionalidades Implementadas

### ✅ Tipos de Archivos Soportados
- **Imágenes**: JPG, JPEG, PNG
- **Documentos**: PDF
- **Tamaño máximo**: 10MB por archivo

### ✅ Métodos de Adjuntar Archivos

#### 1. Botón de Adjuntar (estilo WhatsApp)
- Haz clic en el ícono de clip 📎 en la barra de entrada
- Selecciona uno o múltiples archivos
- Los archivos se mostrarán en una vista previa antes de enviar

#### 2. Drag & Drop (Arrastrar y Soltar)
- Arrastra archivos desde tu explorador de archivos
- Suéltalos en cualquier parte del área de chat
- Verás un indicador visual cuando estés arrastrando

### ✅ Vista Previa de Archivos
- Cada archivo adjunto muestra:
  - Ícono según tipo (imagen o documento)
  - Nombre del archivo
  - Tamaño del archivo
  - Botón para eliminar (X)

### ✅ Envío a n8n
Los archivos se envían al webhook de n8n en formato base64 con la siguiente estructura:

```json
{
  "message": "Texto del mensaje",
  "agentId": 1,
  "sessionId": "session-xxx",
  "files": [
    {
      "name": "documento.pdf",
      "type": "application/pdf",
      "size": 12345,
      "data": "data:application/pdf;base64,..."
    }
  ]
}
```

## 🔧 Configuración en n8n

Para procesar los archivos en tu workflow de n8n:

1. El webhook recibe el campo `files` como un array
2. Cada archivo contiene:
   - `name`: Nombre del archivo
   - `type`: MIME type
   - `size`: Tamaño en bytes
   - `data`: Contenido en base64 (data URL)

3. Puedes procesar los archivos usando nodos como:
   - **Extract from File**: Para extraer texto de PDFs
   - **HTTP Request**: Para enviar a servicios de análisis de imágenes
   - **Code**: Para procesamiento personalizado

### Ejemplo de código en n8n para procesar archivos:

```javascript
// En un nodo Code de n8n
const files = $input.item.json.files || [];

for (const file of files) {
  // Extraer el base64 puro (sin el prefijo data:...)
  const base64Data = file.data.split(',')[1];
  
  // Convertir a buffer si es necesario
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Procesar según el tipo
  if (file.type.startsWith('image/')) {
    // Procesar imagen
  } else if (file.type === 'application/pdf') {
    // Procesar PDF
  }
}
```

## 🎨 Interfaz de Usuario

### Estados Visuales
- **Normal**: Área de chat lista para recibir archivos
- **Arrastrando**: Fondo azul claro con borde punteado verde
- **Archivos adjuntos**: Panel superior mostrando archivos antes de enviar
- **Hover en botones**: Efectos visuales al pasar el mouse

### Validaciones
- ✅ Solo acepta tipos de archivo permitidos
- ✅ Verifica tamaño máximo (10MB)
- ✅ Muestra alertas descriptivas en caso de error
- ✅ Permite eliminar archivos antes de enviar

## 📱 Responsive
La interfaz se adapta perfectamente a:
- Desktop
- Tablet
- Mobile

## 🚀 Uso

1. **Adjuntar archivo**: Click en 📎 o arrastra archivos
2. **Revisar**: Verifica los archivos en la vista previa
3. **Eliminar** (opcional): Click en X para quitar archivos
4. **Enviar**: Click en el botón de enviar o Enter
5. **Resultado**: El mensaje se muestra con indicador de archivos adjuntos

## 🔍 Debugging

La consola del navegador muestra información detallada:
- 📤 Payload enviado (sin el base64 completo para no saturar)
- 📥 Respuesta del servidor
- ❌ Errores si los hay

Revisa la consola con F12 para ver el flujo completo.
