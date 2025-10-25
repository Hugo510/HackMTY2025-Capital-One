# HackMTY Backend (Express + TypeScript)

Proyecto base con Express y TypeScript.

Comandos principales:

```bash
# instalar dependencias
npm install

# modo desarrollo (con recarga)
npm run dev

# compilar
npm run build

# ejecutar build
npm start
```

Notas sobre nodemon

- El proyecto usa `nodemon` junto con `ts-node` para un ciclo de desarrollo rápido. La configuración está en `nodemon.json` y el script `dev` establece `NODE_ENV=development`.
- Si necesita mayor performance al transpilar, use `npm run build` y `npm start` para correr el código compilado en `dist/`.

Endpoint de verificación: `GET /health`
