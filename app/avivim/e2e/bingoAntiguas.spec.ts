import { test, expect } from "@playwright/test";

test("Bingo de series de antes: cortina tapada, escena, respuesta, cartones y verificación", async ({
  page,
  context,
}) => {
  // Sin red hacia YouTube: solo se comprueba qué video se pide.
  await context.route(/youtube/, (r) => r.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  await expect(page.locator(".game-card")).toHaveCount(10);
  const before = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("mazal-avivim-v1")!);
    return { bingo: s.bingo, bingo6070: s.bingo6070, series: s.bingoSeries };
  });
  await page.locator(".bingo-antiguas-tile").click();
  await expect(page.locator(".bingo-antiguas-stage .eyebrow")).toContainText(
    "0 de 52 series",
  );
  // Los cartones se imprimen sin cargar nada.
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "🖨️ Imprimir 30 cartones" }).click();
  const cards = await popup;
  await expect(cards.locator(".bingo-sheet")).toHaveCount(30);
  await expect(cards.locator(".bingo-sheet-head span").first()).toHaveText(
    "📺 BINGO DE SERIES DE ANTES",
  );
  await cards.close();
  // Super Agente 86 desde la lista: suena la cortina, tapada.
  await page.getByRole("button", { name: /^Super Agente 86/ }).click();
  const frame = page.locator(".yt-frame iframe");
  await expect(frame).toHaveAttribute("src", /embed\/_crj6n1ZDcU\?autoplay=1/);
  await expect(page.locator(".yt-cover")).toBeVisible();
  await expect(page.locator(".series-answer")).toHaveCount(0);
  // La escena muestra el video con el título tapado.
  await page.getByRole("button", { name: "🎬 Escena", exact: true }).click();
  await expect(frame).toHaveAttribute("src", /embed\/cfE--nELmOE/);
  await expect(page.locator(".yt-cover")).toHaveCount(0);
  await expect(page.locator(".yt-band")).toBeVisible();
  await page.getByRole("button", { name: "Mostrar respuesta" }).click();
  await expect(page.locator(".series-answer")).toHaveText("Super Agente 86");
  await expect(page.locator(".yt-band")).toHaveCount(0);
  // Un enlace nuevo reemplaza al de la lista y acepta el segundo de inicio.
  await page.getByText("🔗 Cambiar los videos de «Super Agente 86»").click();
  await page
    .getByLabel("🎬 Escena", { exact: true })
    .fill("https://youtu.be/L15b96NGuWw?t=45");
  await page.getByRole("button", { name: "Guardar enlaces" }).click();
  await expect(frame).toHaveAttribute("src", /embed\/L15b96NGuWw.*start=45/);
  // La pantalla pública sigue la partida; el panel privado no reproduce.
  const publicPage = await context.newPage();
  await publicPage.goto("/?public=1");
  await expect(publicPage.locator(".series-answer")).toHaveText(
    "Super Agente 86",
  );
  await expect(publicPage.locator(".yt-frame iframe")).toHaveCount(1);
  const panel = await context.newPage();
  await panel.goto("/?conductor=1");
  await expect(panel.locator(".yt-frame")).toHaveCount(0);
  await panel.close();
  await publicPage.close();
  // Al azar, sin repetir, hasta completar la lista.
  for (let i = 1; i < 52; i++)
    await page
      .getByRole("button", { name: "🎲 Sacar una serie al azar" })
      .click();
  await expect(page.locator(".bingo-antiguas-stage .eyebrow")).toContainText(
    "52 de 52 series",
  );
  await expect(
    page.getByRole("button", { name: "🎲 Sacar una serie al azar" }),
  ).toBeDisabled();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingoAntiguas,
  );
  expect(new Set(saved.played).size).toBe(52);
  await page.getByLabel("¿Alguien cantó? Número de cartón").fill("7");
  await page.getByRole("button", { name: "Verificar cartón" }).click();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡BINGO! 🎉");
  await page.getByRole("button", { name: "Seguir jugando" }).click();
  await page.getByRole("button", { name: "↩ Deshacer la última" }).click();
  await expect(page.locator(".bingo-antiguas-stage .eyebrow")).toContainText(
    "51 de 52 series",
  );
  // Los otros bingos no cambian.
  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("mazal-avivim-v1")!);
    return { bingo: s.bingo, bingo6070: s.bingo6070, series: s.bingoSeries };
  });
  expect(after).toEqual(before);
});
