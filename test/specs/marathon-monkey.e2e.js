import { browser, $, $$, expect } from "@wdio/globals";

describe("Marathon Monkey - Prueba de resistencia", () => {
  // Duración del experimento: 3 minutos, sin límite de acciones
  const DURATION_MS = 3 * 60 * 1000;
  const DELAY_MS = 100;

  // Memoria JS usada por la página (solo Chrome expone performance.memory)
  const getHeapMB = async () => {
    const bytes = await browser.execute(
      () => window.performance.memory?.usedJSHeapSize ?? 0,
    );
    return (bytes / 1024 / 1024).toFixed(2);
  };

  it("Debe navegar sin interrupción durante 3 minutos", async () => {
    // --- SETUP ---
    await browser.maximizeWindow();
    await browser.url("/");

    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    await expect(browser).toHaveUrl(/inventory/);

    const initialHeap = await getHeapMB();
    console.log(`Maratón iniciada. Memoria inicial: ${initialHeap} MB`);

    // --- BUCLE POR TIEMPO ---
    // El reloj arranca después del login para que el caos dure exactamente 3 minutos
    const startTime = Date.now();
    const endTime = startTime + DURATION_MS;
    let actions = 0;

    while (Date.now() < endTime) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);

      try {
        // Si el mono salió de la aplicación, lo devolvemos al inventario
        if (!(await browser.getUrl()).startsWith("https://www.saucedemo.com")) {
          console.warn("Fuera de la aplicación. Volviendo al inventario...");
          await browser.url("https://www.saucedemo.com/inventory.html");
          continue;
        }

        const candidates = await $$("button, a");

        if (candidates.length === 0) {
          console.warn("Callejón sin salida. Volviendo al inventario...");
          await browser.url("https://www.saucedemo.com/inventory.html");
          continue;
        }

        const element =
          candidates[Math.floor(Math.random() * candidates.length)];

        if (!(await element.isDisplayed())) continue;

        const text = (await element.getText()) || "";
        const href = (await element.getAttribute("href")) || "";
        const id = (await element.getAttribute("id")) || "";

        // Regla A: No hacer Logout
        if (
          text.toLowerCase().includes("logout") ||
          id === "logout_sidebar_link"
        ) {
          continue;
        }

        // Regla B: No salir de la aplicación
        if (
          href.startsWith("http") &&
          !href.startsWith("https://www.saucedemo.com")
        ) {
          continue;
        }

        // Regla C: No resetear el estado
        if (id === "reset_sidebar_link") continue;

        await element.click();
        actions++;
        console.log(
          `[${elapsed}s | Acción ${actions}] Click en: "${text || id || "Elemento sin texto"}"`,
        );
      } catch (error) {
        // Elementos que desaparecen entre la búsqueda y el click: el mono sigue corriendo
        console.log(`[Recuperación] ${error.message.split("\n")[0]}`);
      }

      await browser.pause(DELAY_MS);
    }

    // --- RESULTADOS ---
    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const finalHeap = await getHeapMB();

    console.log(`Maratón terminada en ${totalSeconds}s con ${actions} acciones.`);
    console.log(`Memoria inicial: ${initialHeap} MB | final: ${finalHeap} MB`);

    // La sesión debe seguir viva y dentro de la aplicación
    await expect(browser).toHaveUrl(/saucedemo\.com/);
  });
});
