-- =============================================================================
-- FRIJOL MÁGICO - SEED DATA
-- =============================================================================
-- System-required data (catalogs that FK's depend on)
-- This data is required for the application to function properly.
-- =============================================================================

-- =============================================================================
-- DISCIPLINAS
-- =============================================================================

INSERT OR IGNORE INTO disciplina (slug) VALUES ('ilustracion');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('narrativa-grafica');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('manualidades');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('fotografia');

-- =============================================================================
-- ARTISTA ESTADOS
-- =============================================================================

INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (1, 'desconocido');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (2, 'activo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (3, 'inactivo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (4, 'vetado');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (5, 'cancelado');

-- =============================================================================
-- MODOS DE INGRESO
-- =============================================================================

INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'seleccion', 'Artista seleccionado mediante convocatoria abierta'
);
INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'invitacion', 'Artista invitado directamente por la organización'
);
INSERT OR IGNORE INTO modo_ingreso (id, slug, descripcion) VALUES (
    3, 'suplencia', 'Artista agregado desde la lista de suplentes'
);

-- =============================================================================
-- TIPOS DE ACTIVIDAD
-- =============================================================================

INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'taller', 'Actividad práctica con participación de asistentes'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'charla', 'Presentación o conferencia'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'musica', 'Presentación musical en vivo'
);

-- =============================================================================
-- DEV SEED DATA — Desarrollo con datos controlados
-- =============================================================================
-- Propósito: Generar una local.db con datos mínimos realistas para desarrollo
-- que permita testear el flujo CDN (R2/Cloudflare) sin depender de un dump
-- de producción ni interferir en el bucket de prod.
--
-- Assets paths:
--   - Avatares: rutas RELATIVAS en imagen_url + imagen_version (managed format)
--     → getAvatarUrl(path) resuelve concatenando R2_PUBLIC_URL env var
--     → Formato: artistas/{slug}/avatar-{version}.webp
--   - Posters: poster_url = poster_path como ruta relativa + poster_version
--     → Formato: festivales/{event-slug}/{edition-number}/afiche-{version}.webp
--       (edition-number = numero_edicion en minúscula, ej: 'I' → 'i')
--     ⚠️ El código actual (festivalDetailQuery) lee poster_url como URL absoluta.
--       Para que funcione sin cambios, actualizar la query/mapper para resolver
--       poster_path + poster_version via composeAssetUrl().
--
-- IMPORTANTE:
--   R2_PUBLIC_URL en .env.local debe apuntar al bucket de desarrollo
--   (ej: R2_PUBLIC_URL="https://cdn-dev.frijolmagico.cl").
--   Los assets de prueba (.webp) deben existir en el bucket dev en los paths
--   indicados abajo. Si no existen, las imágenes mostrarán placeholder.
--   Para generar los assets de prueba, ejecutar bun run assets:dev:upload.
-- =============================================================================

-- =============================================================================
-- ORGANIZACION
-- =============================================================================

INSERT INTO organizacion (id, nombre, descripcion, mision, vision, created_at, updated_at)
VALUES (
    1,
    'Asociación Cultural Frijol Mágico',
    'La Asociación Cultural Frijol Mágico es una corporación cultural sin fines de lucro, que desde el 2015, se enfoca su quehacer en el desarrollo de la ilustración, la Narrativa Gráfica, el Diseño y la Animación como disciplinas artísticas y potenciales creativos en la Región de Coquimbo, generando instancias de difusión, programación de actividades culturales, articulación entre artistas e instituciones privadas o públicas, con el fin de ser una plataforma de representación que profesionalice la labor de ilustradores e ilustradoras del territorio.',
    'Nuestra misión es fomentar y promover las expresiones artístico - culturales relacionadas con el quehacer de disciplinas como la Ilustración, la Narrativa Gráfica, el Diseño y la Animación que se desarrollan en la Región de Coquimbo, a través de la realización de actividades que fomenten las economías creativas relacionadas con estas disciplinas, instancias de difusión, formación y la construcción de un ecosistema creativo de participación, vinculación y respeto, con el fin de enriquecer la comunidad del territorio y estimular el diálogo cultural.',
    'Nuestra visión es ser un motor y un referente a nivel local, nacional e internacional que impulse y fortalezca a los artistas que forman parte de nuestro quehacer, generando nuevas oportunidades dentro de las economías creativas. Buscamos que su trabajo en las artes gráficas sea sustentable y sostenible, ampliando sus posibilidades laborales y proyectando su obra hacia otros territorios del país y mercados internacionales.',
    '2026-01-20 03:38:49',
    '2026-01-20 03:38:49'
);

