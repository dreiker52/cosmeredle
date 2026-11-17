# Cosmeredle

Juego diario de adivinar un personaje del Cosmere por sus atributos: nombre, mundo de origen, libro de primera aparición, especie y poderes/Investidura. Disponible en español e inglés.

> Proyecto de fans no oficial. No está afiliado ni respaldado por Brandon Sanderson ni Dragonsteel Entertainment. Datos basados en la [Coppermind](https://coppermind.net).

Plan completo del proyecto: [PLAN.md](PLAN.md).

## Requisitos

- Node.js 22 (recomendado instalarlo con [nvm](https://github.com/nvm-sh/nvm))

## Comandos

```bash
npm install          # instalar dependencias (genera package-lock.json)
npm run dev          # servidor de desarrollo en http://localhost:5173/cosmeredle/
npm test             # tests (Vitest)
npm run validate-data
npm run build        # build de producción en dist/
npm run preview      # previsualizar el build
```

## Estructura

```
data/            taxonomy.json, books.json, characters.json (datos del juego)
scripts/         scripts de datos (validación, y más adelante extracción de la Coppermind)
src/data/        esquema Zod y validación
src/game/        lógica del juego (comparación de atributos)
src/lib/         personaje del día, PRNG, localStorage
src/i18n/        diccionarios ES/EN y proveedor de idioma
src/components/  componentes de interfaz
tests/           tests unitarios
```

## Despliegue (GitHub Pages)

1. Crear un repositorio **público** llamado `cosmeredle` en GitHub y subir el código a `main`.
2. En *Settings → Pages → Build and deployment → Source*, elegir **GitHub Actions**.
3. Cada push a `main` ejecuta validación, tests y build, y despliega en `https://<usuario>.github.io/cosmeredle/`.

Si el repositorio tiene otro nombre o se usa un dominio propio, cambiar `base` en [vite.config.ts](vite.config.ts).

## Licencia

Código bajo licencia MIT. Los datos derivados de la Coppermind están sujetos a la licencia de la wiki.
