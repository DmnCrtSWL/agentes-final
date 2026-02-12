import express from "express";
// Using native fetch (Node 18+)

const router = express.Router();

// Proxy para webhook de n8n - Servicio al Cliente (Ana)
router.post("/n8n/service", async (req, res) => {
  try {
    const N8N_URL = "https://dmncrt.app.n8n.cloud/webhook/chat/asistente";
    
    console.log("📤 Proxy: Enviando mensaje a n8n (Servicio):", {
      message: req.body.message?.substring(0, 50),
      agentId: req.body.agentId,
      sessionId: req.body.sessionId,
    });

    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de n8n:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Respuesta de n8n recibida");
    
    res.json(data);
  } catch (error) {
    console.error("❌ Error en proxy n8n:", error);
    res.status(500).json({ 
      error: "Error al conectar con n8n",
      message: error.message 
    });
  }
});

// Proxy para webhook de n8n - Cotizaciones (Jessica)
router.post("/n8n/quotes", async (req, res) => {
  try {
    const N8N_URL = "https://dmncrt.app.n8n.cloud/webhook/chat/cotizaciones";
    
    console.log("📤 Proxy: Enviando mensaje a n8n (Cotizaciones):", {
      message: req.body.message?.substring(0, 50),
      agentId: req.body.agentId,
      sessionId: req.body.sessionId,
    });

    const response = await fetch(N8N_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de n8n:", errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Respuesta de n8n recibida");
    
    res.json(data);
  } catch (error) {
    console.error("❌ Error en proxy n8n:", error);
    res.status(500).json({ 
      error: "Error al conectar con n8n",
      message: error.message 
    });
  }
});

export default router;
