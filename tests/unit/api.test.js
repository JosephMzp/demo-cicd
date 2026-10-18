// Pruebas unitarias de la API: rápidas y sin base de datos.
// El pool es falso: decidimos qué responde en cada prueba.
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { crearApp } from "../../api/app.js";

function appConPool(query) {
  return crearApp({ pool: { query } });
}

describe("GET /api/health", () => {
  it("responde 200 cuando la base de datos contesta", async () => {
    const app = appConPool(vi.fn().mockResolvedValue({ rows: [] }));
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: "ok" });
  });

  it("responde 503 cuando la base de datos no contesta", async () => {
    const app = appConPool(vi.fn().mockRejectedValue(new Error("connection refused")));
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(503);
    expect(r.body.status).toBe("error");
  });
});

describe("GET /api/estadisticas", () => {
  it("devuelve el total de mensajes registrados", async () => {
    const app = appConPool(vi.fn().mockResolvedValue({ rows: [{ total: 5 }] }));
    const r = await request(app).get("/api/estadisticas");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ total: 5 });
  });
});

describe("POST /api/mensajes", () => {
  it("rechaza con 400 si falta el nombre, sin tocar la base", async () => {
    const query = vi.fn();
    const r = await request(appConPool(query)).post("/api/mensajes").send({ mensaje: "hola" });
    expect(r.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it("rechaza con 400 un mensaje de más de 280 caracteres", async () => {
    const r = await request(appConPool(vi.fn())).post("/api/mensajes")
      .send({ nombre: "Ana", mensaje: "x".repeat(281) });
    expect(r.status).toBe(400);
  });

  it("rechaza con 400 un cuerpo que no es JSON", async () => {
    const r = await request(appConPool(vi.fn())).post("/api/mensajes")
      .set("Content-Type", "application/json").send("{esto no es json");
    expect(r.status).toBe(400);
  });

  it("crea el mensaje con 201 y usa parámetros en el SQL", async () => {
    const fila = { id: 7, nombre: "Ana", mensaje: "Buen pipeline", fecha: "2026-10-09T12:00:00Z" };
    const query = vi.fn().mockResolvedValue({ rows: [fila] });
    const r = await request(appConPool(query)).post("/api/mensajes")
      .send({ nombre: "  Ana ", mensaje: "Buen pipeline" });
    expect(r.status).toBe(201);
    expect(r.body).toEqual(fila);
    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/\$1.*\$2/);
    expect(params).toEqual(["Ana", "Buen pipeline"]);
  });
});

describe("GET /api/mensajes", () => {
  it("devuelve la lista que entrega la base", async () => {
    const filas = [{ id: 2, nombre: "B", mensaje: "dos", fecha: "2026-01-02" }];
    const r = await request(appConPool(vi.fn().mockResolvedValue({ rows: filas }))).get("/api/mensajes");
    expect(r.status).toBe(200);
    expect(r.body).toEqual(filas);
  });

  it("responde 500 sin filtrar el detalle si la consulta falla", async () => {
    const r = await request(appConPool(vi.fn().mockRejectedValue(new Error("boom")))).get("/api/mensajes");
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.body)).not.toContain("boom");
  });
});

describe("GET /metrics", () => {
  it("expone métricas en formato Prometheus", async () => {
    const app = appConPool(vi.fn().mockResolvedValue({ rows: [] }));
    await request(app).get("/api/health");
    const r = await request(app).get("/metrics");
    expect(r.status).toBe(200);
    expect(r.text).toContain("http_request_duration_seconds");
  });
});