# Tier List de Anime

App web con login/contraseña donde cada usuario lleva su propia tier list
de anime, calculada automáticamente a partir de 6 categorías (0-5 ⭐ cada una)
con los mínimos por tier que definisteis:

- **S** (27-30): mínimo 4★ en Historia, Personajes y Animación
- **A** (23-26): mínimo 3★ en Historia y Personajes
- **B** (19-22) / **C** (15-18) / **D** (11-14) / **E** (6-10) / **F** (0-5): sin mínimos extra

Si un anime no cumple los mínimos de su tier "por puntuación", baja
automáticamente al siguiente tier hasta que sí los cumple. Puedes cambiar
estos números en `app.js`, al principio del archivo, en `CATEGORIES` y `TIERS`.

Todo gratis: **Supabase** (base de datos + usuarios) + **Netlify** (hosting).
No hace falta tarjeta de crédito para ninguno de los dos en este plan.

---

## 1. Crear el backend en Supabase (5 min)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratis.
2. Crea un **New Project** (elige una contraseña de base de datos, guárdala,
   no la necesitarás para esto pero por si acaso).
3. Espera a que el proyecto termine de aprovisionarse (~2 min).
4. Ve a **SQL Editor** (menú izquierdo) → **New query**.
5. Abre el archivo `supabase-setup.sql` de esta carpeta, copia todo su
   contenido, pégalo en el editor y pulsa **Run**. Esto crea la tabla
   `animes` y las reglas de seguridad para que cada usuario solo vea lo suyo.
6. Ve a **Project Settings** (icono de engranaje) → **API**.
7. Copia:
   - **Project URL**
   - **anon public** key

## 2. Configurar el proyecto en VS Code

1. Abre `supabaseClient.js` en VS Code.
2. Sustituye:
   ```js
   const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
   const SUPABASE_ANON_KEY = "TU-ANON-KEY-AQUI";
   ```
   por los valores que copiaste en el paso anterior.
3. (Opcional, recomendado para probar rápido) En Supabase, ve a
   **Authentication → Providers → Email** y desactiva
   "Confirm email" mientras pruebas, así puedes registrarte y entrar
   al momento sin revisar un correo. Puedes reactivarlo luego.
4. Para probar en local: instala la extensión **Live Server** en VS Code,
   clic derecho sobre `login.html` → **Open with Live Server**.

## 3. Subir el código a GitHub

1. Crea un repositorio nuevo en [github.com](https://github.com) (puede ser privado).
2. En VS Code, abre la terminal integrada en esta carpeta y ejecuta:
   ```
   git init
   git add .
   git commit -m "Tier list de anime"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

## 4. Publicar gratis en Netlify

1. Ve a [netlify.com](https://netlify.com) y crea una cuenta gratis
   (puedes entrar directamente con tu cuenta de GitHub).
2. **Add new site → Import an existing project → Deploy with GitHub**.
3. Selecciona el repositorio que acabas de subir.
4. Como es un sitio estático (sin build), deja los campos de "Build command"
   vacíos y "Publish directory" como `.` (la raíz). Pulsa **Deploy**.
5. En 1-2 minutos tendrás una URL pública tipo
   `https://tu-nombre-random.netlify.app` — esa es tu web, en internet,
   gratis, con login por usuario y contraseña.

> Alternativa igual de válida y gratis: **Vercel** (vercel.com) o
> **GitHub Pages** (Settings → Pages en tu repo) — el proceso es equivalente.

## 5. Usar la app

1. Entra en tu URL → verás la pantalla de login.
2. Pulsa "Regístrate", crea tu usuario con email + contraseña.
3. Ya dentro, pulsa el botón **+** para añadir tu primer anime: título,
   portada (pega una URL de imagen) y las 6 puntuaciones con estrellas.
4. La tier list se recalcula sola y coloca cada anime en su fila.
5. Toca cualquier tarjeta para editarla o eliminarla.

---

## Estructura de archivos

```
anime-tier-list/
├── index.html          # App principal (tier list)
├── login.html          # Login / registro
├── style.css           # Estilos compartidos
├── app.js              # Lógica de la app (tiers, CRUD, render)
├── supabaseClient.js   # Tus claves de Supabase (edítalo)
└── supabase-setup.sql  # SQL para crear la tabla y la seguridad
```

## Cambiar las reglas de puntuación

Todo el sistema de puntuación vive al principio de `app.js`:

```js
const CATEGORIES = [ ... ];  // las 6 categorías y sus descripciones
const TIERS = [ ... ];       // rangos de puntos y mínimos por tier
```

Para añadir/quitar mínimos o cambiar los cortes de puntos, edita solo
ese bloque — el resto de la app se adapta automáticamente.
