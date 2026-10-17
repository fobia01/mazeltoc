import { test, expect } from "@playwright/test";

// Un audio WAV mínimo (silencio corto) para simular los fragmentos.
function wav() {
  const samples = 800;
  const b = Buffer.alloc(44 + samples * 2);
  b.write("RIFF", 0);
  b.writeUInt32LE(36 + samples * 2, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24);
  b.writeUInt32LE(16000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(samples * 2, 40);
  return b;
}
const fragments = (names: string[]) =>
  names.map((name) => ({
    name: `${name}.wav`,
    mimeType: "audio/wav",
    buffer: wav(),
  }));
const titles = [
  "Super Agente 86",
  "Bonanza",
  "Hechizada",
  "Mi bella genio",
  "Batman",
  "Kojak",
  "Columbo",
  "El hombre nuclear",
  "Los ángeles de Charlie",
  "El padrino",
  "Grease",
  "Mary Poppins",
];

test("Bingo de series y películas: avisos, fragmentos locales, cartones y verificación", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Iniciar el programa" }).click();
  await expect(page.locator(".game-card")).toHaveCount(9);
  await page.locator(".bingo-series-tile").click();
  const musical = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("mazal-avivim-v1")!);
    return { bingo: s.bingo, bingo6070: s.bingo6070 };
  });
  // Sin archivos: aviso claro y botones apagados.
  await expect(page.locator(".series-warning")).toContainText(
    "Todavía no cargaste fragmentos",
  );
  await expect(
    page.getByRole("button", { name: "▶ Reproducir fragmento" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "🖨️ Imprimir 30 cartones" }),
  ).toBeDisabled();
  // Pocos archivos: dice cuántos faltan.
  const picker = page.getByLabel("Elegir fragmentos de video o audio");
  await picker.setInputFiles(fragments(titles.slice(0, 5)));
  await expect(page.locator(".series-warning")).toContainText(
    "Cargaste 5 fragmentos",
  );
  await expect(page.locator(".series-warning")).toContainText("agregá 4 más");
  // Lista completa (reemplaza la anterior).
  page.once("dialog", (d) => d.accept());
  await picker.setInputFiles(fragments(titles));
  await expect(page.locator(".series-warning")).toHaveCount(0);
  await expect(page.locator(".series-info")).toContainText(
    "12 fragmentos listos",
  );
  // Ningún archivo queda guardado: solo los nombres.
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mazal-avivim-v1")!),
  );
  expect(saved.bingoSeries.names).toHaveLength(12);
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "🖨️ Imprimir 30 cartones" }).click();
  const cards = await popup;
  await expect(cards.locator(".bingo-sheet")).toHaveCount(30);
  const names = await cards
    .locator(".bingo-sheet")
    .nth(1)
    .locator(".bingo-sheet-grid b")
    .allTextContents();
  expect(names).toHaveLength(9);
  await cards.close();
  // Reproducir al azar todos, sin repetir; la respuesta queda oculta.
  const heard: string[] = [];
  const publicPage = await context.newPage();
  await publicPage.goto("/?public=1");
  for (let i = 0; i < titles.length; i++) {
    await page.getByRole("button", { name: "▶ Reproducir fragmento" }).click();
    await expect(page.locator(".bingo-now audio")).toHaveCount(1);
    await expect(page.locator(".series-answer")).toHaveCount(0);
    await page.getByRole("button", { name: "Mostrar respuesta" }).click();
    heard.push((await page.locator(".series-answer").textContent())!);
    if (i === 0)
      await expect(publicPage.locator(".series-answer")).toHaveText(heard[0]);
    if (heard.length === 3)
      await page.screenshot({ path: "/private/tmp/avivim-series-juego.png" });
  }
  expect(new Set(heard).size).toBe(titles.length);
  await expect(page.locator(".series-warning")).toContainText(
    "Ya salieron todos",
  );
  await expect(
    page.getByRole("button", { name: "▶ Reproducir fragmento" }),
  ).toBeDisabled();
  await page.getByLabel("¿Alguien cantó? Número de cartón").fill("2");
  await page.getByRole("button", { name: "Verificar cartón" }).click();
  await expect(page.locator(".bingo-verdict")).toHaveText("¡BINGO! 🎉");
  // Al recargar, los nombres siguen pero hay que volver a elegir los archivos.
  await page.reload();
  await page.getByRole("button", { name: "Seguir jugando" }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Empezar de nuevo" }).click();
  await expect(page.locator(".series-warning")).toContainText(
    "volvé a elegir los mismos archivos",
  );
  await page
    .getByLabel("Elegir fragmentos de video o audio")
    .setInputFiles(fragments([...titles].reverse()));
  await expect(page.locator(".series-warning")).toHaveCount(0);
  const again = await page.evaluate(
    () => JSON.parse(localStorage.getItem("mazal-avivim-v1")!).bingoSeries,
  );
  expect(again.names).toEqual(saved.bingoSeries.names);
  expect(again.seed).toBe(saved.bingoSeries.seed);
  // Los otros bingos siguen intactos.
  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("mazal-avivim-v1")!);
    return { bingo: s.bingo, bingo6070: s.bingo6070 };
  });
  expect(after).toEqual(musical);
  await page.getByRole("button", { name: "🏠 Menú de juegos" }).first().click();
  await page.screenshot({ path: "/private/tmp/avivim-series-menu.png" });
});
