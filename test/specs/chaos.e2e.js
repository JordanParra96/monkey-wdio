import { browser } from "@wdio/globals";

describe("Chaos Monkey - Fase de calentamiento", () => {
  it("Debe abrir la aplicación y preparar el entorno", async () => {
    // Maximizar asegura que los elementos sean visibles y se puedan presionar
    await browser.maximizeWindow();
    // '/' es la baseUrl definida en wdio.conf.js
    await browser.url("/");

    const title = await browser.getTitle();
    if (title !== "Swag Labs") {
      throw new Error("La aplicación no cargó correctamente.");
    }
    console.log('Conexión establecida: "Swag Labs" está disponible.');
  });
});
