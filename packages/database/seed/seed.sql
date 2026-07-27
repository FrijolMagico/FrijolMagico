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
--     → getAvatarUrl(path) resuelve concatenando CDN_URL env var
--     → Formato: artistas/{slug}/avatar-{version}.webp
--   - Posters: poster_url = poster_path como ruta relativa + poster_version
--     → Formato: festivales/{event-slug}/{edition-slug}/afiche.webp
--     ⚠️ El código actual (festivalDetailQuery) lee poster_url como URL absoluta.
--       Para que funcione sin cambios, actualizar la query/mapper para resolver
--       poster_path + poster_version via composeAssetUrl().
--
-- IMPORTANTE:
--   CDN_URL en .env.local debe apuntar al bucket de desarrollo
--   (ej: CDN_URL="https://dev-cdn.frijolmagico.cl").
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
-- Los paths son relativos → getAvatarUrl() los resuelve con CDN_URL.
-- Los archivos .webp deben existir en el bucket dev en estos paths.
-- Versiones: artistas 1-2 → t0, t1; posters → t2, t3; artistas 3-15 → t4 a t16.

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (1, 1, 'artistas/anima-red/avatar-1700000000000.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000000');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (2, 2, 'artistas/shobian/avatar-1700000000001.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000001');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (3, 3, 'artistas/acekuros/avatar-1700000000004.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000004');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (4, 4, 'artistas/aderezo/avatar-1700000000005.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000005');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (5, 5, 'artistas/alkimia/avatar-1700000000006.webp', 'avatar', 1, '{"width":800,"height":800,"size":89436,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000006');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (6, 6, 'artistas/arcanista-draws/avatar-1700000000007.webp', 'avatar', 1, '{"width":800,"height":800,"size":107548,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000007');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (7, 7, 'artistas/astro-glitter/avatar-1700000000008.webp', 'avatar', 1, '{"width":800,"height":800,"size":70512,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000008');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (8, 8, 'artistas/bekzar/avatar-1700000000009.webp', 'avatar', 1, '{"width":800,"height":800,"size":37958,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000009');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (9, 9, 'artistas/blanquis/avatar-1700000000010.webp', 'avatar', 1, '{"width":800,"height":800,"size":137494,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000010');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (10, 10, 'artistas/bolbaran-comics/avatar-1700000000011.webp', 'avatar', 1, '{"width":800,"height":800,"size":110228,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000011');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (11, 11, 'artistas/camellia-liz/avatar-1700000000012.webp', 'avatar', 1, '{"width":800,"height":800,"size":52510,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000012');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (12, 12, 'artistas/camila-guaman/avatar-1700000000013.webp', 'avatar', 1, '{"width":800,"height":800,"size":71800,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000013');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (13, 13, 'artistas/canela/avatar-1700000000014.webp', 'avatar', 1, '{"width":800,"height":800,"size":116490,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000014');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (14, 14, 'artistas/carvajal-ilustraciones/avatar-1700000000015.webp', 'avatar', 1, '{"width":800,"height":800,"size":48586,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000015');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (15, 15, 'artistas/cat-linaa-art/avatar-1700000000016.webp', 'avatar', 1, '{"width":800,"height":800,"size":54396,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '1700000000016');

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
-- poster_path formato: festivales/{event-slug}/{edition-slug}/afiche.webp
-- poster_url = poster_path (relativo) — ⚠️ el código actual lee poster_url como
-- URL absoluta. Migrar la query/mapper para resolver con composeAssetUrl().

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (1, 1, NULL, 'I', 'frijol-magico-i', 'festivales/frijol-magico/frijol-magico-i/afiche.webp', 'festivales/frijol-magico/frijol-magico-i/afiche.webp', '1700000000002', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (2, 1, 'Día del Libro', 'II', 'frijol-magico-ii', 'festivales/frijol-magico/frijol-magico-ii/afiche.webp', 'festivales/frijol-magico/frijol-magico-ii/afiche.webp', '1700000000003', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

-- =============================================================================
-- EVENTO EDICION DIAS
-- =============================================================================

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (1, 1, 1, '2017-02-25', '14:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (2, 2, 2, '2017-04-22', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

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

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (2, 2, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

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
-- FIN DEL SEED
-- =============================================================================
