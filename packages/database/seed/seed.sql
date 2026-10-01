
INSERT OR IGNORE INTO disciplina (slug) VALUES ('ilustracion');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('narrativa-grafica');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('manualidades');
INSERT OR IGNORE INTO disciplina (slug) VALUES ('fotografia');

INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (1, 'desconocido');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (2, 'activo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (3, 'inactivo');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (4, 'vetado');
INSERT OR IGNORE INTO artista_estado (id, slug) VALUES (5, 'cancelado');

INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'seleccion', 'Artista seleccionado mediante convocatoria abierta'
);
INSERT OR IGNORE INTO modo_ingreso (slug, descripcion) VALUES (
    'invitacion', 'Artista invitado directamente por la organización'
);
INSERT OR IGNORE INTO modo_ingreso (id, slug, descripcion) VALUES (
    3, 'suplencia', 'Artista agregado desde la lista de suplentes'
);

INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'taller', 'Actividad práctica con participación de asistentes'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'charla', 'Presentación o conferencia'
);
INSERT OR IGNORE INTO tipo_actividad (slug, descripcion) VALUES (
    'musica', 'Presentación musical en vivo'
);

INSERT INTO organizacion (id, nombre, descripcion, mision, vision, created_at, updated_at)
VALUES (
    1,'Synthetic Festival Fixture Organization','Synthetic organization fixture for database tests.','Fixture mission for test data.','Fixture vision for test data.',
    '2026-01-20 03:38:49',
    '2026-01-20 03:38:49'
);

INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (1,'Fixture Venue 01','Synthetic venue address','Fixture City',NULL,'https://example.invalid/venue-01', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (2,'Fixture Venue 02','Synthetic venue address','Fixture City',NULL,'https://example.invalid/venue-02', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (1, 2,'Fixture Person 001','Fixture Artist 001','fixture-artist-001','FIXTURE-ID-001','artist-001@example.invalid','{"profile":"https://example.invalid/fixture-artist-001"}','Fixture City','ZZ',NULL, '2026-01-20 03:39:05', '2026-07-24 22:06:19', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (2, 2,'Fixture Person 002','Fixture Artist 002','fixture-artist-002','FIXTURE-ID-002','artist-002@example.invalid','{"profile":"https://example.invalid/fixture-artist-002"}','Fixture City','ZZ',NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (3, 2,'Fixture Person 003','Fixture Artist 003','fixture-artist-003','FIXTURE-ID-003','artist-003@example.invalid','{"profile":"https://example.invalid/fixture-artist-003"}','Fixture City','ZZ',NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (4, 2,'Fixture Person 004','Fixture Artist 004','fixture-artist-004','FIXTURE-ID-004','artist-004@example.invalid','{"profile":"https://example.invalid/fixture-artist-004"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (5, 2,'Fixture Person 005','Fixture Artist 005','fixture-artist-005','FIXTURE-ID-005','artist-005@example.invalid','{"profile":"https://example.invalid/fixture-artist-005"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (6, 2,'Fixture Person 006','Fixture Artist 006','fixture-artist-006','FIXTURE-ID-006','artist-006@example.invalid','{"profile":"https://example.invalid/fixture-artist-006"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (7, 2,'Fixture Person 007','Fixture Artist 007','fixture-artist-007','FIXTURE-ID-007','artist-007@example.invalid','{"profile":"https://example.invalid/fixture-artist-007"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (8, 2,'Fixture Person 008','Fixture Artist 008','fixture-artist-008','FIXTURE-ID-008','artist-008@example.invalid','{"profile":"https://example.invalid/fixture-artist-008"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (9, 2,'Fixture Person 009','Fixture Artist 009','fixture-artist-009','FIXTURE-ID-009','artist-009@example.invalid','{"profile":"https://example.invalid/fixture-artist-009"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (10, 2,'Fixture Person 010','Fixture Artist 010','fixture-artist-010','FIXTURE-ID-010','artist-010@example.invalid','{"profile":"https://example.invalid/fixture-artist-010"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (11, 2,'Fixture Person 011','Fixture Artist 011','fixture-artist-011','FIXTURE-ID-011','artist-011@example.invalid','{"profile":"https://example.invalid/fixture-artist-011"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (12, 2,'Fixture Person 012','Fixture Artist 012','fixture-artist-012','FIXTURE-ID-012','artist-012@example.invalid','{"profile":"https://example.invalid/fixture-artist-012"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (13, 2,'Fixture Person 013','Fixture Artist 013','fixture-artist-013','FIXTURE-ID-013','artist-013@example.invalid','{"profile":"https://example.invalid/fixture-artist-013"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (14, 2,'Fixture Person 014','Fixture Artist 014','fixture-artist-014','FIXTURE-ID-014','artist-014@example.invalid','{"profile":"https://example.invalid/fixture-artist-014"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (15, 2,'Fixture Person 015','Fixture Artist 015','fixture-artist-015','FIXTURE-ID-015','artist-015@example.invalid','{"profile":"https://example.invalid/fixture-artist-015"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista_slug_alias (slug, artista_id) VALUES ('fixture-artist-001-legacy', 1);

INSERT INTO artista_pseudonimo (id, artista_id, pseudonimo, deleted_at, created_at, updated_at) VALUES (1000, 1, 'Fixture Retired Alias 001', '2026-01-01 00:00:00', '2026-01-01 00:00:00', '2026-01-01 00:00:00');
INSERT INTO artista_pseudonimo (id, artista_id, pseudonimo, created_at, updated_at) VALUES (1001, 1, 'Fixture Secondary Alias 001', '2026-01-01 00:00:00', '2026-01-01 00:00:00');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (1, 1,'artistas/fixture-artist-001/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (2, 2,'artistas/fixture-artist-002/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (3, 3,'artistas/fixture-artist-003/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (4, 4,'artistas/fixture-artist-004/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (5, 5,'artistas/fixture-artist-005/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":89436,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (6, 6,'artistas/fixture-artist-006/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":107548,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (7, 7,'artistas/fixture-artist-007/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":70512,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (8, 8,'artistas/fixture-artist-008/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":37958,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (9, 9,'artistas/fixture-artist-009/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":137494,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (10, 10,'artistas/fixture-artist-010/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":110228,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (11, 11,'artistas/fixture-artist-011/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":52510,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (12, 12,'artistas/fixture-artist-012/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":71800,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (13, 13,'artistas/fixture-artist-013/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":116490,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (14, 14,'artistas/fixture-artist-014/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":48586,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');

INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (15, 15,'artistas/fixture-artist-015/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":54396,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (1, 1,'Fixture Former Alias 001','history-001@example.invalid','{"profile":"https://example.invalid/history-001"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (2, 1,'Fixture Former Alias 001','history-001@example.invalid','{"profile":"https://example.invalid/history-001"}','Fixture City','ZZ', 2, '2026-03-05 23:33:20','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas)
VALUES (3, 2,'Fixture Former Alias 002','history-002@example.invalid','{"profile":"https://example.invalid/history-002"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (4, 3,'Fixture Former Alias 003','history-003@example.invalid','{"profile":"https://example.invalid/history-003"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (5, 4,'Fixture Former Alias 004','history-004@example.invalid','{"profile":"https://example.invalid/history-004"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (6, 5,'Fixture Former Alias 005','history-005@example.invalid','{"profile":"https://example.invalid/history-005"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (7, 6,'Fixture Former Alias 006','history-006@example.invalid','{"profile":"https://example.invalid/history-006"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (8, 7,'Fixture Former Alias 007','history-007@example.invalid','{"profile":"https://example.invalid/history-007"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (9, 8,'Fixture Former Alias 008','history-008@example.invalid','{"profile":"https://example.invalid/history-008"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (10, 9,'Fixture Former Alias 009','history-009@example.invalid','{"profile":"https://example.invalid/history-009"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (11, 10,'Fixture Former Alias 010','history-010@example.invalid','{"profile":"https://example.invalid/history-010"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (12, 11,'Fixture Former Alias 011','history-011@example.invalid','{"profile":"https://example.invalid/history-011"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (13, 12,'Fixture Former Alias 012','history-012@example.invalid','{"profile":"https://example.invalid/history-012"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (14, 13,'Fixture Former Alias 013','history-013@example.invalid','{"profile":"https://example.invalid/history-013"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (15, 14,'Fixture Former Alias 014','history-014@example.invalid','{"profile":"https://example.invalid/history-014"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (16, 15,'Fixture Former Alias 015','history-015@example.invalid','{"profile":"https://example.invalid/history-015"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (1, 1, 'a1', 0, 1,'Synthetic portfolio description for fixture artist 001.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (2, 2, 'a2', 0, 1,'Synthetic portfolio description for fixture artist 002.', '2026-01-20 03:39:11', '2026-06-22 06:20:08', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (3, 3, 'a3', 0, 1,'Synthetic portfolio description for fixture artist 003.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (4, 4, 'a4', 0, 1,'Synthetic portfolio description for fixture artist 004.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (5, 5, 'a5', 0, 1,'Synthetic portfolio description for fixture artist 005.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (6, 6, 'a6', 0, 1,'Synthetic portfolio description for fixture artist 006.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (7, 7, 'a7', 0, 1,'Synthetic portfolio description for fixture artist 007.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (8, 8, 'a8', 0, 1,'Synthetic portfolio description for fixture artist 008.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (9, 9, 'a9', 0, 1,'Synthetic portfolio description for fixture artist 009.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (10, 10, 'a10', 0, 1,'Synthetic portfolio description for fixture artist 010.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (11, 11, 'a11', 0, 1,'Synthetic portfolio description for fixture artist 011.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (12, 12, 'a12', 0, 1,'Synthetic portfolio description for fixture artist 012.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (13, 13, 'a13', 0, 1,'Synthetic portfolio description for fixture artist 013.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (14, 14, 'a14', 0, 1,'Synthetic portfolio description for fixture artist 014.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (15, 15, 'a15', 0, 1,'Synthetic portfolio description for fixture artist 015.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);

INSERT INTO evento (id, organizacion_id, nombre, slug, descripcion, created_at, updated_at)
VALUES (1, 1, 'Festival Frijol Mágico', 'frijol-magico','Synthetic festival event fixture.', '2026-01-20 03:38:52', '2026-01-20 03:38:52');

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (1, 1,'Festival Fixture Edition 01', 'I', 'frijol-magico-i', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (2, 1,'Festival Fixture Edition 02', 'II', 'frijol-magico-ii', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (1, 1, 1, '2017-02-25', '14:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (2, 2, 2, '2017-04-22', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (3, 1, 1, '2017-02-26', '12:00', '20:00', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO evento_edicion_dia (id, evento_edicion_id, lugar_id, fecha, hora_inicio, hora_fin, modalidad, created_at, updated_at)
VALUES (4, 2, 2, '2017-04-23', '12:00', '20:30', 'presencial', '2026-01-20 03:38:59', '2026-01-20 03:38:59');

INSERT INTO agrupacion (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (1,'Synthetic Collective Fixture','Synthetic collective description for database tests.','collective@example.invalid', 1, '2026-01-20 03:39:17', '2026-01-20 03:39:17');

INSERT INTO agrupacion (id, nombre, descripcion, correo, activo, created_at, updated_at)
VALUES (2,'Synthetic Collective Fixture 02','Second synthetic collective for participant mix tests.','collective-02@example.invalid', 1, '2026-01-20 03:39:18', '2026-01-20 03:39:18');

INSERT INTO agrupacion_artista (agrupacion_id, artista_id, rol, activo, created_at, pseudonimo_id)
VALUES (1, 1, 'Ilustradora principal', 1, '2026-03-21 18:44:27', 1);

INSERT INTO agrupacion_artista (agrupacion_id, artista_id, rol, activo, created_at, pseudonimo_id)
VALUES (1, 2, 'Diseñadora gráfica', 1, '2026-03-21 18:44:55', 2);

INSERT INTO agrupacion_artista (agrupacion_id, artista_id, rol, activo, created_at, pseudonimo_id)
VALUES (1, 3, 'Historical member fixture', 0, '2017-02-25 12:00:00', 3);

UPDATE agrupacion_artista
SET pseudonimo_id = 1001
WHERE agrupacion_id = 1 AND artista_id = 1;

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (2, 1, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (3, 2, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (2, 2, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (1, 1, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (1, 1,'Fixture Activity 001','Synthetic activity description for test data.', 60, '18:00','Fixture Venue', 12, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (4, 2, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (3, 4, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (5, 1, 3, NULL, NULL, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (4, 5, 3, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (2, 2, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (2, 2,'Fixture Activity 002','Synthetic activity description for test data.', 45, '16:00','Fixture Venue', 20, '2026-07-04 04:18:41', '2026-07-04 04:18:41');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (5, 3, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (3, 3, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (3, 3,'Fixture Activity 003','Synthetic activity description for test data.', 90, '15:00','Fixture Venue', 15, '2026-07-04 04:18:42', '2026-07-04 04:18:42');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (6, 2, 2, NULL, NULL, NULL, '2026-01-20 03:39:15', '2026-03-05 23:48:56');

INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (6, 6, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (4, 6, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');

INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (4, 4,'Fixture Activity 004','Synthetic activity description for test data.', 50, '17:30','Fixture Venue', 30, '2026-07-04 04:18:43', '2026-07-04 04:18:43');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (1,'Fixture Band 01','Synthetic band description for database tests.','band-01@example.invalid', 1, '2026-07-04 04:18:44', '2026-07-04 04:18:44');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (2,'Fixture Band 02','Synthetic band description for database tests.','band-02@example.invalid', 1, '2026-07-04 04:18:45', '2026-07-04 04:18:45');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (3,'Fixture Band 03','Synthetic band description for database tests.','band-03@example.invalid', 1, '2026-07-04 04:18:46', '2026-07-04 04:18:46');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (4,'Fixture Band 04','Synthetic band description for database tests.','band-04@example.invalid', 1, '2026-07-04 04:18:47', '2026-07-04 04:18:47');

INSERT INTO band (id, name, description, email, active, created_at, updated_at)
VALUES (5,'Fixture Band 05','Synthetic band description for database tests.','band-05@example.invalid', 1, '2026-07-04 04:18:48', '2026-07-04 04:18:48');

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

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (16, 2,'Fixture Person 016','Fixture Artist 016','fixture-artist-016','FIXTURE-ID-016','artist-016@example.invalid','{"profile":"https://example.invalid/fixture-artist-016"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (17, 2,'Fixture Person 017','Fixture Artist 017','fixture-artist-017','FIXTURE-ID-017','artist-017@example.invalid','{"profile":"https://example.invalid/fixture-artist-017"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (18, 2,'Fixture Person 018','Fixture Artist 018','fixture-artist-018','FIXTURE-ID-018','artist-018@example.invalid','{"profile":"https://example.invalid/fixture-artist-018"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (19, 2,'Fixture Person 019','Fixture Artist 019','fixture-artist-019','FIXTURE-ID-019','artist-019@example.invalid','{"profile":"https://example.invalid/fixture-artist-019"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (20, 2,'Fixture Person 020','Fixture Artist 020','fixture-artist-020','FIXTURE-ID-020','artist-020@example.invalid','{"profile":"https://example.invalid/fixture-artist-020"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);

INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (17, 16,'Fixture Former Alias 016','history-016@example.invalid','{"profile":"https://example.invalid/history-016"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (18, 17,'Fixture Former Alias 017','history-017@example.invalid','{"profile":"https://example.invalid/history-017"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (19, 18,'Fixture Former Alias 018','history-018@example.invalid','{"profile":"https://example.invalid/history-018"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (20, 19,'Fixture Former Alias 019','history-019@example.invalid','{"profile":"https://example.invalid/history-019"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (21, 20,'Fixture Former Alias 020','history-020@example.invalid','{"profile":"https://example.invalid/history-020"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (12, 1, 16, NULL, NULL,'Synthetic participation fixture 012.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (7, 12, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (5, 12, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (5, 5,'Fixture Activity 005','Synthetic activity description for test data.', 90, '15:30','Fixture Venue', 12, '2026-07-04 04:18:44', '2026-07-04 04:18:44');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (13, 2, 16, NULL, NULL,'Synthetic participation fixture 013.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (8, 13, 3, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (14, 1, 17, NULL, NULL,'Synthetic participation fixture 014.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (9, 14, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (15, 2, 17, NULL, NULL,'Synthetic participation fixture 015.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (10, 15, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (6, 15, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (6, 6,'Fixture Activity 006','Synthetic activity description for test data.', 45, '16:30','Fixture Venue', 25, '2026-07-04 04:18:45', '2026-07-04 04:18:45');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (16, 1, 18, NULL, NULL,'Synthetic participation fixture 016.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (11, 16, 3, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (17, 2, 18, NULL, NULL,'Synthetic participation fixture 017.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (12, 17, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (18, 1, 19, NULL, NULL,'Synthetic participation fixture 018.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (13, 18, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (7, 18, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (7, 7,'Fixture Activity 007','Synthetic activity description for test data.', 120, '14:00','Fixture Venue', 15, '2026-07-04 04:18:46', '2026-07-04 04:18:46');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (19, 2, 19, NULL, NULL,'Synthetic participation fixture 019.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (14, 19, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (8, 19, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (8, 8,'Fixture Activity 008','Synthetic activity description for test data.', 50, '18:00','Fixture Venue', 30, '2026-07-04 04:18:47', '2026-07-04 04:18:47');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (20, 1, 20, NULL, NULL,'Synthetic participation fixture 020.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (15, 20, 3, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');

INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (21, 2, 20, NULL, NULL,'Synthetic participation fixture 021.', '2026-01-20 03:39:15', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (16, 21, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:57', '2026-03-05 23:48:57');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (9, 21, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (9, 9,'Fixture Activity 009','Synthetic activity description for test data.', 90, '14:30','Fixture Venue', 15, '2026-07-04 04:18:48', '2026-07-04 04:18:48');

INSERT INTO activity_registration (id, participation_activity_id, url, start_at, end_at)
VALUES (1, 3,'https://example.invalid/registration-001', '2020-01-01T00:00:00.000Z', '2099-12-31T23:59:59.000Z');

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (1, 1, '2017-02-25', '18:00', 60);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (2, 2, '2017-02-25', '16:00', 45);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (3, 2, '2017-02-26', '16:30', 45);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes, url)
VALUES (4, 3, '2017-04-22', '15:00', 90, 'https://example.org/acuarela-sabado-1500');

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes, url)
VALUES (5, 3, '2017-04-23', '16:30', 90, 'https://example.org/acuarela-domingo-1630');

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes, url)
VALUES (53, 3, '2017-04-22', '17:00', 60, 'https://example.org/acuarela-sabado-1700');

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (6, 4, '2017-04-22', '17:30', 50);

INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (7, 4, '2017-04-23', '14:00', 50);
INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (3,'Fixture Venue 03','Synthetic venue address','Fixture City',NULL,'https://example.invalid/venue-03', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO lugar (id, nombre, direccion, ciudad, coordenadas, url, created_at, updated_at)
VALUES (4,'Fixture Venue 04','Synthetic venue address','Fixture City',NULL,'https://example.invalid/venue-04', '2026-01-20 03:38:59', '2026-01-20 03:38:59');
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (21, 2,'Fixture Person 021','Fixture Artist 021','fixture-artist-021','FIXTURE-ID-021','artist-021@example.invalid','{"profile":"https://example.invalid/fixture-artist-021"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (22, 2,'Fixture Person 022','Fixture Artist 022','fixture-artist-022','FIXTURE-ID-022','artist-022@example.invalid','{"profile":"https://example.invalid/fixture-artist-022"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (23, 2,'Fixture Person 023','Fixture Artist 023','fixture-artist-023','FIXTURE-ID-023','artist-023@example.invalid','{"profile":"https://example.invalid/fixture-artist-023"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (24, 2,'Fixture Person 024','Fixture Artist 024','fixture-artist-024','FIXTURE-ID-024','artist-024@example.invalid','{"profile":"https://example.invalid/fixture-artist-024"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (25, 2,'Fixture Person 025','Fixture Artist 025','fixture-artist-025','FIXTURE-ID-025','artist-025@example.invalid','{"profile":"https://example.invalid/fixture-artist-025"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (26, 2,'Fixture Person 026','Fixture Artist 026','fixture-artist-026','FIXTURE-ID-026','artist-026@example.invalid','{"profile":"https://example.invalid/fixture-artist-026"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (27, 2,'Fixture Person 027','Fixture Artist 027','fixture-artist-027','FIXTURE-ID-027','artist-027@example.invalid','{"profile":"https://example.invalid/fixture-artist-027"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (28, 2,'Fixture Person 028','Fixture Artist 028','fixture-artist-028','FIXTURE-ID-028','artist-028@example.invalid','{"profile":"https://example.invalid/fixture-artist-028"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (29, 2,'Fixture Person 029','Fixture Artist 029','fixture-artist-029','FIXTURE-ID-029','artist-029@example.invalid','{"profile":"https://example.invalid/fixture-artist-029"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (30, 2,'Fixture Person 030','Fixture Artist 030','fixture-artist-030','FIXTURE-ID-030','artist-030@example.invalid','{"profile":"https://example.invalid/fixture-artist-030"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (31, 2,'Fixture Person 031','Fixture Artist 031','fixture-artist-031','FIXTURE-ID-031','artist-031@example.invalid','{"profile":"https://example.invalid/fixture-artist-031"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (32, 2,'Fixture Person 032','Fixture Artist 032','fixture-artist-032','FIXTURE-ID-032','artist-032@example.invalid','{"profile":"https://example.invalid/fixture-artist-032"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (33, 2,'Fixture Person 033','Fixture Artist 033','fixture-artist-033','FIXTURE-ID-033','artist-033@example.invalid','{"profile":"https://example.invalid/fixture-artist-033"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (34, 2,'Fixture Person 034','Fixture Artist 034','fixture-artist-034','FIXTURE-ID-034','artist-034@example.invalid','{"profile":"https://example.invalid/fixture-artist-034"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (35, 2,'Fixture Person 035','Fixture Artist 035','fixture-artist-035','FIXTURE-ID-035','artist-035@example.invalid','{"profile":"https://example.invalid/fixture-artist-035"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (36, 2,'Fixture Person 036','Fixture Artist 036','fixture-artist-036','FIXTURE-ID-036','artist-036@example.invalid','{"profile":"https://example.invalid/fixture-artist-036"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (37, 2,'Fixture Person 037','Fixture Artist 037','fixture-artist-037','FIXTURE-ID-037','artist-037@example.invalid','{"profile":"https://example.invalid/fixture-artist-037"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (38, 2,'Fixture Person 038','Fixture Artist 038','fixture-artist-038','FIXTURE-ID-038','artist-038@example.invalid','{"profile":"https://example.invalid/fixture-artist-038"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (39, 2,'Fixture Person 039','Fixture Artist 039','fixture-artist-039','FIXTURE-ID-039','artist-039@example.invalid','{"profile":"https://example.invalid/fixture-artist-039"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (40, 2,'Fixture Person 040','Fixture Artist 040','fixture-artist-040','FIXTURE-ID-040','artist-040@example.invalid','{"profile":"https://example.invalid/fixture-artist-040"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (41, 2,'Fixture Person 041','Fixture Artist 041','fixture-artist-041','FIXTURE-ID-041','artist-041@example.invalid','{"profile":"https://example.invalid/fixture-artist-041"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (42, 2,'Fixture Person 042','Fixture Artist 042','fixture-artist-042','FIXTURE-ID-042','artist-042@example.invalid','{"profile":"https://example.invalid/fixture-artist-042"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (43, 2,'Fixture Person 043','Fixture Artist 043','fixture-artist-043','FIXTURE-ID-043','artist-043@example.invalid','{"profile":"https://example.invalid/fixture-artist-043"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (44, 2,'Fixture Person 044','Fixture Artist 044','fixture-artist-044','FIXTURE-ID-044','artist-044@example.invalid','{"profile":"https://example.invalid/fixture-artist-044"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (45, 2,'Fixture Person 045','Fixture Artist 045','fixture-artist-045','FIXTURE-ID-045','artist-045@example.invalid','{"profile":"https://example.invalid/fixture-artist-045"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (46, 2,'Fixture Person 046','Fixture Artist 046','fixture-artist-046','FIXTURE-ID-046','artist-046@example.invalid','{"profile":"https://example.invalid/fixture-artist-046"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (47, 2,'Fixture Person 047','Fixture Artist 047','fixture-artist-047','FIXTURE-ID-047','artist-047@example.invalid','{"profile":"https://example.invalid/fixture-artist-047"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (48, 2,'Fixture Person 048','Fixture Artist 048','fixture-artist-048','FIXTURE-ID-048','artist-048@example.invalid','{"profile":"https://example.invalid/fixture-artist-048"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (49, 2,'Fixture Person 049','Fixture Artist 049','fixture-artist-049','FIXTURE-ID-049','artist-049@example.invalid','{"profile":"https://example.invalid/fixture-artist-049"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (50, 2,'Fixture Person 050','Fixture Artist 050','fixture-artist-050','FIXTURE-ID-050','artist-050@example.invalid','{"profile":"https://example.invalid/fixture-artist-050"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (51, 2,'Fixture Person 051','Fixture Artist 051','fixture-artist-051','FIXTURE-ID-051','artist-051@example.invalid','{"profile":"https://example.invalid/fixture-artist-051"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (52, 2,'Fixture Person 052','Fixture Artist 052','fixture-artist-052','FIXTURE-ID-052','artist-052@example.invalid','{"profile":"https://example.invalid/fixture-artist-052"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (53, 2,'Fixture Person 053','Fixture Artist 053','fixture-artist-053','FIXTURE-ID-053','artist-053@example.invalid','{"profile":"https://example.invalid/fixture-artist-053"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (54, 2,'Fixture Person 054','Fixture Artist 054','fixture-artist-054','FIXTURE-ID-054','artist-054@example.invalid','{"profile":"https://example.invalid/fixture-artist-054"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (55, 2,'Fixture Person 055','Fixture Artist 055','fixture-artist-055','FIXTURE-ID-055','artist-055@example.invalid','{"profile":"https://example.invalid/fixture-artist-055"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (56, 2,'Fixture Person 056','Fixture Artist 056','fixture-artist-056','FIXTURE-ID-056','artist-056@example.invalid','{"profile":"https://example.invalid/fixture-artist-056"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (57, 2,'Fixture Person 057','Fixture Artist 057','fixture-artist-057','FIXTURE-ID-057','artist-057@example.invalid','{"profile":"https://example.invalid/fixture-artist-057"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (58, 2,'Fixture Person 058','Fixture Artist 058','fixture-artist-058','FIXTURE-ID-058','artist-058@example.invalid','{"profile":"https://example.invalid/fixture-artist-058"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (59, 2,'Fixture Person 059','Fixture Artist 059','fixture-artist-059','FIXTURE-ID-059','artist-059@example.invalid','{"profile":"https://example.invalid/fixture-artist-059"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (60, 2,'Fixture Person 060','Fixture Artist 060','fixture-artist-060','FIXTURE-ID-060','artist-060@example.invalid','{"profile":"https://example.invalid/fixture-artist-060"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (61, 2,'Fixture Person 061','Fixture Artist 061','fixture-artist-061','FIXTURE-ID-061','artist-061@example.invalid','{"profile":"https://example.invalid/fixture-artist-061"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (62, 2,'Fixture Person 062','Fixture Artist 062','fixture-artist-062','FIXTURE-ID-062','artist-062@example.invalid','{"profile":"https://example.invalid/fixture-artist-062"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (63, 2,'Fixture Person 063','Fixture Artist 063','fixture-artist-063','FIXTURE-ID-063','artist-063@example.invalid','{"profile":"https://example.invalid/fixture-artist-063"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (64, 2,'Fixture Person 064','Fixture Artist 064','fixture-artist-064','FIXTURE-ID-064','artist-064@example.invalid','{"profile":"https://example.invalid/fixture-artist-064"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (65, 2,'Fixture Person 065','Fixture Artist 065','fixture-artist-065','FIXTURE-ID-065','artist-065@example.invalid','{"profile":"https://example.invalid/fixture-artist-065"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (66, 2,'Fixture Person 066','Fixture Artist 066','fixture-artist-066','FIXTURE-ID-066','artist-066@example.invalid','{"profile":"https://example.invalid/fixture-artist-066"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (67, 2,'Fixture Person 067','Fixture Artist 067','fixture-artist-067','FIXTURE-ID-067','artist-067@example.invalid','{"profile":"https://example.invalid/fixture-artist-067"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (68, 2,'Fixture Person 068','Fixture Artist 068','fixture-artist-068','FIXTURE-ID-068','artist-068@example.invalid','{"profile":"https://example.invalid/fixture-artist-068"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (69, 2,'Fixture Person 069','Fixture Artist 069','fixture-artist-069','FIXTURE-ID-069','artist-069@example.invalid','{"profile":"https://example.invalid/fixture-artist-069"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista (id, estado_id, nombre, pseudonimo, slug, rut, correo, rrss, ciudad, pais, telefono, created_at, updated_at, deleted_at)
VALUES (70, 2,'Fixture Person 070','Fixture Artist 070','fixture-artist-070','FIXTURE-ID-070','artist-070@example.invalid','{"profile":"https://example.invalid/fixture-artist-070"}','Fixture City','ZZ', NULL, '2026-01-20 03:39:05', '2026-03-05 23:48:49', NULL);
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (16, 21,'artistas/fixture-artist-021/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (17, 22,'artistas/fixture-artist-022/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (18, 23,'artistas/fixture-artist-023/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (19, 24,'artistas/fixture-artist-024/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (20, 25,'artistas/fixture-artist-025/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (21, 26,'artistas/fixture-artist-026/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (22, 27,'artistas/fixture-artist-027/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (23, 28,'artistas/fixture-artist-028/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (24, 29,'artistas/fixture-artist-029/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (25, 30,'artistas/fixture-artist-030/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (26, 31,'artistas/fixture-artist-031/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (27, 32,'artistas/fixture-artist-032/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (28, 33,'artistas/fixture-artist-033/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (29, 34,'artistas/fixture-artist-034/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (30, 35,'artistas/fixture-artist-035/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (31, 36,'artistas/fixture-artist-036/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (32, 37,'artistas/fixture-artist-037/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (33, 38,'artistas/fixture-artist-038/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (34, 39,'artistas/fixture-artist-039/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (35, 40,'artistas/fixture-artist-040/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (36, 41,'artistas/fixture-artist-041/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (37, 42,'artistas/fixture-artist-042/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (38, 43,'artistas/fixture-artist-043/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (39, 44,'artistas/fixture-artist-044/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (40, 45,'artistas/fixture-artist-045/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (41, 46,'artistas/fixture-artist-046/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (42, 47,'artistas/fixture-artist-047/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (43, 48,'artistas/fixture-artist-048/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (44, 49,'artistas/fixture-artist-049/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (45, 50,'artistas/fixture-artist-050/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (46, 51,'artistas/fixture-artist-051/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (47, 52,'artistas/fixture-artist-052/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (48, 53,'artistas/fixture-artist-053/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (49, 54,'artistas/fixture-artist-054/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (50, 55,'artistas/fixture-artist-055/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (51, 56,'artistas/fixture-artist-056/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (52, 57,'artistas/fixture-artist-057/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (53, 58,'artistas/fixture-artist-058/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (54, 59,'artistas/fixture-artist-059/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (55, 60,'artistas/fixture-artist-060/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (56, 61,'artistas/fixture-artist-061/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (57, 62,'artistas/fixture-artist-062/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (58, 63,'artistas/fixture-artist-063/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (59, 64,'artistas/fixture-artist-064/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (60, 65,'artistas/fixture-artist-065/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (61, 66,'artistas/fixture-artist-066/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (62, 67,'artistas/fixture-artist-067/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (63, 68,'artistas/fixture-artist-068/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (64, 69,'artistas/fixture-artist-069/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_imagen (id, artista_id, imagen_url, tipo, orden, metadata, created_at, updated_at, deleted_at, imagen_version)
VALUES (65, 70,'artistas/fixture-artist-070/avatar-123456789.webp', 'avatar', 1, '{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}', '2026-01-20 03:39:08', '2026-01-20 03:39:08', NULL, '123456789');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (22, 21,'Fixture Former Alias 021','history-021@example.invalid','{"profile":"https://example.invalid/history-021"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (23, 22,'Fixture Former Alias 022','history-022@example.invalid','{"profile":"https://example.invalid/history-022"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (24, 23,'Fixture Former Alias 023','history-023@example.invalid','{"profile":"https://example.invalid/history-023"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (25, 24,'Fixture Former Alias 024','history-024@example.invalid','{"profile":"https://example.invalid/history-024"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (26, 25,'Fixture Former Alias 025','history-025@example.invalid','{"profile":"https://example.invalid/history-025"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (27, 26,'Fixture Former Alias 026','history-026@example.invalid','{"profile":"https://example.invalid/history-026"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (28, 27,'Fixture Former Alias 027','history-027@example.invalid','{"profile":"https://example.invalid/history-027"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (29, 28,'Fixture Former Alias 028','history-028@example.invalid','{"profile":"https://example.invalid/history-028"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (30, 29,'Fixture Former Alias 029','history-029@example.invalid','{"profile":"https://example.invalid/history-029"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (31, 30,'Fixture Former Alias 030','history-030@example.invalid','{"profile":"https://example.invalid/history-030"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (32, 31,'Fixture Former Alias 031','history-031@example.invalid','{"profile":"https://example.invalid/history-031"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (33, 32,'Fixture Former Alias 032','history-032@example.invalid','{"profile":"https://example.invalid/history-032"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (34, 33,'Fixture Former Alias 033','history-033@example.invalid','{"profile":"https://example.invalid/history-033"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (35, 34,'Fixture Former Alias 034','history-034@example.invalid','{"profile":"https://example.invalid/history-034"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (36, 35,'Fixture Former Alias 035','history-035@example.invalid','{"profile":"https://example.invalid/history-035"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (37, 36,'Fixture Former Alias 036','history-036@example.invalid','{"profile":"https://example.invalid/history-036"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (38, 37,'Fixture Former Alias 037','history-037@example.invalid','{"profile":"https://example.invalid/history-037"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (39, 38,'Fixture Former Alias 038','history-038@example.invalid','{"profile":"https://example.invalid/history-038"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (40, 39,'Fixture Former Alias 039','history-039@example.invalid','{"profile":"https://example.invalid/history-039"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (41, 40,'Fixture Former Alias 040','history-040@example.invalid','{"profile":"https://example.invalid/history-040"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (42, 41,'Fixture Former Alias 041','history-041@example.invalid','{"profile":"https://example.invalid/history-041"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (43, 42,'Fixture Former Alias 042','history-042@example.invalid','{"profile":"https://example.invalid/history-042"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (44, 43,'Fixture Former Alias 043','history-043@example.invalid','{"profile":"https://example.invalid/history-043"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (45, 44,'Fixture Former Alias 044','history-044@example.invalid','{"profile":"https://example.invalid/history-044"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (46, 45,'Fixture Former Alias 045','history-045@example.invalid','{"profile":"https://example.invalid/history-045"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (47, 46,'Fixture Former Alias 046','history-046@example.invalid','{"profile":"https://example.invalid/history-046"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (48, 47,'Fixture Former Alias 047','history-047@example.invalid','{"profile":"https://example.invalid/history-047"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (49, 48,'Fixture Former Alias 048','history-048@example.invalid','{"profile":"https://example.invalid/history-048"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (50, 49,'Fixture Former Alias 049','history-049@example.invalid','{"profile":"https://example.invalid/history-049"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (51, 50,'Fixture Former Alias 050','history-050@example.invalid','{"profile":"https://example.invalid/history-050"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (52, 51,'Fixture Former Alias 051','history-051@example.invalid','{"profile":"https://example.invalid/history-051"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (53, 52,'Fixture Former Alias 052','history-052@example.invalid','{"profile":"https://example.invalid/history-052"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (54, 53,'Fixture Former Alias 053','history-053@example.invalid','{"profile":"https://example.invalid/history-053"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (55, 54,'Fixture Former Alias 054','history-054@example.invalid','{"profile":"https://example.invalid/history-054"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (56, 55,'Fixture Former Alias 055','history-055@example.invalid','{"profile":"https://example.invalid/history-055"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (57, 56,'Fixture Former Alias 056','history-056@example.invalid','{"profile":"https://example.invalid/history-056"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (58, 57,'Fixture Former Alias 057','history-057@example.invalid','{"profile":"https://example.invalid/history-057"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (59, 58,'Fixture Former Alias 058','history-058@example.invalid','{"profile":"https://example.invalid/history-058"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (60, 59,'Fixture Former Alias 059','history-059@example.invalid','{"profile":"https://example.invalid/history-059"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (61, 60,'Fixture Former Alias 060','history-060@example.invalid','{"profile":"https://example.invalid/history-060"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (62, 61,'Fixture Former Alias 061','history-061@example.invalid','{"profile":"https://example.invalid/history-061"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (63, 62,'Fixture Former Alias 062','history-062@example.invalid','{"profile":"https://example.invalid/history-062"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (64, 63,'Fixture Former Alias 063','history-063@example.invalid','{"profile":"https://example.invalid/history-063"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (65, 64,'Fixture Former Alias 064','history-064@example.invalid','{"profile":"https://example.invalid/history-064"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (66, 65,'Fixture Former Alias 065','history-065@example.invalid','{"profile":"https://example.invalid/history-065"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (67, 66,'Fixture Former Alias 066','history-066@example.invalid','{"profile":"https://example.invalid/history-066"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (68, 67,'Fixture Former Alias 067','history-067@example.invalid','{"profile":"https://example.invalid/history-067"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (69, 68,'Fixture Former Alias 068','history-068@example.invalid','{"profile":"https://example.invalid/history-068"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (70, 69,'Fixture Former Alias 069','history-069@example.invalid','{"profile":"https://example.invalid/history-069"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO artista_historial (id, artista_id, pseudonimo, correo, rrss, ciudad, pais, orden, created_at, notas) VALUES (71, 70,'Fixture Former Alias 070','history-070@example.invalid','{"profile":"https://example.invalid/history-070"}','Fixture City','ZZ', 1, '2026-01-20 03:39:14','Synthetic prior-identity fixture record');
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (16, 21, 'a16', 0, 1,'Synthetic portfolio description for fixture artist 021.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (17, 22, 'a17', 0, 1,'Synthetic portfolio description for fixture artist 022.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (18, 23, 'a18', 0, 1,'Synthetic portfolio description for fixture artist 023.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (19, 24, 'a19', 0, 1,'Synthetic portfolio description for fixture artist 024.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (20, 25, 'a20', 0, 1,'Synthetic portfolio description for fixture artist 025.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (21, 26, 'a21', 0, 1,'Synthetic portfolio description for fixture artist 026.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (22, 27, 'a22', 0, 1,'Synthetic portfolio description for fixture artist 027.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (23, 28, 'a23', 0, 1,'Synthetic portfolio description for fixture artist 028.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (24, 29, 'a24', 0, 1,'Synthetic portfolio description for fixture artist 029.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (25, 30, 'a25', 0, 1,'Synthetic portfolio description for fixture artist 030.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (26, 31, 'a26', 0, 1,'Synthetic portfolio description for fixture artist 031.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (27, 32, 'a27', 0, 1,'Synthetic portfolio description for fixture artist 032.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (28, 33, 'a28', 0, 1,'Synthetic portfolio description for fixture artist 033.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (29, 34, 'a29', 0, 1,'Synthetic portfolio description for fixture artist 034.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (30, 35, 'a30', 0, 1,'Synthetic portfolio description for fixture artist 035.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (31, 36, 'a31', 0, 1,'Synthetic portfolio description for fixture artist 036.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (32, 37, 'a32', 0, 1,'Synthetic portfolio description for fixture artist 037.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (33, 38, 'a33', 0, 1,'Synthetic portfolio description for fixture artist 038.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (34, 39, 'a34', 0, 1,'Synthetic portfolio description for fixture artist 039.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (35, 40, 'a35', 0, 1,'Synthetic portfolio description for fixture artist 040.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (36, 41, 'a36', 0, 1,'Synthetic portfolio description for fixture artist 041.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (37, 42, 'a37', 0, 1,'Synthetic portfolio description for fixture artist 042.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO catalogo_artista (id, artista_id, orden, destacado, activo, descripcion, created_at, updated_at, deleted_at)
VALUES (38, 43, 'a38', 0, 1,'Synthetic portfolio description for fixture artist 043.', '2026-01-20 03:39:11', '2026-06-03 04:49:25', NULL);
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (3, 1,'Festival Fixture Edition 03', 'III', 'frijol-magico-iii', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (4, 1,'Festival Fixture Edition 04', 'IV', 'frijol-magico-iv', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (5, 1,'Festival Fixture Edition 05', 'V', 'frijol-magico-v', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (6, 1,'Festival Fixture Edition 06', 'VI', 'frijol-magico-vi', 'festivales/frijol-magico/ii/afiche-123456789.webp', 'festivales/frijol-magico/ii/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
INSERT INTO evento_edicion (id, evento_id, nombre, numero_edicion, slug, poster_url, poster_path, poster_version, published, created_at, updated_at)
VALUES (7, 1,'Festival Fixture Edition 07', 'VII','temp', 'festivales/frijol-magico/i/afiche-123456789.webp', 'festivales/frijol-magico/i/afiche-123456789.webp', '123456789', 1, '2026-01-20 03:38:55', '2026-01-20 03:38:55');
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
VALUES (10, 10,'Fixture Activity 010','Synthetic activity description for test data.', 45, '17:00','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
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
VALUES (11, 11,'Fixture Activity 011','Synthetic activity description for test data.', 90, '18:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (9, 11, '2019-02-24', '18:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (28, 4, 8, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (22, 28, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
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
VALUES (12, 12,'Fixture Activity 012','Synthetic activity description for test data.', 120, '11:00','Fixture Venue', 15, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (10, 12, '2021-02-27', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (34, 5, 14, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (27, 34, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (35, 5, 15, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (28, 35, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (36, 6, 1, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (29, 36, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (13, 36, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (13, 13,'Fixture Activity 013','Synthetic activity description for test data.', 90, '12:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (11, 13, '2024-04-20', '12:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (37, 6, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (30, 37, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (38, 6, 16, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (31, 38, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (39, 6, 17, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (32, 39, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (14, 39, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (14, 14,'Fixture Activity 014','Synthetic activity description for test data.', 45, '14:00','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
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
VALUES (15, 15,'Fixture Activity 015','Synthetic activity description for test data.', 90, '15:30','Fixture Venue', 15, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
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
VALUES (16, 16,'Fixture Activity 016','Synthetic activity description for test data.', 60, '12:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes, url)
VALUES (14, 16, '2026-10-09', '12:30', 60, 'https://example.org/taller-activo-2026-10-09');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (47, 7, 2, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (38, 47, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (17, 47, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (17, 17,'Fixture Activity 017','Synthetic activity description for test data.', 90, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (15, 17, '2026-10-10', '11:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (48, 7, 3, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (39, 48, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (18, 48, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (18, 18,'Fixture Activity 018','Synthetic activity description for test data.', 120, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (16, 18, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (49, 7, 4, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (40, 49, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (19, 49, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (19, 19,'Fixture Activity 019','Synthetic activity description for test data.', 60, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (17, 19, '2026-10-10', '11:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (50, 7, 5, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (41, 50, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (20, 50, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (20, 20,'Fixture Activity 020','Synthetic activity description for test data.', 90, '15:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (18, 20, '2026-10-09', '15:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (51, 7, 6, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (42, 51, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (21, 51, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (21, 21,'Fixture Activity 021','Synthetic activity description for test data.', 120, '12:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (19, 21, '2026-10-10', '12:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (52, 7, 7, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (43, 52, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (22, 52, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (22, 22,'Fixture Activity 022','Synthetic activity description for test data.', 60, '15:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (20, 22, '2026-10-09', '15:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (53, 7, 8, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (44, 53, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (23, 53, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (23, 23,'Fixture Activity 023','Synthetic activity description for test data.', 90, '12:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (21, 23, '2026-10-10', '12:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (54, 7, 9, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (45, 54, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (24, 54, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (24, 24,'Fixture Activity 024','Synthetic activity description for test data.', 120, '13:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (22, 24, '2026-10-09', '13:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (55, 7, 10, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (46, 55, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (25, 55, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (25, 25,'Fixture Activity 025','Synthetic activity description for test data.', 60, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (23, 25, '2026-10-10', '11:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (56, 7, 11, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (47, 56, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (26, 56, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (26, 26,'Fixture Activity 026','Synthetic activity description for test data.', 90, '16:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (24, 26, '2026-10-09', '16:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (57, 7, 12, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (48, 57, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (27, 57, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (27, 27,'Fixture Activity 027','Synthetic activity description for test data.', 120, '13:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (25, 27, '2026-10-10', '13:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (58, 7, 13, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (49, 58, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (28, 58, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (28, 28,'Fixture Activity 028','Synthetic activity description for test data.', 60, '16:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (26, 28, '2026-10-09', '16:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (59, 7, 14, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (50, 59, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (29, 59, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (29, 29,'Fixture Activity 029','Synthetic activity description for test data.', 90, '12:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (27, 29, '2026-10-10', '12:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (60, 7, 15, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (51, 60, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (30, 60, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (30, 30,'Fixture Activity 030','Synthetic activity description for test data.', 120, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (28, 30, '2026-10-09', '11:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (61, 7, 16, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (52, 61, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (31, 61, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (31, 31,'Fixture Activity 031','Synthetic activity description for test data.', 60, '15:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (29, 31, '2026-10-10', '15:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (62, 7, 17, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (53, 62, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (32, 62, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (32, 32,'Fixture Activity 032','Synthetic activity description for test data.', 90, '11:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (30, 32, '2026-10-09', '11:00', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (63, 7, 18, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (54, 63, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (33, 63, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (33, 33,'Fixture Activity 033','Synthetic activity description for test data.', 120, '13:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (31, 33, '2026-10-10', '13:30', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (64, 7, 19, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (55, 64, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (34, 64, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (34, 34,'Fixture Activity 034','Synthetic activity description for test data.', 60, '17:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (32, 34, '2026-10-09', '17:00', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (65, 7, 20, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (56, 65, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (35, 65, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (35, 35,'Fixture Activity 035','Synthetic activity description for test data.', 90, '14:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (33, 35, '2026-10-10', '14:30', 90);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (66, 7, 21, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (57, 66, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (36, 66, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (36, 36,'Fixture Activity 036','Synthetic activity description for test data.', 120, '13:00','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (34, 36, '2026-10-09', '13:00', 120);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (67, 7, 22, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (58, 67, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (37, 67, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (37, 37,'Fixture Activity 037','Synthetic activity description for test data.', 60, '15:30','Fixture Venue', 20, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (35, 37, '2026-10-10', '15:30', 60);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (68, 7, 23, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (59, 68, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (38, 68, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (38, 38,'Fixture Activity 038','Synthetic activity description for test data.', 45, '13:30','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (36, 38, '2026-10-09', '13:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (69, 7, 24, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (60, 69, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (39, 69, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (39, 39,'Fixture Activity 039','Synthetic activity description for test data.', 45, '16:00','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (37, 39, '2026-10-10', '16:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (70, 7, 25, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (61, 70, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (40, 70, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (40, 40,'Fixture Activity 040','Synthetic activity description for test data.', 45, '14:15','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (38, 40, '2026-10-09', '14:15', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (71, 7, 26, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (62, 71, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (41, 71, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (41, 41,'Fixture Activity 041','Synthetic activity description for test data.', 45, '16:30','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (39, 41, '2026-10-10', '16:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (72, 7, 27, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (63, 72, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (42, 72, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (42, 42,'Fixture Activity 042','Synthetic activity description for test data.', 45, '15:00','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (40, 42, '2026-10-09', '15:00', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (73, 7, 28, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (64, 73, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (43, 73, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (43, 43,'Fixture Activity 043','Synthetic activity description for test data.', 45, '16:30','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (41, 43, '2026-10-10', '16:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (74, 7, 29, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (65, 74, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (44, 74, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (44, 44,'Fixture Activity 044','Synthetic activity description for test data.', 45, '15:45','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (42, 44, '2026-10-09', '15:45', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (75, 7, 30, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (66, 75, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (45, 75, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (45, 45,'Fixture Activity 045','Synthetic activity description for test data.', 45, '16:45','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (43, 45, '2026-10-10', '16:45', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (76, 7, 31, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (67, 76, 1, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (46, 76, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (46, 46,'Fixture Activity 046','Synthetic activity description for test data.', 45, '16:30','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (44, 46, '2026-10-09', '16:30', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (77, 7, 32, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (68, 77, 1, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (47, 77, 2, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (47, 47,'Fixture Activity 047','Synthetic activity description for test data.', 45, '17:15','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (45, 47, '2026-10-10', '17:15', 45);
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (78, 7, 33, NULL, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (69, 78, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (48, 78, 2, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (48, 48,'Fixture Activity 048','Synthetic activity description for test data.', 45, '17:15','Fixture Venue', NULL, '2026-07-04 04:18:40', '2026-07-04 04:18:40');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (46, 48, '2026-10-09', '17:15', 45);
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
VALUES (103, 7, NULL, 2, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (94, 103, 2, NULL, 1, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (104, 7, NULL, 1, NULL, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (95, 104, 3, NULL, 2, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO participacion_edicion (id, edicion_id, artista_id, agrupacion_id, banda_id, notas, created_at, updated_at)
VALUES (105, 7, NULL, NULL, 1, NULL, '2026-01-20 03:39:14', '2026-03-05 23:48:56');
INSERT INTO participacion_exposicion (id, participacion_id, disciplina_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (96, 105, 1, NULL, 3, NULL, 'completado', NULL, '2026-03-05 23:48:56', '2026-03-05 23:48:56');
INSERT INTO activity_registration (id, participation_activity_id, url, start_at, end_at)
VALUES (2, 16,'https://example.invalid/registration-002', '2026-09-01T00:00:00.000Z', '3000-12-31T23:59:59.000Z');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (47, 5, '2017-02-25', NULL, NULL);
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (48, 6, '2017-04-22', NULL, NULL);
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (49, 7, '2017-02-25', NULL, NULL);
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (50, 8, '2017-04-22', NULL, NULL);
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (51, 9, '2017-04-22', NULL, NULL);
INSERT INTO participacion_actividad (id, participacion_id, tipo_actividad_id, postulacion_id, modo_ingreso_id, puntaje, estado, notas, created_at, updated_at)
VALUES (49, 7, 3, NULL, 2, NULL, 'completado','Synthetic role fixture 049.', '2026-03-05 23:48:59', '2026-03-05 23:48:59');
INSERT INTO actividad (id, participacion_actividad_id, titulo, descripcion, duracion_minutos, hora_inicio, ubicacion, cupos, created_at, updated_at)
VALUES (49, 49,'Fixture Activity 049','Synthetic activity description for test data.', NULL, NULL,'Fixture Venue', NULL, '2026-07-04 04:18:49', '2026-07-04 04:18:49');
INSERT INTO activity_occurrence (id, activity_id, date, start_time, duration_minutes)
VALUES (52, 49, '2017-02-25', NULL, NULL);
