// Libro de visitas: la aplicación Express, separada del arranque del servidor.
//
// crearApp recibe el pool de Postgres desde afuera. Así las pruebas unitarias
// le pasan un pool falso y no necesitan una base de datos de verdad.
// Toda la configuración entra por variables de entorno: aquí no hay contraseñas.
import express from "express";
import client from "prom-client";

export function crearApp({ pool, registro = new client.Registry() }) {
  const app = express();
  app.use(express.json({ limit: "10kb" }));

  // Métricas RED (rate, errors, duration) por ruta. Prometheus las lee en /metrics.
  client.collectDefaultMetrics({ register: registro });
  const duracion = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duración de las peticiones HTTP",
    labelNames: ["method", "route", "status"],
    buckets: [0.01, 0.05, 0.1, 0.3, 1, 3],
    registers: [registro],
  });
  app.use((req, res, next) => {
    const fin = duracion.startTimer();
    res.on("finish", () => fin({ method: req.method, route: req.path, status: res.statusCode }));
    next();
  });

  app.get("/api/health", async (_req, res) => {
    // "Estoy vivo" no alcanza: si no puedo hablar con la base, no estoy sano.
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (e) {
      res.status(503).json({ status: "error", detalle: e.message });
    }
  });

  app.get("/api/mensajes", async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        "SELECT id, nombre, mensaje, fecha FROM mensajes ORDER BY fecha DESC, id DESC LIMIT 100"
      );
      res.json(rows);
    } catch (e) { next(e); }
  });

  app.post("/api/mensajes", async (req, res, next) => {
    const nombre = String(req.body?.nombre ?? "").trim();
    const mensaje = String(req.body?.mensaje ?? "").trim();

    if (!nombre || !mensaje) return res.status(400).json({ error: "Faltan el nombre o el mensaje." });
    if (nombre.length > 60) return res.status(400).json({ error: "El nombre no puede pasar de 60 caracteres." });
    if (mensaje.length > 280) return res.status(400).json({ error: "El mensaje no puede pasar de 280 caracteres." });

    try {
      const { rows } = await pool.query(
        // Parámetros, nunca concatenar texto del usuario dentro del SQL.
        "INSERT INTO mensajes (nombre, mensaje) VALUES ($1, $2) RETURNING id, nombre, mensaje, fecha",
        [nombre, mensaje]
      );
      res.status(201).json(rows[0]);
    } catch (e) { next(e); }
  });

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", registro.contentType);
    res.end(await registro.metrics());
  });

  // JSON mal formado en el cuerpo: es culpa del cliente, no un 500.
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "El cuerpo no es JSON válido." });
    console.error(err.message);
    res.status(500).json({ error: "Error interno." });
  });

  return app;
}
