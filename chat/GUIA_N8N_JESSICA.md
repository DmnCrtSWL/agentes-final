# Guía de Implementación n8n - Agente Jessica

## 1. Configuración del Nodo "AI Agent"
- **Model**: OpenAI Chat Model (GPT-4o mini o GPT-4o recomendado).
- **System Message**: Copia y pega el contenido de `PROMPT_JESSICA.md`.
- **Memory**: Window Buffer Memory.

## 2. Herramienta (Tool) `generar_cotizacion`
Necesitas crear una "Custom Workflow Tool" o un flujo secundario que el agente pueda llamar.

### Definición de la Tool
- **Nombre**: `generar_cotizacion`
- **Descripción**: Genera un archivo PDF con la cotización formal cuando el cliente confirma los datos.
- **Schema (JSON)**:
```json
{
  "type": "object",
  "properties": {
    "client_name": { "type": "string", "description": "Nombre del cliente" },
    "items": { 
      "type": "array", 
      "items": {
        "type": "object",
        "properties": {
          "model": { "type": "string", "enum": ["Cuello Redondo", "Tipo Polo"] },
          "quantity": { "type": "number" },
          "details": { "type": "string", "description": "Resumen de tallas y colores, ej: '10 M Rojas, 5 L Negras'" },
          "unit_price": { "type": "number" },
          "amount": { "type": "number" }
        }
      }
    },
    "subtotal": { "type": "number" },
    "discount": { "type": "number" },
    "total": { "type": "number" }
  }
}
```

## 3. Flujo de la Tool (Sub-workflow o rama de herramienta)
Cuando el agente llama esta tool, el flujo debe hacer:

1. **HTML Node**:
   - Copia el contenido de `PLANTILLA_COTIZACION.html`.
   - Usa la opción "Replace Placeholders": mapea los valores que envía el agente (del JSON anterior) a las variables del HTML ({{client_name}}, {{total}}, etc.).
   *Nota: Para los items, necesitarás un nodo de "Code" o un loop para construir las filas de la tabla HTML dinámicamente si no usas un motor de plantillas avanzado.*

2. **HTML to PDF Node**:
   - Toma el HTML generado.
   - Genera el binario del PDF.

3. **Respond to Webhook / AI Tool Response**:
   - Devuelve un mensaje de texto al agente: "Cotización generada exitosamente".
   - **IMPORTANTE**: Para enviar el archivo al chat del usuario, en este proyecto estamos enviando solo texto desde el agente.
   - **Solución**: Sube el PDF a S3/Google Drive y devuelve la URL pública al agente para que se la de al usuario ("Aquí tienes tu cotización: [link]").

## 4. Pruebas
1. Abre el chat de "Cotizaciones".
2. Di: "Hola, quiero 20 playeras polo rojas medianas".
3. Jessica debe detectar mayoreo, calcular precios y confirmar.
4. Al confirmar, debe llamar a la tool y darte el resultado.
