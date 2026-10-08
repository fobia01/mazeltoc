# Mazeltoc

Juego educativo interactivo de Bet Am del Oeste para la Feria del Libro de La Matanza: memoria de símbolos, mito o verdad, línea del tiempo y más, organizado por nivel (Jardín, Primaria, Secundaria).

## Estructura del repositorio

- **`/web`** — Versión web: un único `index.html` autocontenido (HTML, CSS y JavaScript embebidos, con el logo de Bet Am del Oeste en base64), sin backend. Instalable como PWA offline (`manifest.json` + `sw.js`). Publicada en GitHub Pages: https://fobia01.github.io/mazeltoc/
- **`/app`** — App Flutter (`mazeltoc_app`) que envuelve la misma web en un WebView nativo a pantalla completa, para generar APK/IPA instalables. Usa `webview_flutter`, con las fuentes (Baloo 2, Quicksand) empaquetadas localmente para funcionar 100% offline.

## Mazal Toc Avivim

Juego para adultos mayores, preparado para una pantalla compartida: letras grandes, fotos reales, ovaciones y respuestas que se revelan después de confirmar.

- Juego: https://fobia01.github.io/mazeltoc/avivim/
- Preparación privada (antes de proyectar): https://fobia01.github.io/mazeltoc/avivim/?conductor=1
- Código fuente y guía: [`app/avivim`](app/avivim).
- Versión publicada: `web/avivim`. Para actualizarla, ejecutar `npm ci && npm run build` en `app/avivim` y copiar `dist/` a `web/avivim/`. El flujo existente de Pages publica la carpeta `web`.
