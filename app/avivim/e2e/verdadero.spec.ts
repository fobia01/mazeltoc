import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const original = JSON.parse(
  readFileSync(
    new URL(
      "../src/respaldos/verdadero-o-puro-cuento-original.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

test("Una partida guardada recibe las preguntas nuevas de Verdadero o puro cuento", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  // Simula una partida guardada antes del cambio, con una pregunta editada a mano.
  await page.evaluate((old) => {
    const key = "mazal-avivim-v1";
    const s = JSON.parse(localStorage.getItem(key)!);
    s.bank = s.bank.map((q: { id: string }) => {
      const o = old.find((x: { id: string }) => x.id === q.id);
      return o ? { ...o } : q;
    });
    const edited = s.bank.find((q: { id: string }) => q.id === "avivim-031");
    edited.text = "Pregunta propia del conductor.";
    localStorage.setItem(key, JSON.stringify(s));
  }, original);
  await page.reload();
  await page.getByRole("button", { name: "🏠 Menú de juegos" }).first().click();
  const bank = await page.evaluate(
    () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bank,
  );
  const round = bank.filter((q: { round: number }) => q.round === 4);
  expect(round).toHaveLength(12);
  expect(round.find((q: { id: string }) => q.id === "avivim-031").text).toBe(
    "Pregunta propia del conductor.",
  );
  expect(
    round.filter((q: { text: string }) =>
      original.some((o: { text: string }) => o.text === q.text),
    ),
  ).toHaveLength(0);
  // Se juega: la explicación se ve recién después de responder.
  await page.locator(".game-card").nth(3).click();
  await page
    .getByRole("button", { name: "Mostrar siguiente pregunta" })
    .click();
  await expect(page.getByText(/Carlos Gardel murió en 1935/)).toBeVisible();
  await expect(page.locator(".reveal")).toHaveCount(0);
  await expect(page.getByText(/Fue en Medellín/)).toHaveCount(0);
  await page.getByLabel("Respuesta del equipo").selectOption("Puro cuento");
  await page
    .getByRole("button", { name: "Confirmar y revelar", exact: true })
    .click();
  await expect(page.locator(".reveal")).toContainText("Puro cuento");
  await expect(page.locator(".reveal")).toContainText("Fue en Medellín");
  await expect(page.locator(".scoreboard strong").first()).toHaveText("10");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "/private/tmp/avivim-verdadero-respuesta.png",
    fullPage: true,
  });
});
