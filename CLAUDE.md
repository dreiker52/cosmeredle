# CLAUDE.md

## Forma de trabajar
- **Hazlo tú.** Ejecuta tú mismo todo lo necesario (instalar herramientas, dependencias, ejecutar tests, builds, scripts, etc.) sin pedir al usuario que lo haga.
- **Solo pregunta** por cosas que no puedes hacer tú, y únicamente si estás 100 % seguro de que no puedes (p. ej. contraseñas, `sudo`, credenciales de GitHub, acciones en la web de GitHub, decisiones personales como el nombre del autor).
- Responde en español.

## Proyecto
- Plan completo: [PLAN.md](PLAN.md). Solo modo clásico; columnas: nombre, mundo de origen, libro de primera aparición, especie, poderes/Investidura.
- Stack: Vite + React + TypeScript + Tailwind, Vitest, Zod. Hosting en GitHub Pages (`base: "/cosmeredle/"`).
- Node.js 22 está instalado en `~/.local/node` (binario oficial, sin nvm). Usar `export PATH="$HOME/.local/node/bin:$PATH"` antes de `node`/`npm`.
- Git: remoto `git@github.com:dreiker52/cosmeredle.git`, rama `main`. El repo usa la clave `~/.ssh/id_ed25519_github` (configurada en `core.sshCommand` del repo). Cada push a `main` despliega en https://dreiker52.github.io/cosmeredle/.
- Comandos: `npm run dev`, `npm test`, `npm run validate-data`, `npm run build`, `npm run schedule:build` / `schedule:check` / `schedule:preview`. `data:build` ya regenera también el calendario.
- Datos de personajes: NO editar `data/characters.json` a mano; se regenera con `npm run data:build` a partir del volcado de la Coppermind (`npm run data:fetch`). Las correcciones van en `data/overrides.json` (con `spoilerNotes` explicando el motivo). La Coppermind no se puede consultar directamente (Cloudflare); no intentar saltarse esa protección.
- Los datos guardan ids (nunca texto traducido); las traducciones van en `data/taxonomy.json`, `data/books.json` y `src/i18n/*.json`.
