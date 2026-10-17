import { test, expect } from "@playwright/test";
test("Conductor, público, puntos, recuperación y offline", async ({
  page,
  context,
}) => {
  await page.goto("/?conductor=1");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  const publicPage = await context.newPage();
  await publicPage.goto("/?public=1");
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await expect(publicPage.locator(".question-stage h2")).toContainText(
    "control remoto",
  );
  await expect(publicPage.locator(".reveal")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Revelar respuesta", exact: true })
    .click();
  await expect(publicPage.locator(".reveal")).toContainText("perilla");
  await page.getByRole("button", { name: "Acierto", exact: true }).click();
  await expect(publicPage.locator(".scoreboard strong").first()).toHaveText(
    "10",
  );
  await page.reload();
  await expect(page.locator(".scoreboard strong").first()).toHaveText("10");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await publicPage.reload();
  await expect(publicPage.locator(".scoreboard strong").first()).toHaveText(
    "10",
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Mostrar siguiente pregunta" }),
  ).toBeVisible();
});
test("Sincronización con respaldo storage", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, "BroadcastChannel", { value: undefined });
  });
  const page = await context.newPage();
  await page.goto("/?conductor=1");
  const pub = await context.newPage();
  await pub.goto("/?public=1");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await expect(pub.locator(".question-stage h2")).toContainText(
    "control remoto",
  );
  await context.close();
});
test("Los controles tienen etiquetas y aceptan teclado", async ({ page }) => {
  await page.goto("/?conductor=1");
  await page.getByRole("button", { name: "Los equipos" }).click();
  await expect(page.getByLabel("Nombre", { exact: true })).toHaveCount(4);
  await page
    .getByLabel("Nombre", { exact: true })
    .first()
    .fill("Los Memoriosos");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveAttribute("type", "color");
  await page.reload();
  await page.getByRole("button", { name: "Los equipos" }).click();
  await expect(page.getByLabel("Nombre", { exact: true }).first()).toHaveValue(
    "Los Memoriosos",
  );
});

test("Ruleta, apuestas bloqueadas y resultados", async ({ page }) => {
  await page.goto("/?conductor=1");
  await page.getByRole("button", { name: "Los equipos" }).click();
  for (const input of await page.getByLabel("Puntaje", { exact: true }).all())
    await input.fill("30");
  await page
    .getByRole("button", { name: "Ruleta Mazal Toc", exact: true })
    .click();
  await page
    .getByLabel("Opciones de la ruleta (una por línea)")
    .fill("Ganás 10 puntos");
  await page
    .getByRole("button", { name: "Girar la ruleta", exact: true })
    .click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.getByRole("button", { name: "El programa", exact: true }).click();
  await page.getByRole("button", { name: /06.*Gran final/ }).click();
  const bets = page.locator('.team-grid input[type="number"]');
  await bets.first().fill("20");
  await page
    .getByRole("button", { name: "Bloquear apuestas", exact: true })
    .click();
  await expect(bets.first()).toBeDisabled();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await page
    .getByRole("button", { name: "Revelar respuesta", exact: true })
    .click();
  for (let i = 0; i < 4; i++) {
    await page.getByLabel("Equipo que responde").selectOption(`equipo-${i}`);
    await page
      .getByRole("button", { name: i === 0 ? "Acierto" : "Error", exact: true })
      .click();
  }
  await page
    .getByRole("button", { name: "Finalizar y ver resultados" })
    .click();
  await expect(page.locator(".results h1")).toHaveText("Los Inoxidables");
  await expect(page.locator(".results .tagline")).toHaveText("110 puntos");
});

