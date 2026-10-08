# MAZAL TOC AVIVIM

Juego local para la comunidad Avivim de Bet Am del Oeste. React, TypeScript, Vite, Tailwind y Lucide. No requiere cuentas ni servicios externos durante el juego. El proyecto Flutter del directorio padre se conserva.

## Abrir

Requiere Node.js 20.19+ o 22.12+.

```sh
cd mazal-toc-avivim
npm install
npm run dev
```

Juego compartido: http://localhost:5173/ · Panel privado: http://localhost:5173/?conductor=1 · Público: http://localhost:5173/?public=1

Para el evento y el modo offline, usá la compilación de producción:

```sh
npm run build
npm run preview -- --port 4173
```

Juego compartido: http://localhost:4173/ · Panel privado: http://localhost:4173/?conductor=1 · Público: http://localhost:4173/?public=1

Abrí ambas pantallas, esperá la instalación del service worker y recargá una vez. Después de actualizar una instalación existente, cerrá todas las ventanas de la aplicación y volvé a abrirla para activar la nueva versión; la partida sigue guardada. La PWA almacena HTML, JS, CSS, icono y banco inicial. Instalá desde el menú del navegador (Chrome/Edge), donde esté disponible. El modo desarrollo no registra el service worker. Usá siempre el mismo origen y puerto: los datos se guardan por origen.

## Una notebook y una pantalla duplicada

La URL principal `/` abre **el juego compartido**, preparado para proyectar exactamente lo que ve el conductor. No contiene el banco de soluciones ni una consigna privada en pantalla. Las opciones se presentan sin marcar la correcta.

1. Antes de proyectar, abrí «Preparar equipos y materiales» (`/?conductor=1`). Configurá los equipos y los tiempos e imprimí las tarjetas de mímica. Este panel contiene soluciones: usalo durante la preparación o con pantallas extendidas.
2. Volvé a «Proyectar juego compartido» y conectá el televisor con la pantalla duplicada. La aplicación abre este modo por defecto.
3. Iniciá el programa, elegí ronda y equipo y mostrá la pregunta. El equipo puede responder con las tarjetas A/B/C o en voz alta.
4. Registrá la opción en «Respuesta del equipo» y pulsá «Confirmar respuesta». La elección queda bloqueada para ese equipo y esa pregunta. Para consignas abiertas se confirma que el equipo respondió oralmente.
5. Solo después se habilita «Revelar respuesta». La solución y su explicación aparecen para todos. En preguntas con opciones, «Registrar resultado del equipo» calcula acierto o error comparando con la elección confirmada. En respuestas abiertas, el conductor marca Acierto o Error después de revelar.
6. La mímica muestra únicamente un código como **M037**, que coincide con la tarjeta impresa. Entregá ese papel al participante sin mostrarlo al resto del equipo. No se muestra la consigna hasta revelarla.
7. En la final, bloqueá las apuestas antes de mostrar la pregunta. Elegí cada equipo y confirmá su respuesta; la solución se habilita recién cuando todos confirmaron. Registrá los resultados de cada uno antes de preparar otra pregunta final.
8. Puntajes, respuestas confirmadas y apuestas se conservan al cerrar o recargar el navegador. Los botones «¡Ovación!» y «¡Buuu!» no modifican los puntajes.

### Dos pantallas independientes (opcional)

Con «extender pantallas», el panel privado está en `/?conductor=1` y la ventana del público en `/?public=1`. Conservá el primero en la notebook y mové el segundo al proyector. Las consignas privadas del panel no deben proyectarse. Ambas ventanas usan el mismo origen y perfil del navegador.

## Banco y multimedia

60 consignas iniciales originales: 48 de recuerdos/cultura cotidiana argentina y 12 de cultura judía. Las consignas de mímica son abiertas; las musicales iniciales son preguntas culturales y pueden enriquecerse con archivos autorizados. El editor permite crear, editar, eliminar, añadir rondas e importar/exportar JSON. Valida IDs únicos, respuesta entre opciones y rangos de puntaje y tiempo. No se repiten preguntas en una partida salvo «Repetir», que no habilita sumar puntos dos veces.

