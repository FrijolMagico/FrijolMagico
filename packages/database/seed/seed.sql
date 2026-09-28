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

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (3, 1, 1, '2017-02-26', '12:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (4, 2, 2, '2017-04-23', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

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

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (1, 'Los Colores del Viento', 'Fusión latinoamericana que mezcla ritmos folclóricos con sonidos contemporáneos. Su música explora la relación entre el color y el sonido en el paisaje norteño.', 'colores.viento@email.com', 1, '2026-07-04 04:18:44', '2026-07-04 04:18:44');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (2, 'Río Interior', 'Rock alternativo con letras que abordan la introspección y el viaje interior. Su sonido combina guitarras eléctricas con texturas electrónicas sutiles.', 'rio.interior@email.com', 1, '2026-07-04 04:18:45', '2026-07-04 04:18:45');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (3, 'Sonic Horizon', 'Electrónica experimental que fusiona sintetizadores analógicos con sampling de campo. Paisajes sonoros que evocan el horizonte del Valle de Elqui.', 'sonic.horizon@email.com', 1, '2026-07-04 04:18:46', '2026-07-04 04:18:46');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (4, 'La Ronda de los Pájaros', 'Folk contemporáneo con influencias de la música tradicional chilena. Canciones que narran historias del territorio y sus habitantes.', 'ronda.pajaros@email.com', 1, '2026-07-04 04:18:47', '2026-07-04 04:18:47');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
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
-- INSCRIPCIONES Y OCURRENCIAS DE ACTIVIDADES (DEV)
-- =============================================================================
-- Los talleres y charlas tienen sesiones explícitas dentro de los días de su edición.
-- El taller de acuarela mantiene inscripciones activas para facilitar pruebas en UI.

INSERT INTO activity_registration (id, participation_activity_id, url, start_at, end_at)
VALUES (1, 3, 'https://example.org/inscripcion-taller-acuarela', '2020-01-01T00:00:00.000Z', '2099-12-31T23:59:59.000Z');

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (1, 1, '2017-02-25', '18:00', 60);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (2, 2, '2017-02-25', '16:00', 45);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (3, 2, '2017-02-26', '16:30', 45);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (4, 3, '2017-04-22', '15:00', 90);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (5, 3, '2017-04-23', '16:30', 90);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (6, 4, '2017-04-22', '17:30', 50);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (7, 4, '2017-04-23', '14:00', 50);

-- =============================================================================
-- SEED EXTENDIDO — Más festivales, artistas y una edición espejo de la
-- última edición de producción (XVI: 79 participaciones, 60 exposiciones,
-- 33 actividades, 2 días).
--
-- Assets: se REUTILIZAN los posters y avatares ya existentes en el CDN dev.
--   - Posters: festivales/frijol-magico/{i|ii}/afiche-123456789.webp
--   - Avatares: artistas/{slug}/avatar-123456789.webp (rotando los 15 existentes)
--
-- La edición VII (Recolectando Semillas) queda como la edición ACTIVA:
--   published = 1 y fechas futuras (2026-10-09/10) para que getActiveFestival()
--   la seleccione.
-- =============================================================================

-- =============================================================================
-- LUGARES (nuevos — reutilizan coordenadas reales de la DB remota)
-- =============================================================================
INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (3, 'Bender''s Games', 'Lautaro #856, La Serena', 'La Serena', '{"lat":-29.90528,"lng":-71.24533}', NULL, '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (4, 'Mall VIVO Coquimbo', 'Avenida Varela #1524, Coquimbo', 'Coquimbo', '{"lat":-29.95786,"lng":-71.33737}', 'https://www.mallsyoutletsvivo.cl/vivo-coquimbo/', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

-- =============================================================================
-- ARTISTAS NUEVOS (21–80) — "varios nuevos artistas" para poblar el catálogo
-- y sostener una edición con la misma cantidad de datos que producción.
-- =============================================================================
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (21, 2, 'Ana Aguirre Díaz', 'Trazo Austral', 'trazo-austral', '21100000-0', 'trazo.austral@email.com', '{"instagram":"https://www.instagram.com/trazo-austral/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (22, 2, 'Benjamín Bravo Klein', 'Bosque Nublado', 'bosque-nublado', '21100001-1', 'bosque.nublado@email.com', '{"instagram":"https://www.instagram.com/bosque-nublado/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (23, 2, 'Camila Cáceres Rojas', 'Mar de Lápices', 'mar-de-lapices', '21100002-2', 'mar.de.lapices@email.com', '{"instagram":"https://www.instagram.com/mar-de-lapices/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (24, 2, 'Daniela Díaz Zúñiga', 'Bruja Dibujante', 'bruja-dibujante', '21100003-3', 'bruja.dibujante@email.com', '{"instagram":"https://www.instagram.com/bruja-dibujante/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (25, 2, 'Elena Escobar Henríquez', 'Cóndor Creativo', 'condor-creativo', '21100004-4', 'condor.creativo@email.com', '{"instagram":"https://www.instagram.com/condor-creativo/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (26, 2, 'Felipe Fuentes Pizarro', 'Arena y Tinta', 'arena-y-tinta', '21100005-5', 'arena.y.tinta@email.com', '{"instagram":"https://www.instagram.com/arena-y-tinta/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (27, 2, 'Gabriela González Acuña', 'Nube de Papel', 'nube-de-papel', '21100006-6', 'nube.de.papel@email.com', '{"instagram":"https://www.instagram.com/nube-de-papel/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (28, 2, 'Héctor Herrera Cáceres', 'Relámpago Rosa', 'relampago-rosa', '21100007-7', 'relampago.rosa@email.com', '{"instagram":"https://www.instagram.com/relampago-rosa/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (29, 2, 'Isidora Ibáñez Jara', 'Zapallo Ilustrado', 'zapallo-ilustrado', '21100008-8', 'zapallo.ilustrado@email.com', '{"instagram":"https://www.instagram.com/zapallo-ilustrado/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (30, 2, 'Javiera Jara Quiroga', 'Chispa Creativa', 'chispa-creativa', '21100009-9', 'chispa.creativa@email.com', '{"instagram":"https://www.instagram.com/chispa-creativa/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (31, 2, 'Kevin Klein Yáñez', 'Rosa de los Vientos', 'rosa-de-los-vientos', '21100010-0', 'rosa.de.los.vientos@email.com', '{"instagram":"https://www.instagram.com/rosa-de-los-vientos/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (32, 2, 'Lorena Lagos Guzmán', 'Cactus Sonriente', 'cactus-sonriente', '21100011-1', 'cactus.sonriente@email.com', '{"instagram":"https://www.instagram.com/cactus-sonriente/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (33, 2, 'Matías Muñoz Ortiz', 'Luna de Agua', 'luna-de-agua', '21100012-2', 'luna.de.agua@email.com', '{"instagram":"https://www.instagram.com/luna-de-agua/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (34, 2, 'Natalia Núñez Zamora', 'Duende del Valle', 'duende-del-valle', '21100013-3', 'duende.del.valle@email.com', '{"instagram":"https://www.instagram.com/duende-del-valle/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (35, 2, 'Óscar Olivares Bravo', 'Gaviota Errante', 'gaviota-errante', '21100014-4', 'gaviota.errante@email.com', '{"instagram":"https://www.instagram.com/gaviota-errante/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (36, 2, 'Paula Pérez Ibáñez', 'Humedal Ilustrado', 'humedal-ilustrado', '21100015-5', 'humedal.ilustrado@email.com', '{"instagram":"https://www.instagram.com/humedal-ilustrado/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (37, 2, 'Quimey Quiroga Pérez', 'Iris Nocturna', 'iris-nocturna', '21100016-6', 'iris.nocturna@email.com', '{"instagram":"https://www.instagram.com/iris-nocturna/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (38, 2, 'Rodrigo Rojas Weber', 'Jaguar de Papel', 'jaguar-de-papel', '21100017-7', 'jaguar.de.papel@email.com', '{"instagram":"https://www.instagram.com/jaguar-de-papel/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (39, 2, 'Sofía Silva Flores', 'Koi Andino', 'koi-andino', '21100018-8', 'koi.andino@email.com', '{"instagram":"https://www.instagram.com/koi-andino/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (40, 2, 'Tomás Tapia Navarro', 'Lago Sereno', 'lago-sereno', '21100019-9', 'lago.sereno@email.com', '{"instagram":"https://www.instagram.com/lago-sereno/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (41, 2, 'Úrsula Urrutia Vega', 'Marea Alta', 'marea-alta', '21100020-0', 'marea.alta@email.com', '{"instagram":"https://www.instagram.com/marea-alta/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (42, 2, 'Valentina Varas Aguirre', 'Oasis de Tinta', 'oasis-de-tinta', '21100021-1', 'oasis.de.tinta@email.com', '{"instagram":"https://www.instagram.com/oasis-de-tinta/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (43, 2, 'Washington Weber Herrera', 'Puma Salvaje', 'puma-salvaje', '21100022-2', 'puma.salvaje@email.com', '{"instagram":"https://www.instagram.com/puma-salvaje/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (44, 2, 'Ximena Yáñez Olivares', 'Quila Cósmica', 'quila-cosmica', '21100023-3', 'quila.cosmica@email.com', '{"instagram":"https://www.instagram.com/quila-cosmica/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (45, 2, 'Yasna Zúñiga Varas', 'Roca Dorada', 'roca-dorada', '21100024-4', 'roca.dorada@email.com', '{"instagram":"https://www.instagram.com/roca-dorada/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (46, 2, 'Zacarías Araya Espinoza', 'Sol de Coquimbo', 'sol-de-coquimbo', '21100025-5', 'sol.de.coquimbo@email.com', '{"instagram":"https://www.instagram.com/sol-de-coquimbo/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (47, 2, 'Antonia Contreras Molina', 'Tierra Adentro', 'tierra-adentro', '21100026-6', 'tierra.adentro@email.com', '{"instagram":"https://www.instagram.com/tierra-adentro/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (48, 2, 'Bruno Donoso Valdés', 'Uva Salvaje', 'uva-salvaje', '21100027-7', 'uva.salvaje@email.com', '{"instagram":"https://www.instagram.com/uva-salvaje/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (49, 2, 'Constanza Espinoza Figueroa', 'Volcán Dormido', 'volcan-dormido', '21100028-8', 'volcan.dormido@email.com', '{"instagram":"https://www.instagram.com/volcan-dormido/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (50, 2, 'Diego Flores González', 'Zorro Gris', 'zorro-gris', '21100029-9', 'zorro.gris@email.com', '{"instagram":"https://www.instagram.com/zorro-gris/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (51, 2, 'Emilia Guzmán Núñez', 'Alba Fugaz', 'alba-fugaz', '21100030-0', 'alba.fugaz@email.com', '{"instagram":"https://www.instagram.com/alba-fugaz/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (52, 2, 'Facundo Henríquez Urrutia', 'Bruma Costera', 'bruma-costera', '21100031-1', 'bruma.costera@email.com', '{"instagram":"https://www.instagram.com/bruma-costera/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (53, 2, 'Gloria Ibarra Donoso', 'Cobre Viejo', 'cobre-viejo', '21100032-2', 'cobre.viejo@email.com', '{"instagram":"https://www.instagram.com/cobre-viejo/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (54, 2, 'Hugo Jofré Leiva', 'Desierto Florido', 'desierto-florido', '21100033-3', 'desierto.florido@email.com', '{"instagram":"https://www.instagram.com/desierto-florido/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (55, 2, 'Ignacia Leiva Toledo', 'Eco del Valle', 'eco-del-valle', '21100034-4', 'eco.del.valle@email.com', '{"instagram":"https://www.instagram.com/eco-del-valle/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (56, 2, 'Joaquín Molina Delgado', 'Faro Silente', 'faro-silente', '21100035-5', 'faro.silente@email.com', '{"instagram":"https://www.instagram.com/faro-silente/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (57, 2, 'Karina Navarro Fuentes', 'Grano de Arena', 'grano-de-arena', '21100036-6', 'grano.de.arena@email.com', '{"instagram":"https://www.instagram.com/grano-de-arena/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (58, 2, 'Lucas Ortiz Muñoz', 'Hilo de Luz', 'hilo-de-luz', '21100037-7', 'hilo.de.luz@email.com', '{"instagram":"https://www.instagram.com/hilo-de-luz/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (59, 2, 'María Pizarro Tapia', 'Isla de Papel', 'isla-de-papel', '21100038-8', 'isla.de.papel@email.com', '{"instagram":"https://www.instagram.com/isla-de-papel/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (60, 2, 'Nicolás Reyes Contreras', 'Junco Verde', 'junco-verde', '21100039-9', 'junco.verde@email.com', '{"instagram":"https://www.instagram.com/junco-verde/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (61, 2, 'Olivia Sepúlveda Jofré', 'Kuyen de Tinta', 'kuyen-de-tinta', '21100040-0', 'kuyen.de.tinta@email.com', '{"instagram":"https://www.instagram.com/kuyen-de-tinta/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (62, 2, 'Pedro Toledo Sepúlveda', 'Leña Seca', 'lena-seca', '21100041-1', 'lena.seca@email.com', '{"instagram":"https://www.instagram.com/lena-seca/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (63, 2, 'Renata Valdés Cortés', 'Musgo Andino', 'musgo-andino', '21100042-2', 'musgo.andino@email.com', '{"instagram":"https://www.instagram.com/musgo-andino/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (64, 2, 'Sebastián Vega Escobar', 'Nogal Sereno', 'nogal-sereno', '21100043-3', 'nogal.sereno@email.com', '{"instagram":"https://www.instagram.com/nogal-sereno/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (65, 2, 'Trinidad Zamora Lagos', 'Orilla del Mar', 'orilla-del-mar', '21100044-4', 'orilla.del.mar@email.com', '{"instagram":"https://www.instagram.com/orilla-del-mar/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (66, 2, 'Vicente Acuña Silva', 'Piedra Lunar', 'piedra-lunar', '21100045-5', 'piedra.lunar@email.com', '{"instagram":"https://www.instagram.com/piedra-lunar/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (67, 2, 'Wanda Bustos Araya', 'Quinchamalí', 'quinchamali', '21100046-6', 'quinchamali@email.com', '{"instagram":"https://www.instagram.com/quinchamali/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (68, 2, 'Yerko Cortés Ibarra', 'Río Claro', 'rio-claro', '21100047-7', 'rio.claro@email.com', '{"instagram":"https://www.instagram.com/rio-claro/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (69, 2, 'Zoé Delgado Reyes', 'Sendero Norte', 'sendero-norte', '21100048-8', 'sendero.norte@email.com', '{"instagram":"https://www.instagram.com/sendero-norte/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (70, 2, 'Agustín Figueroa Bustos', 'Trigo Maduro', 'trigo-maduro', '21100049-9', 'trigo.maduro@email.com', '{"instagram":"https://www.instagram.com/trigo-maduro/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (71, 2, 'Bárbara Aguirre Díaz', 'Ulmo Florido', 'ulmo-florido', '21100050-0', 'ulmo.florido@email.com', '{"instagram":"https://www.instagram.com/ulmo-florido/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (72, 2, 'Cristóbal Bravo Klein', 'Viento Sur', 'viento-sur', '21100051-1', 'viento.sur@email.com', '{"instagram":"https://www.instagram.com/viento-sur/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (73, 2, 'Dominga Cáceres Rojas', 'Wetripantu', 'wetripantu', '21100052-2', 'wetripantu@email.com', '{"instagram":"https://www.instagram.com/wetripantu/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (74, 2, 'Elías Díaz Zúñiga', 'Yuyo del Cerro', 'yuyo-del-cerro', '21100053-3', 'yuyo.del.cerro@email.com', '{"instagram":"https://www.instagram.com/yuyo-del-cerro/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (75, 2, 'Fernanda Escobar Henríquez', 'Zarza Creativa', 'zarza-creativa', '21100054-4', 'zarza.creativa@email.com', '{"instagram":"https://www.instagram.com/zarza-creativa/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (76, 2, 'Gonzalo Fuentes Pizarro', 'Agua de Vertiente', 'agua-de-vertiente', '21100055-5', 'agua.de.vertiente@email.com', '{"instagram":"https://www.instagram.com/agua-de-vertiente/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (77, 2, 'Helena González Acuña', 'Brisa Salada', 'brisa-salada', '21100056-6', 'brisa.salada@email.com', '{"instagram":"https://www.instagram.com/brisa-salada/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (78, 2, 'Iván Herrera Cáceres', 'Cielo Minero', 'cielo-minero', '21100057-7', 'cielo.minero@email.com', '{"instagram":"https://www.instagram.com/cielo-minero/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (79, 2, 'Josefa Ibáñez Jara', 'Duna Rosada', 'duna-rosada', '21100058-8', 'duna.rosada@email.com', '{"instagram":"https://www.instagram.com/duna-rosada/"}', 'La Serena', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (80, 2, 'Lautaro Jara Quiroga', 'Estrella Fugaz', 'estrella-fugaz', '21100059-9', 'estrella.fugaz@email.com', '{"instagram":"https://www.instagram.com/estrella-fugaz/"}', 'Coquimbo', 'Chile', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

-- =============================================================================
-- ARTISTA IMAGEN (avatares nuevos) — REUTILIZAN los .webp existentes del CDN dev
-- =============================================================================
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (16, 21, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (17, 22, 'artistas/shobian/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (18, 23, 'artistas/acekuros/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (19, 24, 'artistas/aderezo/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (20, 25, 'artistas/alkimia/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (21, 26, 'artistas/arcanista-draws/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (22, 27, 'artistas/astro-glitter/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (23, 28, 'artistas/bekzar/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (24, 29, 'artistas/blanquis/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (25, 30, 'artistas/bolbaran-comics/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (26, 31, 'artistas/camellia-liz/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (27, 32, 'artistas/camila-guaman/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (28, 33, 'artistas/canela/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (29, 34, 'artistas/carvajal-ilustraciones/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (30, 35, 'artistas/cat-linaa-art/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (31, 36, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (32, 37, 'artistas/shobian/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (33, 38, 'artistas/acekuros/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (34, 39, 'artistas/aderezo/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (35, 40, 'artistas/alkimia/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (36, 41, 'artistas/arcanista-draws/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (37, 42, 'artistas/astro-glitter/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (38, 43, 'artistas/bekzar/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (39, 44, 'artistas/blanquis/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (40, 45, 'artistas/bolbaran-comics/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (41, 46, 'artistas/camellia-liz/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (42, 47, 'artistas/camila-guaman/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (43, 48, 'artistas/canela/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (44, 49, 'artistas/carvajal-ilustraciones/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (45, 50, 'artistas/cat-linaa-art/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (46, 51, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (47, 52, 'artistas/shobian/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (48, 53, 'artistas/acekuros/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (49, 54, 'artistas/aderezo/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (50, 55, 'artistas/alkimia/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (51, 56, 'artistas/arcanista-draws/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (52, 57, 'artistas/astro-glitter/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (53, 58, 'artistas/bekzar/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (54, 59, 'artistas/blanquis/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (55, 60, 'artistas/bolbaran-comics/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (56, 61, 'artistas/camellia-liz/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (57, 62, 'artistas/camila-guaman/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (58, 63, 'artistas/canela/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (59, 64, 'artistas/carvajal-ilustraciones/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (60, 65, 'artistas/cat-linaa-art/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (61, 66, 'artistas/anima-red/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (62, 67, 'artistas/shobian/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (63, 68, 'artistas/acekuros/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (64, 69, 'artistas/aderezo/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (65, 70, 'artistas/alkimia/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (66, 71, 'artistas/arcanista-draws/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (67, 72, 'artistas/astro-glitter/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (68, 73, 'artistas/bekzar/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (69, 74, 'artistas/blanquis/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (70, 75, 'artistas/bolbaran-comics/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (71, 76, 'artistas/camellia-liz/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (72, 77, 'artistas/camila-guaman/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (73, 78, 'artistas/canela/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (74, 79, 'artistas/carvajal-ilustraciones/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (75, 80, 'artistas/cat-linaa-art/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

-- =============================================================================
-- ARTISTA HISTORIAL (entrada mínima para artistas nuevos)
-- =============================================================================
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (22, 21, NULL, 'trazo.austral@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (23, 22, NULL, 'bosque.nublado@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (24, 23, NULL, 'mar.de.lapices@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (25, 24, NULL, 'bruja.dibujante@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (26, 25, NULL, 'condor.creativo@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (27, 26, NULL, 'arena.y.tinta@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (28, 27, NULL, 'nube.de.papel@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (29, 28, NULL, 'relampago.rosa@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (30, 29, NULL, 'zapallo.ilustrado@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (31, 30, NULL, 'chispa.creativa@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (32, 31, NULL, 'rosa.de.los.vientos@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (33, 32, NULL, 'cactus.sonriente@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (34, 33, NULL, 'luna.de.agua@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (35, 34, NULL, 'duende.del.valle@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (36, 35, NULL, 'gaviota.errante@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (37, 36, NULL, 'humedal.ilustrado@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (38, 37, NULL, 'iris.nocturna@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (39, 38, NULL, 'jaguar.de.papel@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (40, 39, NULL, 'koi.andino@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (41, 40, NULL, 'lago.sereno@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (42, 41, NULL, 'marea.alta@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (43, 42, NULL, 'oasis.de.tinta@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (44, 43, NULL, 'puma.salvaje@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (45, 44, NULL, 'quila.cosmica@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (46, 45, NULL, 'roca.dorada@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (47, 46, NULL, 'sol.de.coquimbo@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (48, 47, NULL, 'tierra.adentro@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (49, 48, NULL, 'uva.salvaje@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (50, 49, NULL, 'volcan.dormido@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (51, 50, NULL, 'zorro.gris@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (52, 51, NULL, 'alba.fugaz@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (53, 52, NULL, 'bruma.costera@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (54, 53, NULL, 'cobre.viejo@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (55, 54, NULL, 'desierto.florido@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (56, 55, NULL, 'eco.del.valle@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (57, 56, NULL, 'faro.silente@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (58, 57, NULL, 'grano.de.arena@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (59, 58, NULL, 'hilo.de.luz@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (60, 59, NULL, 'isla.de.papel@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (61, 60, NULL, 'junco.verde@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (62, 61, NULL, 'kuyen.de.tinta@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (63, 62, NULL, 'lena.seca@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (64, 63, NULL, 'musgo.andino@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (65, 64, NULL, 'nogal.sereno@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (66, 65, NULL, 'orilla.del.mar@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (67, 66, NULL, 'piedra.lunar@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (68, 67, NULL, 'quinchamali@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (69, 68, NULL, 'rio.claro@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (70, 69, NULL, 'sendero.norte@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (71, 70, NULL, 'trigo.maduro@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (72, 71, NULL, 'ulmo.florido@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (73, 72, NULL, 'viento.sur@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (74, 73, NULL, 'wetripantu@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (75, 74, NULL, 'yuyo.del.cerro@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (76, 75, NULL, 'zarza.creativa@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (77, 76, NULL, 'agua.de.vertiente@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (78, 77, NULL, 'brisa.salada@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (79, 78, NULL, 'cielo.minero@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (80, 79, NULL, 'duna.rosada@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (81, 80, NULL, 'estrella.fugaz@email.com', NULL, NULL, NULL, 1, '2026-01-20 03:39:14', 'Correo original');

-- =============================================================================
-- CATALOGO ARTISTA (artistas nuevos)
-- =============================================================================
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (16, 21, 'a16', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (17, 22, 'a17', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (18, 23, 'a18', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (19, 24, 'a19', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (20, 25, 'a20', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (21, 26, 'a21', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (22, 27, 'a22', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (23, 28, 'a23', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (24, 29, 'a24', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (25, 30, 'a25', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (26, 31, 'a26', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (27, 32, 'a27', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (28, 33, 'a28', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (29, 34, 'a29', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (30, 35, 'a30', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (31, 36, 'a31', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (32, 37, 'a32', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (33, 38, 'a33', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (34, 39, 'a34', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (35, 40, 'a35', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (36, 41, 'a36', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (37, 42, 'a37', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (38, 43, 'a38', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (39, 44, 'a39', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (40, 45, 'a40', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (41, 46, 'a41', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (42, 47, 'a42', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (43, 48, 'a43', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (44, 49, 'a44', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (45, 50, 'a45', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (46, 51, 'a46', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (47, 52, 'a47', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (48, 53, 'a48', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (49, 54, 'a49', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (50, 55, 'a50', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (51, 56, 'a51', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (52, 57, 'a52', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (53, 58, 'a53', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (54, 59, 'a54', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (55, 60, 'a55', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (56, 61, 'a56', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (57, 62, 'a57', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (58, 63, 'a58', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (59, 64, 'a59', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (60, 65, 'a60', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (61, 66, 'a61', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (62, 67, 'a62', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (63, 68, 'a63', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (64, 69, 'a64', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (65, 70, 'a65', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (66, 71, 'a66', 0, 1, 'Ilustradora que explora la relación entre el territorio y la memoria visual de la Región de Coquimbo.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (67, 72, 'a67', 0, 1, 'Dibujante de narrativa gráfica con interés en el cómic histórico y la investigación documental.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (68, 73, 'a68', 0, 1, 'Artista visual enfocada en técnicas análogas, collage y experimentación con materialidades.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (69, 74, 'a69', 0, 1, 'Ilustrador digital especializado en diseño de personajes y mundos fantásticos.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (70, 75, 'a70', 0, 1, 'Creadora de fanzines y publicaciones independientes, con fuerte vínculo con la autogestión.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (71, 76, 'a71', 0, 1, 'Ilustradora botánica que trabaja la flora nativa del semidesierto chileno.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (72, 77, 'a72', 0, 1, 'Historietista y docente, dedicado a la formación de nuevos lectores de cómic.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (73, 78, 'a73', 0, 1, 'Artista multidisciplinaria que combina ilustración, cerámica y grabado.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (74, 79, 'a74', 0, 1, 'Ilustrador editorial con experiencia en libros infantiles y material didáctico.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (75, 80, 'a75', 0, 1, 'Creadora de contenido visual para redes, con enfoque en educación artística.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

-- =============================================================================
-- EVENTO EDICIONES (III–VII) — 5 festivales nuevos
-- Posters reutilizados del CDN dev (i / ii).
-- VII es la edición ACTIVA: published=1 y fechas futuras.
-- =============================================================================
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (3, 1, NULL, 'III', 'frijol-magico-iii', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (4, 1, 'En Búsqueda del Secreto del Frijol', 'IV', 'frijol-magico-iv', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (5, 1, 'I Aniversario', 'V', 'frijol-magico-v', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (6, 1, 'Descubriendo nuevas raíces', 'VI', 'frijol-magico-vi', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (7, 1, 'Recolectando Semillas', 'VII', 'frijol-magico-vii', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

-- =============================================================================
-- EVENTO EDICION DIAS
-- =============================================================================
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (5, 3, 1, '2018-02-24', '12:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (6, 3, 1, '2018-02-25', '12:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (7, 4, 2, '2019-02-23', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (8, 4, 2, '2019-02-24', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (9, 5, 1, '2021-02-27', '11:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (10, 5, 1, '2021-02-28', '11:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (11, 6, 3, '2024-04-20', '10:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (12, 6, 3, '2024-04-21', '10:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (13, 7, 4, '2026-10-09', '10:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (14, 7, 4, '2026-10-10', '10:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

-- =============================================================================
-- PARTICIPACIONES — Ediciones III a VI (histórico) + VII (espejo de producción)
-- =============================================================================
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (22, 3, 3, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (17, 22, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (23, 3, 5, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (18, 23, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (24, 3, 7, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (19, 24, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (10, 24, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (10, 10, 'El oficio de narrar con imágenes', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '17:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (8, 10, '2018-02-24', '17:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (25, 3, NULL, NULL, 1, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (26, 4, 4, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (20, 26, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (27, 4, 6, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (21, 27, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (11, 27, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (11, 11, 'Taller de color para ilustración', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '18:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (9, 11, '2019-02-24', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (28, 4, 8, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (22, 28, 4, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (29, 4, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (23, 29, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (30, 4, NULL, NULL, 2, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (31, 5, 11, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (24, 31, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (32, 5, 12, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (25, 32, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (33, 5, 13, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (26, 33, 3, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (12, 33, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (12, 12, 'Taller de encuadernación japonesa', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '11:00', 'Mall Vivo Coquimbo', 15, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (10, 12, '2021-02-27', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (34, 5, 14, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (27, 34, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (35, 5, 15, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (28, 35, 4, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (36, 6, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (29, 36, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (13, 36, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (13, 13, 'Acuarela experimental: color y atmósfera', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '12:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (11, 13, '2024-04-20', '12:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (37, 6, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (30, 37, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (38, 6, 16, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (31, 38, 4, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (39, 6, 17, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (32, 39, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (14, 39, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (14, 14, 'Publicar cómic en Chile: rutas posibles', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '14:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (12, 14, '2024-04-21', '14:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (40, 6, 18, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (33, 40, 3, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (41, 6, 19, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (34, 41, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (42, 6, 20, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (35, 42, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (15, 42, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (15, 15, 'Taller de papelería artesanal', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '15:30', 'Mall Vivo Coquimbo', 15, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (13, 15, '2024-04-21', '15:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (43, 6, NULL, NULL, 3, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (44, 6, NULL, NULL, 4, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (45, 6, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (36, 45, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (46, 7, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (37, 46, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (16, 46, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (16, 16, 'Diseño de personajes: del boceto al color', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '17:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (14, 16, '2026-10-09', '17:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (47, 7, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (38, 47, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (17, 47, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (17, 17, 'Acuarela sin miedo: texturas y transparencias', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '18:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (15, 17, '2026-10-10', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (48, 7, 3, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (39, 48, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (18, 48, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (18, 18, 'Taller de fanzine express', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '11:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (16, 18, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (49, 7, 4, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (40, 49, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (19, 49, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (19, 19, 'Animación cuadro a cuadro con tu celular', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '12:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (17, 19, '2026-10-10', '12:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (50, 7, 5, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (41, 50, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (20, 50, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (20, 20, 'Pixel art para principiantes', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '14:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (18, 20, '2026-10-09', '14:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (51, 7, 6, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (42, 51, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (21, 51, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (21, 21, 'Cómic autobiográfico: me acuerdo', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '15:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (19, 21, '2026-10-10', '15:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (52, 7, 7, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (43, 52, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (22, 52, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (22, 22, 'Encuadernación artesanal paso a paso', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '17:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (20, 22, '2026-10-09', '17:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (53, 7, 8, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (44, 53, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (23, 53, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (23, 23, 'Ilustración botánica del semidesierto', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '18:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (21, 23, '2026-10-10', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (54, 7, 9, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (45, 54, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (24, 54, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (24, 24, 'Narrativa visual en cuatro viñetas', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '11:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (22, 24, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (55, 7, 10, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (46, 55, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (25, 55, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (25, 25, 'Entintado con tinta china', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '12:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (23, 25, '2026-10-10', '12:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (56, 7, 11, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (47, 56, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (26, 56, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (26, 26, 'Color digital con paletas limitadas', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '14:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (24, 26, '2026-10-09', '14:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (57, 7, 12, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (48, 57, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (27, 57, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (27, 27, 'Sketchbook urbano: dibujar la ciudad', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '15:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (25, 27, '2026-10-10', '15:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (58, 7, 13, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (49, 58, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (28, 58, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (28, 28, 'Creación de criaturas fantásticas', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '17:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (26, 28, '2026-10-09', '17:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (59, 7, 14, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (50, 59, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (29, 59, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (29, 29, 'Storyboard para cortometrajes', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '18:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (27, 29, '2026-10-10', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (60, 7, 15, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (51, 60, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (30, 60, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (30, 30, 'Serigrafía textil básica', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '11:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (28, 30, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (61, 7, 16, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (52, 61, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (31, 61, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (31, 31, 'Collage y técnicas mixtas', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '12:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (29, 31, '2026-10-10', '12:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (62, 7, 17, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (53, 62, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (32, 62, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (32, 32, 'Ilustración editorial para público infantil', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '14:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (30, 32, '2026-10-09', '14:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (63, 7, 18, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (54, 63, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (33, 63, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (33, 33, 'Lettering para portadas', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '15:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (31, 33, '2026-10-10', '15:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (64, 7, 19, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (55, 64, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (34, 64, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (34, 34, 'Ritmo y composición en la página', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '17:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (32, 34, '2026-10-09', '17:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (65, 7, 20, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (56, 65, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (35, 65, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (35, 35, 'Del 2D al 3D en videojuegos', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 90, '18:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (33, 35, '2026-10-10', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (66, 7, 21, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (57, 66, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (36, 66, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (36, 36, 'Creación de stickers digitales', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 120, '11:00', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (34, 36, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (67, 7, 22, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (58, 67, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (37, 67, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (37, 37, 'Portafolio artístico: cómo mostrarlo', 'Taller práctico y guiado donde las y los participantes desarrollan un ejercicio completo, con materiales incluidos y acompañamiento paso a paso.', 60, '12:30', 'Mall Vivo Coquimbo', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (35, 37, '2026-10-10', '12:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (68, 7, 23, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (59, 68, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (38, 68, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (38, 38, 'Procesos creativos al ilustrar un libro', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '14:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (36, 38, '2026-10-09', '14:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (69, 7, 24, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (60, 69, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (39, 69, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (39, 39, 'Cómo se hace una novela gráfica histórica', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '15:30', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (37, 39, '2026-10-10', '15:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (70, 7, 25, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (61, 70, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (40, 70, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (40, 40, 'Construir comunidad en entornos creativos', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '17:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (38, 40, '2026-10-09', '17:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (71, 7, 26, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (62, 71, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (41, 71, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (41, 41, 'Cómo concretar proyectos sin recursos', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '18:30', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (39, 41, '2026-10-10', '18:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (72, 7, 27, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (63, 72, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (42, 72, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (42, 42, 'Comprendiendo el Pixel Art', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '11:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (40, 42, '2026-10-09', '11:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (73, 7, 28, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (64, 73, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (43, 73, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (43, 43, '¿Por qué dibujar? Reflexiones sobre el oficio', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '12:30', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (41, 43, '2026-10-10', '12:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (74, 7, 29, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (65, 74, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (44, 74, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (44, 44, 'Cómic, memoria y derechos humanos', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '14:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (42, 44, '2026-10-09', '14:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (75, 7, 30, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (66, 75, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (45, 75, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (45, 45, 'Creación artística vs creación de contenido en redes', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '15:30', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (43, 45, '2026-10-10', '15:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (76, 7, 31, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (67, 76, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (46, 76, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (46, 46, 'Usted habla dos idiomas: español y dibujo', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '17:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (44, 46, '2026-10-09', '17:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (77, 7, 32, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (68, 77, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (47, 77, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (47, 47, 'Vivir del arte: experiencias y aprendizajes', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '18:30', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (45, 47, '2026-10-10', '18:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (78, 7, 33, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (69, 78, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (48, 78, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (48, 48, 'Ilustración y territorio: narrar la Región de Coquimbo', 'Charla abierta sobre trayectoria, procesos y aprendizajes, con espacio para preguntas del público.', 45, '11:00', NULL, NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (46, 48, '2026-10-09', '11:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (79, 7, 34, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (70, 79, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (80, 7, 35, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (71, 80, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (81, 7, 36, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (72, 81, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (82, 7, 37, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (73, 82, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (83, 7, 38, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (74, 83, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (84, 7, 39, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (75, 84, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (85, 7, 40, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (76, 85, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (86, 7, 41, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (77, 86, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (87, 7, 42, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (78, 87, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (88, 7, 43, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (79, 88, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (89, 7, 44, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (80, 89, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (90, 7, 45, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (81, 90, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (91, 7, 46, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (82, 91, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (92, 7, 47, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (83, 92, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (93, 7, 48, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (84, 93, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (94, 7, 49, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (85, 94, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (95, 7, 50, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (86, 95, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (96, 7, 51, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (87, 96, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (97, 7, 52, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (88, 97, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (98, 7, 53, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (89, 98, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (99, 7, 54, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (90, 99, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (100, 7, 55, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (91, 100, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (101, 7, 56, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (92, 101, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (102, 7, 57, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (93, 102, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (103, 7, 58, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (94, 103, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (104, 7, 59, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (95, 104, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (105, 7, 60, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (96, 105, 4, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (106, 7, 61, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (107, 7, 62, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (108, 7, 63, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (109, 7, 64, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (110, 7, 65, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (111, 7, 66, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (112, 7, 67, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (113, 7, 68, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (114, 7, 69, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (115, 7, 70, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (116, 7, 71, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (117, 7, 72, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (118, 7, 73, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (119, 7, 74, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (120, 7, 75, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (121, 7, 76, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (122, 7, 77, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (123, 7, 78, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (124, 7, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

-- =============================================================================
-- INSCRIPCIONES (DEV) — taller de la edición activa con inscripción abierta
-- =============================================================================
INSERT INTO activity_registration (id, participation_activity_id, url, start_at, end_at)
VALUES (2, 16, 'https://example.org/inscripcion-taller-activo', '2026-09-01T00:00:00.000Z', '2099-12-31T23:59:59.000Z');

-- =============================================================================
-- FIN DEL SEED EXTENDIDO
-- =============================================================================

-- =============================================================================
-- FIN DEL SEED
-- =============================================================================
