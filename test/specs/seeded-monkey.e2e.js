import { browser, $, $$, expect } from "@wdio/globals";
import { createSeededRandom } from "../utils/random.js";

describe("CSI Monkey - Reproducibilidad Forense (Smart Edition)", () => {
  // LA LLAVE MAESTRA
  // Cambia este número y el comportamiento cambiará, pero será consistente.
  const TEST_SEED = 987654321;

  // Inicializamos el generador determinista
  const rng = createSeededRandom(TEST_SEED);

  it(`Debe ejecutar una secuencia determinista e INTELIGENTE (Seed: ${TEST_SEED})`, async () => {
    // 1. SETUP
    await browser.maximizeWindow();
    await browser.url("/");
    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    console.log(`INICIO DE ESCENA. SEED ACTIVA: ${TEST_SEED}`);

    // 2. BUCLE DETERMINISTA
    const ACTIONS = 30;

    for (let i = 0; i < ACTIONS; i++) {
      // Solo buscamos elementos interactivos de navegación
      const candidates = await $$("button, a");

      if (candidates.length === 0) {
        await browser.url("https://www.saucedemo.com/inventory.html");
        continue;
      }

      // SELECCIÓN DETERMINISTA
      // Usamos rng() en lugar de Math.random()
      const randomIndex = Math.floor(rng() * candidates.length);
      const element = candidates[randomIndex];

      try {
        // Verificamos si es visible antes de gastar recursos
        if (!(await element.isDisplayed())) continue;

        // --- CEREBRO DEL SMART MONKEY (Restaurado) ---
        const text = (await element.getText()) || "";
        const href = (await element.getAttribute("href")) || "";
        const id = (await element.getAttribute("id")) || "";

        // Regla A: No hacer Logout
        if (
          text.toLowerCase().includes("logout") ||
          id === "logout_sidebar_link"
        ) {
          console.log(`[BLOQUEADO] Seed(${TEST_SEED}) intentó Logout.`);
          continue;
        }

        // Regla B: No salir de la aplicación (redes sociales, About y cualquier otro sitio)
        if (
          href &&
          href.startsWith("http") &&
          !href.startsWith("https://www.saucedemo.com")
        ) {
          console.log(
            `[BLOQUEADO] Seed(${TEST_SEED}) intentó salir del dominio: ${href}`,
          );
          continue;
        }

        // Regla C: No resetear estado
        if (id === "reset_sidebar_link") {
          console.log(
            `[BLOQUEADO] Seed(${TEST_SEED}) intentó resetear la app.`,
          );
          continue;
        }

        // --- EJECUCIÓN ---
        console.log(
          `[Paso ${i + 1}] Seed(${TEST_SEED}) click en: "${text || "Elemento sin texto"}"`,
        );
        await element.click();
      } catch (error) {
        console.log(`[Error Controlado] ${error.message.split("\n")[0]}`);
      }

      // Pausa para observar
      await browser.pause(100);
    }

    console.log("Prueba finalizada. Reproducibilidad garantizada.");
  });
});
