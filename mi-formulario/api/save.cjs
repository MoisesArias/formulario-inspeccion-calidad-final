// api/save.js
// Archivo JS CommonJS compatible con Vercel Serverless Functions

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method Not Allowed" });
    return;
  }

  try {
    const GAS_URL = process.env.GAS_URL;
    if (!GAS_URL) {
      throw new Error("GAS_URL no está configurada en las environment variables");
    }

    const body = req.body || {}; // esperamos JSON desde el frontend

    // Convertimos JSON a application/x-www-form-urlencoded (lo que espera el GAS)
    const params = new URLSearchParams();
    for (const key of Object.keys(body)) {
      const val = body[key];
      // Si valor es array u objeto, stringify
      params.append(key, typeof val === "string" ? val : JSON.stringify(val));
    }

    // Llamada server-side al Google Apps Script
    const resp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const text = await resp.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Si GAS devuelve texto plano, lo mandamos raw
      data = { raw: text };
    }

    // Devolvemos al cliente lo que dijo GAS
    res.status(200).json({
      ok: resp.ok,
      status: resp.status,
      data,
    });

  } catch (err) {
    console.error("Error en /api/save:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
};