test("Imagen local persiste y se proyecta sin conexión", async ({
  page,
  context,
}) => {
  await page.goto("/?conductor=1");
  await page
    .getByRole("button", { name: "Banco de preguntas", exact: true })
    .click();
  await page
    .locator(".question-list .card")
    .filter({
      has: page.getByRole("heading", {
        name: "¿Para qué servía el teléfono a disco?",
      }),
    })
    .getByRole("button", { name: "Editar", exact: true })
    .click();
  await page.getByLabel("Imagen o audio local autorizado").setInputFiles({
    name: "objeto.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="gold"/></svg>',
    ),
  });
  await expect(
    page.getByText("Recurso guardado en este navegador."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Guardar pregunta", exact: true })
    .click();
  await page.getByRole("button", { name: "El programa", exact: true }).click();
  await page.getByRole("button", { name: /03.*Objetos/ }).click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  const pub = await context.newPage();
  await pub.goto("/?public=1");
  await expect(pub.getByAltText("Objeto para reconocer")).toBeVisible();
  await pub.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await pub.reload();
  await pub.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await pub.reload();
  await expect(pub.getByAltText("Objeto para reconocer")).toBeVisible();
  await expect(pub.locator(".reveal")).toHaveCount(0);
});

test("Empate y pregunta de desempate", async ({ page }) => {
  await page.goto("/?conductor=1");
  await page
    .getByRole("button", { name: "Finalizar y ver resultados" })
    .click();
  await expect(page.locator(".results .eyebrow")).toHaveText("¡HAY EMPATE!");
  await page
    .getByRole("button", { name: "Mostrar pregunta de desempate", exact: true })
    .click();
  await page.getByRole("button", { name: "Acierto", exact: true }).click();
  await page
    .getByRole("button", { name: "Finalizar y ver resultados" })
    .click();
  await expect(page.locator(".results h1")).toHaveText("Los Inoxidables");
});

test("Fotos incluidas, fuentes y ovaciones disponibles offline", async ({
  page,
  context,
}) => {
  await page.goto("/?conductor=1");
  await page.getByRole("button", { name: /03.*Objetos/ }).click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  const pub = await context.newPage();
  await pub.setViewportSize({ width: 1920, height: 1080 });
  await pub.goto("/?public=1");
  await expect(pub.getByAltText("Objeto para reconocer")).toBeVisible();
  await expect(pub.locator(".question-stage h2")).toHaveText(
    "Mirá la foto: ¿para qué se usaba?",
  );
  await expect(pub.locator(".reveal")).toHaveCount(0);
  await pub.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await pub.reload();
  await pub.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await pub.reload();
  await expect(pub.getByAltText("Objeto para reconocer")).toBeVisible();
  const resources = await pub.evaluate(async () => {
    return Promise.all(
      [
        "/audio/crowd-boo-big.mp3",
        "/audio/festejo-ganador.mp3",
        "/audio/crowd-cheer-big.mp3",
        "/fonts/atkinson-hyperlegible-700.woff2",
        "/fonts/baloo-2-800.woff2",
      ].map(async (path) => {
        const r = await fetch(path);
        return { ok: r.ok, size: (await r.arrayBuffer()).byteLength };
      }),
    );
  });
  expect(resources.every((r) => r.ok && r.size > 1000)).toBe(true);
  await pub
    .getByRole("button", { name: "🔊 Activar sonido del público" })
    .click();
  await expect(
    pub.getByRole("button", { name: "✓ Sonido activado" }),
  ).toBeVisible();
  await pub.evaluate(() => {
    (window as any).playedSounds = 0;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (
      ...args: Parameters<AudioBufferSourceNode["start"]>
    ) {
      (window as any).playedSounds++;
      return start.apply(this, args);
    };
  });
  await page.getByRole("button", { name: "👏 ¡Ovación!", exact: true }).click();
  await expect
    .poll(() => pub.evaluate(() => (window as any).playedSounds))
    .toBe(1);
  await page.getByRole("button", { name: "📣 ¡Buuu!", exact: true }).click();
  await expect
    .poll(() => pub.evaluate(() => (window as any).playedSounds))
    .toBe(2);
  await pub.evaluate(() => document.fonts.ready);
  await expect
    .poll(() =>
      pub
        .locator(".question-stage")
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  await pub.screenshot({ path: "/private/tmp/mazal-festivo-juego.png" });
  await page
    .getByRole("button", { name: "Configuración", exact: true })
    .click();
  await page.getByLabel("Tamaño de las letras").selectOption("extra");
  await expect
    .poll(() => pub.evaluate(() => document.documentElement.dataset.textSize))
    .toBe("extra");
  await page.getByLabel("Animaciones suaves").uncheck();
  await expect
    .poll(() =>
      pub
        .locator(".bunting span")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    )
    .toBe("none");
});

test("Panel festivo y legible en pantalla chica", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/?conductor=1");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "/private/tmp/mazal-festivo-panel.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", { name: "Iniciar el programa" }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("button", { name: "Iniciar el programa" })
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(58);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("Pantalla duplicada: confirmar, revelar y sumar sin soluciones privadas", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  // Menú de juegos: una tarjeta por ronda.
  await expect(page.locator(".game-card")).toHaveCount(9);
  await page.locator(".game-card").first().click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await expect(page.locator(".level-badge")).toContainText("Fácil");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "/private/tmp/mazal-compartido.png",
    fullPage: true,
  });
  await expect(page.locator(".private-answer")).toHaveCount(0);
  await expect(page.locator(".reveal")).toHaveCount(0);
  await expect(page.locator(".correct-option")).toHaveCount(0);
  await expect(
    page.getByText("Había que acercarse al aparato y girar su selector.", {
      exact: true,
    }),
  ).toHaveCount(0);
  // El reloj arranca solo al mostrar la pregunta.
  await expect(
    page.getByRole("button", { name: "Pausar reloj" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirmar y revelar", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Respuesta del equipo")
    .selectOption("La perilla del televisor");
  await page
    .getByRole("button", { name: "Confirmar y revelar", exact: true })
    .click();
  await expect(page.getByLabel("Respuesta del equipo")).toBeDisabled();
  await expect(page.locator(".reveal")).toContainText("perilla");
  await expect(page.locator(".scoreboard strong").first()).toHaveText("10");
  await expect(
    page.getByRole("button", { name: "Iniciar reloj", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".scoreboard strong").first()).toHaveText("10");
  await page.getByRole("button", { name: "🏠 Menú de juegos" }).first().click();
  await expect(page.locator(".game-card").first()).toContainText(
    "1 de 12 preguntas",
  );
  await page.locator(".game-card").nth(4).click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await expect(
    page.getByText("Representá a alguien cebando mate.", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".mime-card-code")).toContainText("M037");
  await expect(page.locator(".private-answer")).toHaveCount(0);
});

test("Bingo musical: marcar canciones, verificar e imprimir cartones", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  await page.locator(".bingo-tile").click();
  await expect(page.locator(".bingo-now")).toContainText("Escuchen");
  const seed = await page.evaluate(
    () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingo.seed,
  );
  // Las 9 canciones del cartón 4, calculadas igual que el juego.
  const cards = await context.newPage();
  await cards.goto("/?cartones=1");
  await expect(cards.locator(".bingo-sheet")).toHaveCount(30);
  const titles = await cards
    .locator(".bingo-sheet")
    .nth(3)
    .locator(".bingo-sheet-grid b")
    .allTextContents();
  expect(titles).toHaveLength(9);
  await cards.close();
  for (const t of titles.slice(0, 3))
    await page
      .locator(".bingo-songs button", {
        has: page.getByText(t, { exact: true }),
      })
      .click();
  await expect(page.locator(".bingo-now h2")).toHaveText(titles[2]);
  await page.getByLabel("¿Alguien cantó? Número de cartón").fill("4");
  await page.getByRole("button", { name: "Verificar cartón" }).click();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡LÍNEA! 👏");
  await page.reload();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡LÍNEA! 👏");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingo.seed,
    ),
  ).toBe(seed);
  await page.getByRole("button", { name: "Seguir jugando" }).click();
  await page.getByRole("button", { name: "🏠 Menú de juegos" }).first().click();
  await expect(page.locator(".game-card")).toHaveCount(9);
});
