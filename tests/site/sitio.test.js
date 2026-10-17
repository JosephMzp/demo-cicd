// Pruebas del sitio estático: lo que sirve nginx. Se leen con jsdom, como lo haría un navegador.
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { JSDOM } from "jsdom";

const SITIO = "web/public";
let doc;

beforeAll(() => {
  doc = new JSDOM(readFileSync(`${SITIO}/index.html`, "utf-8")).window.document;
});

describe("index.html", () => {
  it("declara el idioma, el charset y el viewport", () => {
    expect(doc.documentElement.getAttribute("lang")).toBe("es");
    expect(doc.querySelector("meta[charset]")).not.toBeNull();
    expect(doc.querySelector('meta[name="viewport"]')).not.toBeNull();
  });

  it("tiene un título y un solo h1", () => {
    expect(doc.title.trim()).not.toBe("");
    expect(doc.querySelectorAll("h1")).toHaveLength(1);
  });

  it("todas las imágenes tienen texto alternativo", () => {
    const sinAlt = [...doc.querySelectorAll("img")].filter((img) => !img.getAttribute("alt"));
    expect(sinAlt).toHaveLength(0);
  });

  it("los archivos locales que usa la página existen", () => {
    const rutas = [...doc.querySelectorAll('script[src], link[rel="stylesheet"], img[src]')]
      .map((el) => el.getAttribute("src") ?? el.getAttribute("href"))
      .filter((ruta) => !/^(https?:)?\/\//.test(ruta));
    for (const ruta of rutas) {
      expect(existsSync(`${SITIO}/${ruta}`), `falta ${ruta}`).toBe(true);
    }
  });

  it("el libro de visitas arranca oculto y tiene el formulario completo", () => {
    const seccion = doc.querySelector("#libro-de-visitas");
    expect(seccion?.hasAttribute("hidden")).toBe(true);
    expect(seccion?.querySelector('input[name="nombre"]')).not.toBeNull();
    expect(seccion?.querySelector('textarea[name="mensaje"]')).not.toBeNull();
  });

  it("no apunta a localhost ni a puertos de la máquina del desarrollador", () => {
    const html = readFileSync(`${SITIO}/index.html`, "utf-8") + readFileSync(`${SITIO}/libro-de-visitas.js`, "utf-8");
    expect(html).not.toMatch(/localhost|127\.0\.0\.1|:3000/);
  });
});
