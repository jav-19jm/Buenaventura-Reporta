import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, toResult } from "../api/client";

/** Crea un error de Axios como el que produce una respuesta de Laravel */
function errorLaravel(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: "", headers: {}, config } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, null, response);
}

describe("getErrorMessage", () => {
  it("con un 422 devuelve el primer error de validación", () => {
    const error = errorLaravel(422, {
      message: "The given data was invalid.",
      errors: { email: ["El correo ya está registrado."], password: ["Muy corta."] },
    });
    expect(getErrorMessage(error)).toBe("El correo ya está registrado.");
  });

  it("sin errores de campo devuelve el mensaje del backend", () => {
    expect(getErrorMessage(errorLaravel(401, { message: "Credenciales incorrectas." }))).toBe("Credenciales incorrectas.");
  });

  it("sin respuesta (servidor caído) muestra un mensaje de conexión", () => {
    const sinRespuesta = new AxiosError("Network Error", "ERR_NETWORK");
    expect(getErrorMessage(sinRespuesta)).toMatch(/No se pudo conectar/);
  });

  it("maneja errores que no son de Axios", () => {
    expect(getErrorMessage(new Error("fallo"))).toBe("fallo");
    expect(getErrorMessage("texto")).toBe("Error desconocido");
  });
});

describe("toResult", () => {
  it("convierte una respuesta exitosa en { data, error: null }", async () => {
    await expect(toResult(Promise.resolve({ data: { id: 7 } }))).resolves.toEqual({ data: { id: 7 }, error: null });
  });

  it("convierte un error en { data: null, error, code } con el código del backend", async () => {
    const error = errorLaravel(403, { message: "Verifica tu correo.", codigo: "correo_no_verificado" });
    await expect(toResult(Promise.reject(error))).resolves.toEqual({
      data: null,
      error: "Verifica tu correo.",
      code: "correo_no_verificado",
    });
  });
});
