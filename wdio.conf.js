export const config = {
  runner: "local",
  // Archivos de prueba
  specs: ["./test/specs/**/*.js"],
  maxInstances: 1,
  capabilities: [
    {
      browserName: "chrome",
      "goog:chromeOptions": {
        // Para ejecutar sin ventana (por ejemplo, en integración continua), quite el comentario:
        // args: ["--headless=new"],
      },
    },
  ],
  logLevel: "warn",
  bail: 0,
  // URL base de la aplicación (Swag Labs)
  baseUrl: "https://www.saucedemo.com",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: "mocha",
  reporters: ["spec"],
  mochaOpts: {
    ui: "bdd",
    // Tiempo máximo de cada prueba: los monos ejecutan muchas acciones
    timeout: 300000,
  },
};
