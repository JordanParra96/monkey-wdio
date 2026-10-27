import { browser, $, $$, expect } from "@wdio/globals";

describe("Dumb Monkey - Ataque Aleatorio", () => {
  it("Debe sobrevivir a 50 interacciones aleatorias", async () => {
    // --- 1. PREPARACIÓN ---
    await browser.maximizeWindow();
    await browser.url("/");

    // Login (Selectores estándar)
    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    // Aserción con una expresión regular
    await expect(browser).toHaveUrl(/inventory/);
    console.log("Acceso concedido. Iniciando secuencia de caos...");

    // --- 2. CONFIGURACIÓN DEL CAOS ---
    const MONKEY_LIMIT = 50;
    const DELAY_MS = 200; // Pausa entre acciones para ver qué pasa

    for (let i = 0; i < MONKEY_LIMIT; i++) {
      // Si el mono salió de la aplicación (por ejemplo, a saucelabs.com), lo devolvemos al inventario
      if (!(await browser.getUrl()).startsWith("https://www.saucedemo.com")) {
        console.warn("Fuera de la aplicación. Volviendo al inventario...");
        await browser.url("https://www.saucedemo.com/inventory.html");
        continue;
      }

      // Recolectamos víctimas potenciales
      const interactables = await $$("button, a, input, select");

      // Si el mono navega a una página vacía, regresamos al inventario
      if (interactables.length === 0) {
        console.warn("Zona muerta detectada. Reiniciando posición...");
        await browser.url("https://www.saucedemo.com/inventory.html");
        continue;
      }

      // Selección Aleatoria
      const randomIndex = Math.floor(Math.random() * interactables.length);
      const element = interactables[randomIndex];

      // Ejecución Defensiva (El corazón del Monkey Test)
      try {
        // Verificamos visibilidad y habilitación
        const isClickable = await element.isClickable();

        if (isClickable) {
          const tagName = await element.getTagName();

          if (tagName === "input") {
            // Generamos texto aleatorio
            const randomText = (Math.random() + 1).toString(36).substring(7);
            // Limpiamos y escribimos
            await element.setValue(randomText);
            console.log(
              `[Acción ${i + 1}/${MONKEY_LIMIT}] Escribiendo "${randomText}" en <input>`,
            );
          } else {
            // Click
            await element.click();
            console.log(
              `[Acción ${i + 1}/${MONKEY_LIMIT}] Click en <${tagName}>`,
            );
          }
        } else {
          console.log(`[Skip] Elemento ${randomIndex} no interactuable.`);
        }
      } catch (error) {
        // Los errores "StaleElementReference" son normales aquí (la página cambió mientras el mono pensaba)
        console.log(
          `[Recuperación] Intento fallido: ${error.message.split("\n")[0]}`,
        );
      }

      // Pausa humana
      await browser.pause(DELAY_MS);
    }

    console.log("Misión cumplida: La aplicación sobrevivió al ataque.");
  });
});