-- =============================================================================
-- LUGARES
-- =============================================================================

INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (1, 'Monasterio Casa Taller', 'Peatonal Santo Domingo #228, La Serena', 'La Serena', '{"lat":-29.904389,"lng":-71.253670}', NULL, '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (2, 'Centro Cultural Santa Inés', 'Almagro #232, La Serena', 'La Serena', '{"lat":-29.898163,"lng":-71.252212}', NULL, '2026-01-20 03:38:59', '2026-01-20 03:38:59');

-- =============================================================================
-- ARTISTAS (15 en total para testear paginación)
-- =============================================================================
-- Los artistas 1 y 2 tienen datos completos (rrss, teléfono, historial).
-- Los artistas 3–15 tienen datos mínimos (sirven para poblar el catálogo).
-- Todos tienen avatar en formato managed (imagen_url + imagen_version).

-- Artista 1 — Ánima Rojas (activa, con RRSS array)
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (1, 2, 'Paula Rojas Videla', 'Ánima Rojas', 'anima-red', '19468545-9', 'animared.ilustracion@gmail.com', '{"instagram":["http://www.instagram.com/anima.rojas"]}', 'Coquimbo', 'Chile', '+56987649593', '2026-01-20 03:39:05', '2026-07-24 22:06:19', NULL);

-- Artista 2 — Shobian (activa, con RRSS string)
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (2, 2, 'Vanesa Estefanie Vargas Leyton', 'Shobian', 'shobian', '19349532-K', 'shobian.art@gmail.com', '{"instagram":"https://www.instagram.com/shobian.art/"}', 'Coquimbo', 'Chile', '+56997053061', '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 3 — Ace Kuros
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (3, 2, 'Katherine Acevedo', 'Ace Kuros', 'acekuros', '19500123-4', 'acekuros.art@email.com', '{"instagram":"https://www.instagram.com/acekuros/"}', 'La Serena', 'Chile', '+56911111111', '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 4 — Aderezo
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (4, 2, 'María José Adaro', 'Aderezo', 'aderezo', '19500124-5', 'aderezo@email.com', '{"instagram":"https://www.instagram.com/aderezo/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 5 — Alkimia
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (5, 2, 'Alonso Quintero', 'Alkimia', 'alkimia', '19500125-6', 'alkimia@email.com', '{"instagram":"https://www.instagram.com/alkimia/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 6 — Arcanista Draws
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (6, 2, 'Francisca Arce', 'Arcanista Draws', 'arcanista-draws', '19500126-7', 'arcanista@email.com', '{"instagram":"https://www.instagram.com/arcanista.draws/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 7 — Astro Glitter
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (7, 2, 'Camila Retamal', 'Astro Glitter', 'astro-glitter', '19500127-8', 'astro.glitter@email.com', '{"instagram":"https://www.instagram.com/astro.glitter/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 8 — Bekzar
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (8, 2, 'Bárbara Zarkovic', 'Bekzar', 'bekzar', '19500128-9', 'bekzar@email.com', '{"instagram":"https://www.instagram.com/bekzar/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 9 — Blanquis
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (9, 2, 'Blanca Quiroz', 'Blanquis', 'blanquis', '19500129-0', 'blanquis@email.com', '{"instagram":"https://www.instagram.com/blanquis/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 10 — Bolbarán Comics
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (10, 2, 'Diego Bolbarán', 'Bolbarán Comics', 'bolbaran-comics', '19500130-1', 'bolbaran@email.com', '{"instagram":"https://www.instagram.com/bolbaran.comics/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 11 — Camellia Liz
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (11, 2, 'Camila Lizama', 'Camellia Liz', 'camellia-liz', '19500131-2', 'camellia.liz@email.com', '{"instagram":"https://www.instagram.com/camellia.liz/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 12 — Camila Guamán
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (12, 2, 'Camila Guamán', 'Camila Guamán', 'camila-guaman', '19500132-3', 'camila.guaman@email.com', '{"instagram":"https://www.instagram.com/camila.guaman/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 13 — Canela
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (13, 2, 'Magdalena Nieto', 'Canela', 'canela', '19500133-4', 'canela.art@email.com', '{"instagram":"https://www.instagram.com/canela.art/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 14 — Carvajal Ilustraciones
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (14, 2, 'Carlos Carvajal', 'Carvajal Ilustraciones', 'carvajal-ilustraciones', '19500134-5', 'carvajal.ilustraciones@email.com', '{"instagram":"https://www.instagram.com/carvajal.ilustraciones/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- Artista 15 — Cat Linaa Art
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (15, 2, 'Catalina Linaa', 'Cat Linaa Art', 'cat-linaa-art', '19500135-6', 'cat.linaa@email.com', '{"instagram":"https://www.instagram.com/cat.linaa.art/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- =============================================================================
-- ARTISTA IMAGEN (Avatares — managed format con version timestamp)
-- =============================================================================
-- Los paths son relativos → getAvatarUrl() los resuelve con R2_PUBLIC_URL.
-- Los archivos .webp deben existir en el bucket dev en estos paths.
-- Version fija: 123456789.

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (1, 1, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (2, 2, 'artistas/shobian/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (3, 3, 'artistas/acekuros/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (4, 4, 'artistas/aderezo/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (5, 5, 'artistas/alkimia/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":89436,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (6, 6, 'artistas/arcanista-draws/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":107548,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (7, 7, 'artistas/astro-glitter/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":70512,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (8, 8, 'artistas/bekzar/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":37958,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (9, 9, 'artistas/blanquis/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":137494,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (10, 10, 'artistas/bolbaran-comics/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":110228,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (11, 11, 'artistas/camellia-liz/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":52510,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (12, 12, 'artistas/camila-guaman/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":71800,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (13, 13, 'artistas/canela/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":116490,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (14, 14, 'artistas/carvajal-ilustraciones/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":48586,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (15, 15, 'artistas/cat-linaa-art/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":54396,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

-- =============================================================================
-- ARTISTA HISTORIAL
-- =============================================================================
-- CHECK constraint exige al menos un campo no nulo por fila.
-- Artistas 1-2 con datos históricos reales; 3-15 con entrada mínima.

-- Artista 1: cambio de correo y pseudónimo
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (1, 1, NULL, 'paularojasvidela@gmail.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original desde CSV');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (2, 1, 'Anima Red (@soy.red)', NULL, NULL, NULL, NULL, 2, '2026-03-05 23:33:20', 'Pseudónimo desde CSV IX');

-- Artista 2: cambio de ciudad
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (3, 2, NULL, NULL, NULL, 'La Serena', 'Chile', 1, '2026-01-20 03:39:14', 'Ciudad original desde CSV');

-- Artistas 3–15: entrada mínima (solo correo original)
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (4, 3, NULL, 'acekuros.art@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (5, 4, NULL, 'aderezo@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (6, 5, NULL, 'alkimia@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (7, 6, NULL, 'arcanista@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (8, 7, NULL, 'astro.glitter@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (9, 8, NULL, 'bekzar@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (10, 9, NULL, 'blanquis@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (11, 10, NULL, 'bolbaran@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (12, 11, NULL, 'camellia.liz@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (13, 12, NULL, 'camila.guaman@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (14, 13, NULL, 'canela.art@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (15, 14, NULL, 'carvajal.ilustraciones@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (16, 15, NULL, 'cat.linaa@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');

-- =============================================================================
-- CATALOGO ARTISTA
-- =============================================================================

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (1, 1, 'a1', 0, 1, 'Lic. en arquitectura, ilustradora y artista visual chilena. Desarrolla trabajos con temáticas relacionadas a la fantasía y la naturaleza, enfocándose en ilustrar y diseñar en torno a la creación de personajes originales y criaturas imaginarias. Sus medios principales son la acuarela, el grafito y los lápices de colores.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (2, 2, 'a2', 0, 1, 'Shobian, diseñadora gráfica de profesión e ilustradora autodidacta, se caracteriza por utilizar texturas análogas en la ilustración digital, aportando calidez a sus obras que retratan naturaleza y elementos de la vida cotidiana.', '2026-01-20 03:39:11', '2026-06-22 06:20:08', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (3, 3, 'a3', 0, 1, 'Ilustrador enfocado en narrativa visual y personajes fantásticos. Trabaja con técnicas mixtas combinando digital y tradicional.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (4, 4, 'a4', 0, 1, 'Artista visual que explora la relación entre texturas análogas y el color en la ilustración digital.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (5, 5, 'a5', 0, 1, 'Ilustrador y diseñador especializado en técnicas de acuarela y tinta. Su obra explora la mitología local y la naturaleza.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (6, 6, 'a6', 0, 1, 'Dibujante y creadora de contenido visual con un estilo fresco y colorido, inspirado en la cultura pop y la fantasía.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (7, 7, 'a7', 0, 1, 'Ilustradora que combina técnicas digitales con texturas naturales para crear mundos oníricos y personajes únicos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (8, 8, 'a8', 0, 1, 'Artista gráfica especializada en ilustración editorial y narrativa visual con un enfoque en la identidad regional.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (9, 9, 'a9', 0, 1, 'Ilustradora autodidacta con un estilo versátil que abarca desde el retrato hasta la ilustración conceptual.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (10, 10, 'a10', 0, 1, 'Creador de cómics e ilustraciones que exploran el humor gráfico y la narrativa secuencial con identidad local.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (11, 11, 'a11', 0, 1, 'Ilustradora floral y botánica con un enfoque delicado y detallista, inspirado en la flora de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (12, 12, 'a12', 0, 1, 'Artista visual que trabaja la ilustración como herramienta de exploración de la identidad y el territorio.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (13, 13, 'a13', 0, 1, 'Ilustradora multidisciplinaria que fusiona técnicas análogas y digitales para crear narrativas visuales emotivas.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (14, 14, 'a14', 0, 1, 'Dibujante e ilustrador con experiencia en diseño de personajes y narrativa gráfica para público infantil y juvenil.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (15, 15, 'a15', 0, 1, 'Ilustradora y diseñadora que explora la relación entre la ilustración digital y las técnicas de estampación tradicional.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

-- =============================================================================
-- EVENTO
-- =============================================================================

INSERT INTO evento (id, organizacion_id, nombre, slug, descripcion, created_at, updated_at)
VALUES (1, 1, 'Festival Frijol Mágico', 'frijol-magico', 'Frijol Mágico es un espacio que reúne a las y los Ilustradores de la Región de Coquimbo, generando distintas instancias que ayuden a potenciar su trabajo.', '2026-01-20 03:38:52', '2026-01-20 03:38:52');

-- =============================================================================
-- EVENTO EDICIONES
-- =============================================================================
-- poster_path formato: festivales/{event-slug}/{edition-number}/afiche-{version}.webp
-- (edition-number = numero_edicion en minúscula, ej: 'I' → 'i')
-- poster_url = poster_path (relativo) — ⚠️ el código actual lee poster_url como
-- URL absoluta. Migrar la query/mapper para resolver con composeAssetUrl().

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (1, 1, NULL, 'I', 'frijol-magico-i', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (2, 1, 'Día del Libro', 'II', 'frijol-magico-ii', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

-- =============================================================================
-- EVENTO EDICION DIAS
-- =============================================================================

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (1, 1, 1, '2017-02-25', '14:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (2, 2, 2, '2017-04-22', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

-- =============================================================================
-- AGRUPACION
-- =============================================================================

INSERT INTO agrupacion (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (1, 'Dúo Dreamscape', 'Colectivo de ilustración formado por Ánima Rojas y Shobian, colaborando en proyectos de narrativa visual y arte conceptual.', NULL, 1, '2026-01-20 03:39:17', '2026-01-20 03:39:17');

-- =============================================================================
-- AGRUPACION ARTISTA
-- =============================================================================

INSERT INTO agrupacion_artista (agrupacion_id, artista_id, rol, activo, created_at)
VALUES (1, 1, 'Ilustradora principal', 1, '2026-03-21 18:44:27');

INSERT INTO agrupacion_artista (agrupacion_id, artista_id, rol, activo, created_at)
VALUES (1, 2, 'Diseñadora gráfica', 1, '2026-03-21 18:44:55');

-- =============================================================================
-- PARTICIPACION EDICION
-- =============================================================================
-- CHECK exige exactamente un participante por fila (artista, agrupación o banda).

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (2, 1, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (3, 2, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

-- =============================================================================
-- PARTICIPACION EXPOSICION
-- =============================================================================
-- Edición I: artista 1 → ilustración, artista 2 → narrativa-gráfica

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (2, 2, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

-- =============================================================================
-- PARTICIPACION ACTIVIDAD
-- =============================================================================

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

-- =============================================================================
-- ACTIVIDAD
-- =============================================================================

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (1, 1, 'Encuadernación plegada, libros origami', 'Es un modo sencillo, llamativo y novedoso de publicar, hacer libros objeto con propuestas tanto visuales como literarias.', 60, '18:00', NULL, 12, '2026-07-04 04:18:40', '2026-07-04 04:18:40');

-- =============================================================================
-- AGRUPACION: PARTICIPACION + ACTIVIDADES
-- =============================================================================

-- Dúo Dreamscape participa en Edición II (ilustración)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (4, 2, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (3, 4, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

-- =============================================================================
-- EDICIÓN I: COMPLETAR CATEGORÍAS + ACTIVIDADES
-- =============================================================================
-- Faltaba: manualidades. Se la asigna a Artista 3 (Ace Kuros).
-- Faltaba: charla. Se la asigna a Artista 2 (Shobian).

-- Artista 3 (Ace Kuros) en Edición I → manualidades
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (5, 1, 3, NULL, NULL, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (4, 5, 3, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

-- Artista 2 (Shobian) da charla en Edición I
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (2, 2, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (2, 2, 'Proceso creativo: del boceto al arte final', 'Recorrido por el proceso de ilustración digital de Shobian, desde la idea inicial hasta la obra terminada, incluyendo técnicas de texturizado análogo.', 45, '16:00', NULL, 20, '2026-07-04 04:18:41', '2026-07-04 04:18:41');

-- =============================================================================
-- EDICIÓN II: COMPLETAR CATEGORÍAS + ACTIVIDADES
-- =============================================================================
-- Faltaba: artista 1 sin exposicion, manualidades, taller, charla.
-- Se asigna: artista 1 → narrativa-gráfica + taller, artista 2 → manualidades + charla.

-- Artista 1 (Ánima Rojas) en Edición II → narrativa-gráfica + taller
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (5, 3, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (3, 3, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (3, 3, 'Acuarela experimental: texturas y narrativa', 'Taller práctico de acuarela donde los asistentes explorarán técnicas de creación de texturas y su aplicación en la narrativa visual.', 90, '15:00', NULL, 15, '2026-07-04 04:18:42', '2026-07-04 04:18:42');

-- Artista 2 (Shobian) en Edición II → manualidades + charla
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (6, 2, 2, NULL, NULL, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (6, 6, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (4, 6, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (4, 4, 'Diseño de personajes con identidad local', 'Charla sobre cómo construir personajes que reflejen la identidad y el territorio de la Región de Coquimbo, usando referentes locales y técnicas de diseño gráfico.', 50, '17:30', NULL, 30, '2026-07-04 04:18:43', '2026-07-04 04:18:43');

-- =============================================================================
-- BANDAS (5 ficticias)
-- =============================================================================

INSERT INTO banda (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (1, 'Los Colores del Viento', 'Fusión latinoamericana que mezcla ritmos folclóricos con sonidos contemporáneos. Su música explora la relación entre el color y el sonido en el paisaje norteño.', 'colores.viento@email.com', 1, '2026-07-04 04:18:44', '2026-07-04 04:18:44');

INSERT INTO banda (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (2, 'Río Interior', 'Rock alternativo con letras que abordan la introspección y el viaje interior. Su sonido combina guitarras eléctricas con texturas electrónicas sutiles.', 'rio.interior@email.com', 1, '2026-07-04 04:18:45', '2026-07-04 04:18:45');

INSERT INTO banda (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (3, 'Sonic Horizon', 'Electrónica experimental que fusiona sintetizadores analógicos con sampling de campo. Paisajes sonoros que evocan el horizonte del Valle de Elqui.', 'sonic.horizon@email.com', 1, '2026-07-04 04:18:46', '2026-07-04 04:18:46');

INSERT INTO banda (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (4, 'La Ronda de los Pájaros', 'Folk contemporáneo con influencias de la música tradicional chilena. Canciones que narran historias del territorio y sus habitantes.', 'ronda.pajaros@email.com', 1, '2026-07-04 04:18:47', '2026-07-04 04:18:47');

INSERT INTO banda (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (5, 'Marea de Papel', 'Indie pop con atmósferas acústicas y letras que exploran la creatividad, el proceso artístico y la vida en la costa. Su nombre evoca la fragilidad y fuerza del papel frente al mar.', 'marea.papel@email.com', 1, '2026-07-04 04:18:48', '2026-07-04 04:18:48');

-- =============================================================================
-- BANDAS: PARTICIPACIONES
-- =============================================================================
-- Edición I: Los Colores del Viento + Río Interior
-- Edición II: Sonic Horizon + La Ronda de los Pájaros + Marea de Papel

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (7, 1, NULL, NULL, 1, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (8, 1, NULL, NULL, 2, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (9, 2, NULL, NULL, 3, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (10, 2, NULL, NULL, 4, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (11, 2, NULL, NULL, 5, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

-- =============================================================================
-- ARTISTAS FUERA DE CATÁLOGO (sin imagen, sin catálogo, con participaciones)
-- =============================================================================
-- Estos 5 artistas tienen participaciones en ambas ediciones pero NO están en
-- el catálogo (catalogo_artista) NI tienen imágenes (artista_imagen).
-- Sirven para testear flujos donde un artista participó pero no está en cartelera.
-- =============================================================================

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (16, 2, 'Carlos Muñoz Toro', 'Fuego Lento', 'fuego-lento', '19500136-7', 'fuego.lento@email.com', '{"instagram":"https://www.instagram.com/fuego.lento/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (17, 2, 'Daniela Rojas Silva', 'Tinta Negra', 'tinta-negra', '19500137-8', 'tinta.negra@email.com', '{"instagram":"https://www.instagram.com/tinta.negra/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (18, 2, 'Valentina Vega Astorga', 'Luna Cósmica', 'luna-cosmica', '19500138-9', 'luna.cosmica@email.com', '{"instagram":"https://www.instagram.com/luna.cosmica/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (19, 2, 'Felipe Araya Cortés', 'Rizoma Estudio', 'rizoma-estudio', '19500139-0', 'rizoma.estudio@email.com', '{"instagram":"https://www.instagram.com/rizoma.estudio/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (20, 2, 'Javiera Pizarro Navarro', 'Viento del Valle', 'viento-del-valle', '19500140-1', 'viento.del.valle@email.com', '{"instagram":"https://www.instagram.com/viento.del.valle/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- =============================================================================
-- ARTISTAS FUERA DE CATÁLOGO: HISTORIAL (entrada mínima)
-- =============================================================================

INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (17, 16, NULL, 'fuego.lento@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (18, 17, NULL, 'tinta.negra@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (19, 18, NULL, 'luna.cosmica@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (20, 19, NULL, 'rizoma.estudio@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (21, 20, NULL, 'viento.del.valle@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');

-- =============================================================================
-- ARTISTAS FUERA DE CATÁLOGO: PARTICIPACIONES
-- =============================================================================
-- Cada artista participa en AMBAS ediciones.
-- Se distribuyen entre las 4 disciplinas y 3 modos de ingreso.

-- Artista 16 — Fuego Lento: Ed I → fotografía (invitación + taller), Ed II → fotografía (selección)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (12, 1, 16, NULL, NULL, 'Fuera de catálogo — fotografía', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (7, 12, 4, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (5, 12, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (5, 5, 'Fotografía experimental con luz natural', 'Taller de técnicas fotográficas usando solo luz natural, explorando sombras, texturas y composición en exteriores.', 90, '15:30', NULL, 12, '2026-07-04 04:18:44', '2026-07-04 04:18:44');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (13, 2, 16, NULL, NULL, 'Fuera de catálogo — fotografía', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (8, 13, 4, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

-- Artista 17 — Tinta Negra: Ed I → ilustración (selección), Ed II → narrativa-gráfica (selección + charla)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (14, 1, 17, NULL, NULL, 'Fuera de catálogo — ilustración', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (9, 14, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (15, 2, 17, NULL, NULL, 'Fuera de catálogo — narrativa gráfica', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (10, 15, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (6, 15, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (6, 6, 'Ilustración y narrativa: construyendo mundos gráficos', 'Charla sobre el proceso de creación de mundos visuales a través de la ilustración secuencial, desde el storyboard hasta la pieza final.', 45, '16:30', NULL, 25, '2026-07-04 04:18:45', '2026-07-04 04:18:45');

-- Artista 18 — Luna Cósmica: Ed I → manualidades (suplencia), Ed II → ilustración (invitación)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (16, 1, 18, NULL, NULL, 'Fuera de catálogo — manualidades', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (11, 16, 3, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (17, 2, 18, NULL, NULL, 'Fuera de catálogo — ilustración', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (12, 17, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

-- Artista 19 — Rizoma Estudio: Ed I → narrativa-gráfica (selección + taller), Ed II → narrativa-gráfica (selección + charla)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (18, 1, 19, NULL, NULL, 'Fuera de catálogo — narrativa gráfica', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (13, 18, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (7, 18, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (7, 7, 'Taller de fanzine experimental', 'Taller práctico donde cada participante crea su propio fanzine usando técnicas mixtas de collage, dibujo y narrativa visual.', 120, '14:00', NULL, 15, '2026-07-04 04:18:46', '2026-07-04 04:18:46');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (19, 2, 19, NULL, NULL, 'Fuera de catálogo — narrativa gráfica', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (14, 19, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (8, 19, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (8, 8, 'Storytelling visual para redes sociales', 'Charla sobre cómo construir narrativas visuales efectivas para plataformas digitales, con ejemplos de proyectos locales y estrategias de contenido.', 50, '18:00', NULL, 30, '2026-07-04 04:18:47', '2026-07-04 04:18:47');

-- Artista 20 — Viento del Valle: Ed I → fotografía (selección), Ed II → manualidades (invitación + taller)
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (20, 1, 20, NULL, NULL, 'Fuera de catálogo — fotografía', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (15, 20, 4, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (21, 2, 20, NULL, NULL, 'Fuera de catálogo — manualidades', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (16, 21, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (9, 21, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (9, 9, 'Taller de papelería artesanal', 'Taller donde los asistentes aprenderán técnicas básicas de encuadernación, plegado de papel y creación de libretas artesanales con materiales reciclados.', 90, '14:30', NULL, 15, '2026-07-04 04:18:48', '2026-07-04 04:18:48');

-- =============================================================================
-- FIN DEL SEED
-- =============================================================================
