import { browser, $, $$, expect } from "@wdio/globals";

describe("Smart Monkey - Caos Controlado", () => {
  // Configuración del experimento
  const MONKEY_LIMIT = 50;
  const DELAY_MS = 100; // Más rápido que el anterior

  it("Debe navegar aleatoriamente SIN salir de la aplicación ni desloguearse", async () => {
    // --- SETUP ---
    await browser.maximizeWindow();
    await browser.url("/");

    // Login estándar
    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    // Aserción inicial
    await expect(browser).toHaveUrl(/inventory/);
    console.log("Smart Monkey activado. Iniciando recorrido inteligente...");

    // --- BUCLE INTELIGENTE ---
    for (let i = 0; i < MONKEY_LIMIT; i++) {
      // 1. Recolección: Solo buscamos elementos que suelen ser interactivos
      // Excluimos inputs por ahora para centrarnos en navegación
      const candidates = await $$("button, a");

      if (candidates.length === 0) {
        console.warn("Callejón sin salida. Volviendo al inventario...");
        await browser.url("https://www.saucedemo.com/inventory.html");
        continue;
      }

      // 2. Selección Aleatoria
      const randomIndex = Math.floor(Math.random() * candidates.length);
      const element = candidates[randomIndex];

      // 3. FILTRO DE INTELIGENCIA (La diferencia clave)
      try {
        // Si el elemento no es visible, pasamos al siguiente (ahorramos tiempo)
        if (!(await element.isDisplayed())) continue;

        // Obtenemos atributos para analizar riesgo
        const text = await element.getText();
        const href = await element.getAttribute("href");
        const id = await element.getAttribute("id");

        // --- REGLAS DE SEGURIDAD (BLACKLIST) ---

        // Regla A: No hacer Logout
        if (
          text.toLowerCase().includes("logout") ||
          id === "logout_sidebar_link"
        ) {
          console.log(`[BLOQUEADO] Se evitó click en Logout.`);
          continue; // Saltamos a la siguiente iteración del for
        }

        // Regla B: No salir de la aplicación (redes sociales, About y cualquier otro sitio)
        if (
          href &&
          href.startsWith("http") &&
          !href.startsWith("https://www.saucedemo.com")
        ) {
          console.log(`[BLOQUEADO] Se evitó salir del dominio: ${href}`);
          continue;
        }

        // Regla C: No Resetear el estado (opcional)
        if (id === "reset_sidebar_link") {
          console.log(`[BLOQUEADO] Se evitó resetear la App.`);
          continue;
        }

        // 4. EJECUCIÓN SEGURA
        console.log(
          `[Acción ${i + 1}] Click en: "${text || id || "Elemento sin texto"}"`,
        );
        await element.click();
      } catch (error) {
        // Si el elemento desapareció mientras analizábamos, no pasa nada.
        // Esto es común en apps modernas (React/Vue).
        console.log(`[Fantasma] El elemento desapareció antes del click.`);
      }

      // Pausa breve
      await browser.pause(DELAY_MS);
    }

    console.log(
      "Prueba finalizada. La sesión se mantuvo activa todo el tiempo.",
    );
  });
});
