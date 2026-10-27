import { browser, $, expect } from "@wdio/globals";

describe("Gremlins.js - Ataque de alta velocidad", () => {
  it("Debe resistir el ataque de una horda de Gremlins", async () => {
    // 1. Preparación: iniciar sesión
    await browser.maximizeWindow();
    await browser.url("/");
    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    // 2. Inyección: agregar a la página un <script> que carga Gremlins.js desde un CDN
    console.log("Inyectando Gremlins.js desde el CDN...");
    await browser.execute(() => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/gremlins.js@2.2.0/dist/gremlins.min.js";
      document.body.appendChild(script);
    });

    // 3. Espera activa: hasta que la variable global gremlins exista en la página
    await browser.waitUntil(
      () => browser.execute(() => Boolean(window.gremlins)),
      {
        timeout: 10000,
        timeoutMsg: "Gremlins.js no se cargó a tiempo",
      },
    );
    console.log("Gremlins cargados. ¡Liberando la horda!");

    // 4. Ataque: execute espera a que termine la promesa que devuelve unleash()
    await browser.execute(async () => {
      const { gremlins } = window;
      await gremlins
        .createHorde({
          species: [
            gremlins.species.clicker(), // hace clics
            gremlins.species.formFiller(), // llena campos
            gremlins.species.scroller(), // se desplaza
          ],
          mogwais: [
            gremlins.mogwais.alert(), // evita que las alertas bloqueen la prueba
            gremlins.mogwais.fps(), // mide los cuadros por segundo
          ],
          // 100 ataques, uno cada 10 milisegundos
          strategies: [
            gremlins.strategies.distribution({ nb: 100, delay: 10 }),
          ],
        })
        .unleash();
    });

    // 5. Evaluación: la aplicación sigue en pie y en la tienda
    const currentUrl = await browser.getUrl();
    console.log(`El navegador sobrevivió. URL final: ${currentUrl}`);
    await expect(browser).toHaveUrl(/saucedemo\.com/);
  });
});
