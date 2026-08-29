# Mazeltoc

Juego educativo interactivo de Bet Am del Oeste para la Feria del Libro de La Matanza: memoria de símbolos, mito o verdad, línea del tiempo y más, organizado por nivel (Jardín, Primaria, Secundaria).

## Estructura del repositorio

- **`/web`** — Versión web: un único `index.html` autocontenido (HTML, CSS y JavaScript embebidos, con el logo de Bet Am del Oeste en base64), sin backend. Instalable como PWA offline (`manifest.json` + `sw.js`). Publicada en GitHub Pages: https://fobia01.github.io/mazeltoc/
- **`/app`** — App Flutter (`mazeltoc_app`) que envuelve la misma web en un WebView nativo a pantalla completa, para generar APK/IPA instalables. Usa `webview_flutter`, con las fuentes (Baloo 2, Quicksand) empaquetadas localmente para funcionar 100% offline.
