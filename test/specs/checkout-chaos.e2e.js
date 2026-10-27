import { browser, $, expect } from "@wdio/globals";

describe("Chaos Form - Validación de Entradas", () => {
  it("Debe bombardear el checkout con datos basura", async () => {
    // 1. SETUP RÁPIDO
    await browser.url("/");
    await $("#user-name").setValue("standard_user");
    await $("#password").setValue("secret_sauce");
    await $("#login-button").click();

    // Agregamos algo al carrito y vamos al checkout
    await $('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await $(".shopping_cart_link").click();
    await $("#checkout").click();

    // 2. ATAQUE AL FORMULARIO
    const ITERATIONS = 10;

    for (let i = 0; i < ITERATIONS; i++) {
      console.log(`--- Intento ${i + 1} ---`);

      // Generador de Caos de Datos
      const getRandomData = () => {
        const types = [
          "Juan", // Normal
          "Ñandú123", // Alfanumérico
          "!@#$%^&*()", // Símbolos
          "", // Vacío
          "TextoExtremadamenteLargoQueNuncaTermina...", // Overflow
        ];
        return types[Math.floor(Math.random() * types.length)];
      };

      // Llenamos los campos con basura
      await $("#first-name").setValue(getRandomData());
      await $("#last-name").setValue(getRandomData());
      await $("#postal-code").setValue(getRandomData());

      // Intentamos enviar
      await $("#continue").click();

      // 3. RECUPERACIÓN
      // Si pasamos (la URL cambió), tenemos que volver para seguir probando
      const url = await browser.getUrl();
      if (url.includes("checkout-step-two")) {
        console.log("El formulario aceptó los datos. Volviendo...");
        await $("#cancel").click(); // Volver al inventario
        await $(".shopping_cart_link").click(); // Volver al carrito
        await $("#checkout").click(); // Volver al form
      } else {
        console.log(
          "El formulario rechazó los datos (¡Bien!). Reintentando...",
        );
        // Simplemente el bucle continúa y sobreescribe los valores
      }

      await browser.pause(500);
    }
  });
});