Las preguntas históricas/culturales llevan referencias consultables. Los usos de objetos y consignas gestuales se basan en conocimientos cotidianos y no en una comprobación archivística individual. Revisá el banco con el organizador antes del encuentro para adecuar recuerdos y dificultad.

Incluye 14 fotografías reales de objetos, un instrumento musical y objetos de cultura judía, guardadas en `public/images`, con autores y licencias en `public/images/CREDITS.json`. Se muestran directamente en los desafíos, también para las partidas guardadas antes de esta actualización. En el banco podés abrir la galería de fotos incluidas. Las imágenes muestran ejemplos de objetos; no todas corresponden a modelos argentinos. Podés reemplazarlas por fotos propias desde el editor. No se incluyen grabaciones musicales comerciales. Los archivos se guardan en IndexedDB, disponibles sin internet en ese navegador. No se envían a servidores. Los exportados JSON incluyen identificadores multimedia, no los archivos: al pasar a otra computadora, agregá esos recursos nuevamente. Podés poner opciones vacías para reconocer una canción o una imagen mediante respuesta abierta.

## Guardado y recuperación

Cada acción se persiste en LocalStorage antes de difundirse por BroadcastChannel; los eventos `storage` son el respaldo. Ambas ventanas deben estar en el mismo navegador, perfil y origen. Recuperá la partida abriendo la misma URL después de un cierre. El reloj guarda su hora de finalización, por lo que continúa contabilizando el tiempo incluso si se cierra la ventana. Las ventanas públicas no pueden modificar la partida desde la interfaz.

En Configuración podés exportar y recuperar una partida, solicitar almacenamiento persistente, ajustar volumen/movimiento y reiniciar el torneo. El reinicio conserva equipos y banco. Conservá una copia JSON antes del evento; borrar datos del navegador elimina la partida y los recursos locales.

Solo usá **un panel conductor** a la vez. La sincronización no resuelve escrituras simultáneas de varios conductores. El almacenamiento local no es cifrado.

## Impresión y accesibilidad

Materiales A4: tarjetas A/B/C, carteles, mímica, desafíos, planilla, guion y diplomas. El diálogo del navegador permite imprimir o guardar PDF. Interfaz festiva inspirada directamente en el repositorio local `mazeltoc/web/simjat-tora`: Atkinson Hyperlegible para lectura y Baloo 2 para títulos, fuentes empaquetadas offline, azul intenso, dorado, verde, coral y violeta, tarjetas grandes y banderitas. Botones de al menos 58 px, foco visible, etiquetas, texto público grande, alto contraste y respeto de `prefers-reduced-motion`. Podés elegir letras grandes o extra grandes en Configuración; el cambio se sincroniza con la pantalla pública. Configuración permite desactivar animaciones. Los tiempos de la partida son 30, 45, 60, 90 o 120 segundos; el editor almacena la duración sugerida de cada pregunta.

## Verificar

```sh
npm test
npm run build
npx playwright test
```

La suite de motor cubre puntajes, apuestas, dobles, validación, recuperación, desempate y no repetición. La suite de navegador cubre el flujo, sincronización (incluido respaldo storage), recarga y offline de producción. Puede requerir `npx playwright install chromium` la primera vez.

No se garantiza una auditoría WCAG completa. Antes del evento verificá legibilidad a la distancia real, audio, salida HDMI y desconexión de red. Ovaciones, festejos y abucheos son grabaciones de la edición Simjat Torá, con créditos en `public/audio/CREDITS.txt`. Los aciertos alternan tres festejos; los errores reproducen el “buuu” de hinchada y el ganador tiene su propia celebración. Los botones «¡Ovación!» y «¡Buuu!» disparan sonidos manuales sin alterar el puntaje. Web Audio mezcla los archivos con fanfarrias originales y un compresor; el volumen y silencio afectan a todo. En la pantalla pública, pulsá «Activar sonido del público» una vez para habilitar la salida. Fuentes, fotos y audios se precargan en el caché offline al instalar.
