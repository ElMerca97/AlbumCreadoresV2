# 📁 Carpeta de imágenes de MaldonadoCards

Esta carpeta (`public/images/`) es la **raíz** de todas las imágenes del array de figuritas
(`src/data/stickers.ts`). Vite la copia tal cual a `dist/images/` al hacer el build, así que
todo lo que pongas acá queda disponible en la web con la misma ruta.

> Regla de oro: **la ruta del array = la ruta dentro de `public/`**
> `image: "images/stickers/Comun/MorronComun.png"` → `public/images/stickers/Comun/MorronComun.png`

## ✅ Cómo subir las imágenes

1. Copiá cada PNG dentro de la subcarpeta que le corresponde (ver lista abajo).
2. Respetá **exactamente** mayúsculas/minúsculas, acentos y la extensión.
3. Abrí la app → botón **"🖼️ VERIFICAR IMÁGENES"** (en el pie de página).
   Te muestra en verde las que encontró y en rojo las que faltan, y podés copiar la lista.

Si una ruta exacta no existe, la app prueba automáticamente:
- la misma ruta **sin acentos** (ej: `AarónComun.png` → `AaronComun.png`)
- otras extensiones (`.jpg`, `.jpeg`, `.webp`)
- y si nada aparece, dibuja un avatar genérico con las iniciales del jugador (la carta nunca queda rota).

Tamaño recomendado: PNG con fondo transparente, ~600×800 px (proporción 3:4).

## 🗂️ Estructura y archivos esperados (60)

```
public/images/
├── stickers/
│   ├── Comun/          (15)
│   ├── Legends/        (15)  ← VERSION ÉPICO
│   ├── 80's/           (9)
│   ├── Dios/           (12)  ← MODO DIOS
│   └── Alternative/    (2)
└── Clubes/             (7)   ← ESCUDOS
```

### stickers/Comun/ — VERSION COMÚN
- AarónComun.png
- AgusComun.png
- AndresComun.png
- CristianComun.png
- CundoComun.png
- ElMercaComun.png
- JonaComun.png
- ManuRodriguezComun.png
- MatoComun.png
- MatuteComun.png
- MorronComun.png
- NahuelComun.png
- RolangasComun.png
- SangarazaComun.png
- SebaComun.png

### stickers/Legends/ — VERSION ÉPICO
- AarónLegends.png
- AgusLegends.png
- AndresLegends.png
- CristianLegends.png
- CundoLegends.png
- ElMercaLegends.png
- JonaLegends.png
- ManuLegends.png
- MatoLegends.png
- MatuteLegends.png
- MorronLegends.png
- NahuelLegends.png
- RolangasLegends.png
- SebaLegends.png
- sangarazaLegends.png   ← ojo: empieza con "s" minúscula, así está en el array

### stickers/80's/ — VERSION 80'S
- Andres80.png
- Cundo80.png
- ElMerca80.png
- Manu80.png
- Matute80.png
- Nahuel80.png
- Rolangas80.png
- Sangaraza80.png
- Seba80.png

### stickers/Dios/ — MODO DIOS
- AgusDios.png
- AndresDios.png
- CristianDios.png
- CundoDios.png
- ElMercaDios.png
- JonaDios.png
- ManuDios.png
- MatuteDios.png
- MorronDios.png
- NahuelDios.png
- RolangasDios.png
- SanGarazaDios.png     ← ojo: "SanGaraza" con G mayúscula, así está en el array

### stickers/Alternative/ — ALTERNATIVA
- AlternativeMato.png
- AlternativeSangaraza.png

### Clubes/ — ESCUDOS
- Chiveo.png
- FCCarolino.png
- Mazzoni.png
- Presion.png
- Sacachispas.png
- SeleccionMaldonadoCreadores.png
- Vikingos.png

## 🔧 Cambiar la raíz (opcional)

Si preferís servir las imágenes desde otro lado (un CDN, otro dominio, etc.), editá la
constante `IMAGES_ROOT` en `src/lib/images.ts`:

```ts
export const IMAGES_ROOT: string = "https://mi-cdn.com/maldonadocards/";
```

Las rutas del array no cambian: se concatenan a esa raíz.
