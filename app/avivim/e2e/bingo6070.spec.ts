import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const actors: {id:string; nombre:string; pista:string}[] = JSON.parse(readFileSync(new URL("../src/actores6070.json", import.meta.url), "utf8"));

test("Bingo 60 y 70: pistas, impresión, línea, bingo y partidas independientes", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  await page.locator(".bingo6070-tile").click();
  await expect(page.locator(".bingo-now")).toContainText("Escuchen la pista");
  await page.screenshot({
    path: "/private/tmp/avivim-bingo6070-juego.png",
    fullPage: false,
  });
  const musical = await page.evaluate(
    () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingo,
  );
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "🖨️ Imprimir 30 cartones" }).click();
  const cards = await popup;
  await expect(cards.locator(".bingo-sheet")).toHaveCount(30);
  const names = await cards
    .locator(".bingo-sheet")
    .nth(3)
    .locator(".bingo-sheet-grid b")
    .allTextContents();
  expect(names).toHaveLength(9);
  await expect(
    cards.locator(".bingo-sheet-grid small, .bingo-sheet-grid img"),
  ).toHaveCount(0);
  await cards.screenshot({
    path: "/private/tmp/avivim-bingo6070-cartones.png",
    fullPage: false,
  });
  await cards.close();
  const publicPage = await context.newPage();
  await publicPage.goto("/?public=1");
  for (const name of names.slice(0, 3)) {
    const actor = actors.find((a) => a.nombre === name)!;
    await page
      .locator(".bingo-songs button")
      .filter({ has: page.getByText(actor.pista, { exact: true }) })
      .click();
    await expect(page.locator(".bingo-now h2")).toHaveText(actor.pista);
    await expect(page.locator(".bingo-now p")).toHaveCount(0);
    await expect(publicPage.locator(".bingo-now h2")).toHaveText(actor.pista);
  }
  await page
    .getByRole("button", { name: "Mostrar respuesta", exact: true })
    .click();
  await expect(page.locator(".bingo-now p")).toHaveText(names[2]);
  await page.getByLabel("¿Alguien cantó? Número de cartón").fill("4");
  await page.getByRole("button", { name: "Verificar cartón" }).click();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡LÍNEA! 👏");
  await page.reload();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡LÍNEA! 👏");
  await page.getByRole("button", { name: "Seguir jugando" }).click();
  for (const name of names.slice(3)) {
    const actor = actors.find((a) => a.nombre === name)!;
    await page
      .locator(".bingo-songs button")
      .filter({ has: page.getByText(actor.pista, { exact: true }) })
      .click();
  }
  await page.getByLabel("¿Alguien cantó? Número de cartón").fill("4");
  await page.getByRole("button", { name: "Verificar cartón" }).click();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡BINGO! 🎉");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingo,
    ),
  ).toEqual(musical);
  await page.getByRole("button", { name: "🏠 Menú de juegos" }).first().click();
  await page.locator(".bingo-tile").click();
  await expect(page.locator(".bingo-now")).toContainText(
    "Escuchen con atención",
  );
});
