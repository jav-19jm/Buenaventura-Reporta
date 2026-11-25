import { describe, expect, it } from "vitest";
import { homePathForRole } from "../components/common/ProtectedRoute";
import { getServiceTypeConfig, SERVICE_TYPES } from "../lib/service-types";

describe("homePathForRole", () => {
  it("envía a cada rol a su propio panel", () => {
    expect(homePathForRole("administrador")).toBe("/admin");
    expect(homePathForRole("entidad")).toBe("/entity/dashboard");
    expect(homePathForRole("ciudadano")).toBe("/user");
  });
});

describe("getServiceTypeConfig", () => {
  it("encuentra un tipo de servicio por su id", () => {
    expect(getServiceTypeConfig("salud").label).toBe("Salud");
  });

  it("usa 'Otro' para un id desconocido", () => {
    expect(getServiceTypeConfig("no-existe")).toBe(SERVICE_TYPES[SERVICE_TYPES.length - 1]);
    expect(getServiceTypeConfig("no-existe").id).toBe("otro");
  });
});
