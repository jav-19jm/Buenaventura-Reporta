import { describe, expect, it } from "vitest";
import { filterReports, getReportStatus, summarizeReports } from "../lib/report-status";
import type { EstadoReporte } from "../types";

const reportes: { estado: EstadoReporte; categoria: string }[] = [
  { estado: "pendiente", categoria: "Alumbrado" },
  { estado: "en_revision", categoria: "Vías" },
  { estado: "en_proceso", categoria: "Alumbrado" },
  { estado: "resuelto", categoria: "Alumbrado" },
  { estado: "cancelado", categoria: "Vías" },
];

describe("getReportStatus", () => {
  it("devuelve la etiqueta y el estilo de un estado conocido", () => {
    expect(getReportStatus("en_revision")).toEqual({ label: "En revisión", variant: "info" });
    expect(getReportStatus("resuelto")).toEqual({ label: "Resuelto", variant: "success" });
  });

  it("usa 'Sin estado' si el backend envía un estado desconocido", () => {
    expect(getReportStatus("archivado")).toEqual({ label: "Sin estado", variant: "secondary" });
  });
});

describe("summarizeReports", () => {
  it("cuenta el total, los abiertos (pendiente, en revisión, en proceso) y los resueltos", () => {
    expect(summarizeReports(reportes)).toEqual({ total: 5, open: 3, resolved: 1 });
  });

  it("devuelve ceros con una lista vacía", () => {
    expect(summarizeReports([])).toEqual({ total: 0, open: 0, resolved: 0 });
  });
});

describe("filterReports", () => {
  it("sin filtros devuelve todos los reportes", () => {
    expect(filterReports(reportes, { category: null, status: "todos" })).toHaveLength(5);
  });

  it("combina el filtro de categoría con el de estado", () => {
    const abiertosAlumbrado = filterReports(reportes, { category: "Alumbrado", status: "abiertos" });
    expect(abiertosAlumbrado.map((r) => r.estado)).toEqual(["pendiente", "en_proceso"]);
  });

  it("'resueltos' excluye los cancelados", () => {
    expect(filterReports(reportes, { category: null, status: "resueltos" }).map((r) => r.estado)).toEqual(["resuelto"]);
  });
});
