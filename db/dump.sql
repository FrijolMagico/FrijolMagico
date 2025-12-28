PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS organizacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    mision TEXT,
    vision TEXT
, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT INTO organizacion VALUES(1,'Asociación Cultural Frijol Mágico','La Asociación Cultural Frijol Mágico es una corporación cultural sin fines de lucro, que desde el 2015, se enfoca su quehacer en el desarrollo de la ilustración, la Narrativa Gráfica, el Diseño y la Animación como disciplinas artísticas y potenciales creativos en la Región de Coquimbo, generando instancias de difusión, programación de actividades culturales, articulación entre artistas e instituciones privadas o públicas, con el fin de ser una plataforma de representación que profesionalice la labor de ilustradores e ilustradoras del territorio.','Nuestra misión es fomentar y promover las expresiones artístico - culturales relacionadas con el quehacer de disciplinas como la Ilustración, la Narrativa Gráfica, el Diseño y la Animación que se desarrollan en la Región de Coquimbo, a través de la realización de actividades que fomenten las economías creativas relacionadas con estas disciplinas, instancias de difusión, formación y la construcción de un ecosistema creativo de participación, vinculación y respeto, con el fin de enriquecer la comunidad del territorio y estimular el diálogo cultural.','Nuestra visión es ser un motor y un referente a nivel local, nacional e internacional que impulse y fortalezca a los artistas que forman parte de nuestro quehacer, generando nuevas oportunidades dentro de las economías creativas. Buscamos que su trabajo en las artes gráficas sea sustentable y sostenible, ampliando sus posibilidades laborales y proyectando su obra hacia otros territorios del país y mercados internacionales.','2025-12-25 05:13:08','2025-12-25 05:13:08');
CREATE TABLE IF NOT EXISTS organizacion_equipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    cargo TEXT,
    rrss TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_org_equipo_organizacion FOREIGN KEY (organizacion_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, slug TEXT,
    CONSTRAINT fk_evento_organizacion FOREIGN KEY (organizacion_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
);
INSERT INTO evento VALUES(1,1,'Festival Frijol Mágico','Frijol Mágico es un espacio que reúne a las y los Ilustradores de la Región de Coquimbo, generando distintas instancias que ayuden a potenciar su trabajo.','2025-12-25 17:15:49','2025-12-26 15:21:42','frijol-magico');
INSERT INTO evento VALUES(2,1,'Ilustradores en Benders',NULL,'2025-12-26 15:59:11','2025-12-26 15:59:11','ilustra-benders');
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
, created_at TEXT, updated_at TEXT);
INSERT INTO disciplina VALUES(1,'Ilustración','2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO disciplina VALUES(2,'Narrativa gráfica','2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO disciplina VALUES(3,'Manualidades','2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO disciplina VALUES(4,'Fotografía','2025-12-25 05:11:50','2025-12-25 05:11:50');
CREATE TABLE IF NOT EXISTS artista_imagen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    imagen_url TEXT NOT NULL,
    tipo TEXT,
    orden INTEGER,
    metadata TEXT, created_at TEXT, updated_at TEXT,
    CONSTRAINT fk_artista_imagen_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE
);
INSERT INTO artista_imagen VALUES(1,25,'artistas/acekuros/avatar.webp','avatar',1,'{"width":800,"height":800,"size":66372,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:11:57','2025-12-26 05:11:57');
INSERT INTO artista_imagen VALUES(2,18,'artistas/aderezo/avatar.webp','avatar',1,'{"width":800,"height":800,"size":59264,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:11:57','2025-12-26 05:11:57');
INSERT INTO artista_imagen VALUES(3,47,'artistas/alkimia/avatar.webp','avatar',1,'{"width":800,"height":800,"size":89436,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:11:58','2025-12-26 05:11:58');
INSERT INTO artista_imagen VALUES(4,1,'artistas/anima-red/avatar.webp','avatar',1,'{"width":800,"height":800,"size":121246,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:11:59','2025-12-26 05:11:59');
INSERT INTO artista_imagen VALUES(5,58,'artistas/arcanista-draws/avatar.webp','avatar',1,'{"width":800,"height":800,"size":107548,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:11:59','2025-12-26 05:11:59');
INSERT INTO artista_imagen VALUES(6,32,'artistas/astro-glitter/avatar.webp','avatar',1,'{"width":800,"height":800,"size":70512,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:00','2025-12-26 05:12:00');
INSERT INTO artista_imagen VALUES(7,57,'artistas/bekzar/avatar.webp','avatar',1,'{"width":800,"height":800,"size":37958,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:01','2025-12-26 05:12:01');
INSERT INTO artista_imagen VALUES(8,52,'artistas/blanquis/avatar.webp','avatar',1,'{"width":800,"height":800,"size":137494,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:01','2025-12-26 05:12:01');
INSERT INTO artista_imagen VALUES(9,50,'artistas/bolbaran-comics/avatar.webp','avatar',1,'{"width":800,"height":800,"size":110228,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:02','2025-12-26 05:12:02');
INSERT INTO artista_imagen VALUES(10,34,'artistas/camellia-liz/avatar.webp','avatar',1,'{"width":800,"height":800,"size":52510,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:03','2025-12-26 05:12:03');
INSERT INTO artista_imagen VALUES(11,31,'artistas/camila-guaman/avatar.webp','avatar',1,'{"width":800,"height":800,"size":71800,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:03','2025-12-26 05:12:03');
INSERT INTO artista_imagen VALUES(12,13,'artistas/canela/avatar.webp','avatar',1,'{"width":800,"height":800,"size":116490,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:04','2025-12-26 05:12:04');
INSERT INTO artista_imagen VALUES(13,42,'artistas/carvajal-ilustraciones/avatar.webp','avatar',1,'{"width":800,"height":800,"size":48586,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:05','2025-12-26 05:12:05');
INSERT INTO artista_imagen VALUES(14,83,'artistas/cat-linaa-art/avatar.webp','avatar',1,'{"width":800,"height":800,"size":54396,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:06','2025-12-26 05:12:06');
INSERT INTO artista_imagen VALUES(15,6,'artistas/catana/avatar.webp','avatar',1,'{"width":800,"height":800,"size":46530,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:06','2025-12-26 05:12:06');
INSERT INTO artista_imagen VALUES(16,85,'artistas/cazar-al-tiburon/avatar.webp','avatar',1,'{"width":800,"height":800,"size":132800,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:07','2025-12-26 05:12:07');
INSERT INTO artista_imagen VALUES(17,27,'artistas/chiimewe/avatar.webp','avatar',1,'{"width":800,"height":800,"size":58420,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:08','2025-12-26 05:12:08');
INSERT INTO artista_imagen VALUES(18,37,'artistas/chilensis/avatar.webp','avatar',1,'{"width":800,"height":800,"size":50004,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:09','2025-12-26 05:12:09');
INSERT INTO artista_imagen VALUES(19,17,'artistas/ckiryuu/avatar.webp','avatar',1,'{"width":800,"height":800,"size":57792,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:09','2025-12-26 05:12:09');
INSERT INTO artista_imagen VALUES(20,82,'artistas/coticocodrila/avatar.webp','avatar',1,'{"width":800,"height":800,"size":130890,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:10','2025-12-26 05:12:10');
INSERT INTO artista_imagen VALUES(21,49,'artistas/de-cordillera/avatar.webp','avatar',1,'{"width":800,"height":800,"size":107036,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:11','2025-12-26 05:12:11');
INSERT INTO artista_imagen VALUES(22,38,'artistas/el-ale/avatar.webp','avatar',1,'{"width":800,"height":800,"size":133580,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:11','2025-12-26 05:12:11');
INSERT INTO artista_imagen VALUES(23,79,'artistas/ensimismada/avatar.webp','avatar',1,'{"width":800,"height":800,"size":65260,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:12','2025-12-26 05:12:12');
INSERT INTO artista_imagen VALUES(24,66,'artistas/flowerspower/avatar.webp','avatar',1,'{"width":800,"height":800,"size":47228,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:13','2025-12-26 05:12:13');
INSERT INTO artista_imagen VALUES(25,22,'artistas/fluchinick/avatar.webp','avatar',1,'{"width":800,"height":800,"size":45832,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:13','2025-12-26 05:12:13');
INSERT INTO artista_imagen VALUES(26,3,'artistas/fran-aerre/avatar.webp','avatar',1,'{"width":800,"height":800,"size":107008,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:14','2025-12-26 05:12:14');
INSERT INTO artista_imagen VALUES(27,59,'artistas/francisco-llimy/avatar.webp','avatar',1,'{"width":800,"height":800,"size":55364,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:15','2025-12-26 05:12:15');
INSERT INTO artista_imagen VALUES(28,41,'artistas/futuro-comics/avatar.webp','avatar',1,'{"width":800,"height":800,"size":102244,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:15','2025-12-26 05:12:15');
INSERT INTO artista_imagen VALUES(29,30,'artistas/ghostie/avatar.webp','avatar',1,'{"width":800,"height":800,"size":125548,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:16','2025-12-26 05:12:16');
INSERT INTO artista_imagen VALUES(30,14,'artistas/grabados-aleph/avatar.webp','avatar',1,'{"width":800,"height":800,"size":19358,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:17','2025-12-26 05:12:17');
INSERT INTO artista_imagen VALUES(31,35,'artistas/hanrra/avatar.webp','avatar',1,'{"width":800,"height":800,"size":189324,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:18','2025-12-26 05:12:18');
INSERT INTO artista_imagen VALUES(32,61,'artistas/ilustracion-khasumii/avatar.webp','avatar',1,'{"width":800,"height":800,"size":111208,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:18','2025-12-26 05:12:18');
INSERT INTO artista_imagen VALUES(33,76,'artistas/ilustravel/avatar.webp','avatar',1,'{"width":800,"height":800,"size":51800,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:19','2025-12-26 05:12:19');
INSERT INTO artista_imagen VALUES(34,77,'artistas/intercultural-arte/avatar.webp','avatar',1,'{"width":800,"height":800,"size":171328,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:20','2025-12-26 05:12:20');
INSERT INTO artista_imagen VALUES(35,15,'artistas/ivichu-jpg/avatar.webp','avatar',1,'{"width":800,"height":800,"size":39110,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:20','2025-12-26 05:12:20');
INSERT INTO artista_imagen VALUES(36,60,'artistas/javiiilustrations/avatar.webp','avatar',1,'{"width":800,"height":800,"size":60032,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:21','2025-12-26 05:12:21');
INSERT INTO artista_imagen VALUES(37,81,'artistas/javo-siniestro/avatar.webp','avatar',1,'{"width":800,"height":800,"size":160340,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:22','2025-12-26 05:12:22');
INSERT INTO artista_imagen VALUES(38,48,'artistas/kao-artwork/avatar.webp','avatar',1,'{"width":800,"height":800,"size":95838,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:23','2025-12-26 05:12:23');
INSERT INTO artista_imagen VALUES(39,9,'artistas/karime-simon/avatar.webp','avatar',1,'{"width":800,"height":800,"size":207118,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:23','2025-12-26 05:12:23');
INSERT INTO artista_imagen VALUES(40,24,'artistas/khyaruu/avatar.webp','avatar',1,'{"width":800,"height":800,"size":34856,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:24','2025-12-26 05:12:24');
INSERT INTO artista_imagen VALUES(41,53,'artistas/kmilu/avatar.webp','avatar',1,'{"width":800,"height":800,"size":112744,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:25','2025-12-26 05:12:25');
INSERT INTO artista_imagen VALUES(42,63,'artistas/lesbilais/avatar.webp','avatar',1,'{"width":800,"height":800,"size":53232,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:26','2025-12-26 05:12:26');
INSERT INTO artista_imagen VALUES(43,45,'artistas/mami-sita/avatar.webp','avatar',1,'{"width":800,"height":800,"size":48268,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:27','2025-12-26 05:12:27');
INSERT INTO artista_imagen VALUES(44,44,'artistas/me-pego-un-tiro/avatar.webp','avatar',1,'{"width":800,"height":800,"size":67736,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:28','2025-12-26 05:12:28');
INSERT INTO artista_imagen VALUES(45,56,'artistas/microbits/avatar.webp','avatar',1,'{"width":800,"height":800,"size":49122,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:28','2025-12-26 05:12:28');
INSERT INTO artista_imagen VALUES(46,67,'artistas/minino-nyart/avatar.webp','avatar',1,'{"width":800,"height":800,"size":126684,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:29','2025-12-26 05:12:29');
INSERT INTO artista_imagen VALUES(47,64,'artistas/myru-ann/avatar.webp','avatar',1,'{"width":800,"height":800,"size":55042,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:30','2025-12-26 05:12:30');
INSERT INTO artista_imagen VALUES(48,55,'artistas/n0tarts/avatar.webp','avatar',1,'{"width":800,"height":800,"size":31258,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:32','2025-12-26 05:12:32');
INSERT INTO artista_imagen VALUES(49,84,'artistas/namine-anami/avatar.webp','avatar',1,'{"width":800,"height":800,"size":42178,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:33','2025-12-26 05:12:33');
INSERT INTO artista_imagen VALUES(50,33,'artistas/nino-pan/avatar.webp','avatar',1,'{"width":800,"height":800,"size":88516,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:33','2025-12-26 05:12:33');
INSERT INTO artista_imagen VALUES(51,23,'artistas/noezzal/avatar.webp','avatar',1,'{"width":800,"height":800,"size":24124,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:34','2025-12-26 05:12:34');
INSERT INTO artista_imagen VALUES(52,26,'artistas/nomito/avatar.webp','avatar',1,'{"width":800,"height":800,"size":22480,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:36','2025-12-26 05:12:36');
INSERT INTO artista_imagen VALUES(53,12,'artistas/nyxandr/avatar.webp','avatar',1,'{"width":800,"height":800,"size":81562,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:37','2025-12-26 05:12:37');
INSERT INTO artista_imagen VALUES(54,16,'artistas/osamenta-en-el-jardin/avatar.webp','avatar',1,'{"width":800,"height":800,"size":195744,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:37','2025-12-26 05:12:37');
INSERT INTO artista_imagen VALUES(55,87,'artistas/p0chi-kun/avatar.webp','avatar',1,'{"width":800,"height":800,"size":45484,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:38','2025-12-26 05:12:38');
INSERT INTO artista_imagen VALUES(56,5,'artistas/p3dro/avatar.webp','avatar',1,'{"width":800,"height":800,"size":97456,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:39','2025-12-26 05:12:39');
INSERT INTO artista_imagen VALUES(57,39,'artistas/pancho-valdivia/avatar.webp','avatar',1,'{"width":800,"height":800,"size":34692,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:39','2025-12-26 05:12:39');
INSERT INTO artista_imagen VALUES(58,68,'artistas/paper-pupy/avatar.webp','avatar',1,'{"width":800,"height":800,"size":49018,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:40','2025-12-26 05:12:40');
INSERT INTO artista_imagen VALUES(59,51,'artistas/pat-trashoart/avatar.webp','avatar',1,'{"width":800,"height":800,"size":31834,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:41','2025-12-26 05:12:41');
INSERT INTO artista_imagen VALUES(60,69,'artistas/peliitos/avatar.webp','avatar',1,'{"width":800,"height":800,"size":36278,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:42','2025-12-26 05:12:42');
INSERT INTO artista_imagen VALUES(61,65,'artistas/pininati/avatar.webp','avatar',1,'{"width":800,"height":800,"size":79324,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:42','2025-12-26 05:12:42');
INSERT INTO artista_imagen VALUES(62,70,'artistas/planea-papeleria/avatar.webp','avatar',1,'{"width":800,"height":800,"size":107514,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:43','2025-12-26 05:12:43');
INSERT INTO artista_imagen VALUES(63,40,'artistas/polet-komiksu/avatar.webp','avatar',1,'{"width":540,"height":540,"size":54342,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:44','2025-12-26 05:12:44');
INSERT INTO artista_imagen VALUES(64,80,'artistas/prrr-miaow/avatar.webp','avatar',1,'{"width":800,"height":800,"size":17558,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:44','2025-12-26 05:12:44');
INSERT INTO artista_imagen VALUES(65,19,'artistas/purr-creatures/avatar.webp','avatar',1,'{"width":800,"height":800,"size":64932,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:45','2025-12-26 05:12:45');
INSERT INTO artista_imagen VALUES(66,54,'artistas/remebranzas-negras/avatar.webp','avatar',1,'{"width":800,"height":800,"size":108442,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:46','2025-12-26 05:12:46');
INSERT INTO artista_imagen VALUES(67,43,'artistas/rotten-monkey/avatar.webp','avatar',1,'{"width":800,"height":800,"size":32358,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:47','2025-12-26 05:12:47');
INSERT INTO artista_imagen VALUES(68,74,'artistas/ruvale/avatar.webp','avatar',1,'{"width":800,"height":800,"size":73008,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:48','2025-12-26 05:12:48');
INSERT INTO artista_imagen VALUES(69,36,'artistas/sakanita/avatar.webp','avatar',1,'{"width":800,"height":800,"size":102426,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:49','2025-12-26 05:12:49');
INSERT INTO artista_imagen VALUES(70,21,'artistas/saturno/avatar.webp','avatar',1,'{"width":800,"height":800,"size":60426,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:49','2025-12-26 05:12:49');
INSERT INTO artista_imagen VALUES(71,7,'artistas/seba-endless/avatar.webp','avatar',1,'{"width":800,"height":800,"size":174452,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:50','2025-12-26 05:12:50');
INSERT INTO artista_imagen VALUES(72,2,'artistas/shobian/avatar.webp','avatar',1,'{"width":800,"height":800,"size":37348,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:51','2025-12-26 05:12:51');
INSERT INTO artista_imagen VALUES(73,4,'artistas/skelly-uwu/avatar.webp','avatar',1,'{"width":800,"height":800,"size":72488,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:52','2025-12-26 05:12:52');
INSERT INTO artista_imagen VALUES(74,29,'artistas/skyderen/avatar.webp','avatar',1,'{"width":640,"height":640,"size":14358,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:52','2025-12-26 05:12:52');
INSERT INTO artista_imagen VALUES(75,71,'artistas/solid-ediciones/avatar.webp','avatar',1,'{"width":800,"height":800,"size":117696,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:53','2025-12-26 05:12:53');
INSERT INTO artista_imagen VALUES(76,46,'artistas/sra-tonks/avatar.webp','avatar',1,'{"width":800,"height":800,"size":168854,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:55','2025-12-26 05:12:55');
INSERT INTO artista_imagen VALUES(77,72,'artistas/sueno-de-pajaro/avatar.webp','avatar',1,'{"width":800,"height":800,"size":208402,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:57','2025-12-26 05:12:57');
INSERT INTO artista_imagen VALUES(78,20,'artistas/tapichin/avatar.webp','avatar',1,'{"width":800,"height":800,"size":39934,"aspectRatio":"1:1","format":"webp"}','2025-12-26 05:12:58','2025-12-26 05:12:58');
INSERT INTO artista_imagen VALUES(79,73,'artistas/tekaeme/avatar.webp','avatar',1,'{"width":800,"height":800,"size":56402,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:16','2025-12-26 13:21:16');
INSERT INTO artista_imagen VALUES(80,78,'artistas/tierramarga/avatar.webp','avatar',1,'{"width":800,"height":800,"size":73806,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:17','2025-12-26 13:21:17');
INSERT INTO artista_imagen VALUES(81,10,'artistas/uliseslo/avatar.webp','avatar',1,'{"width":800,"height":800,"size":89988,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:18','2025-12-26 13:21:18');
INSERT INTO artista_imagen VALUES(82,11,'artistas/vale-ilustra/avatar.webp','avatar',1,'{"width":800,"height":800,"size":37106,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:19','2025-12-26 13:21:19');
INSERT INTO artista_imagen VALUES(83,8,'artistas/viliz-vz/avatar.webp','avatar',1,'{"width":800,"height":800,"size":80848,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:20','2025-12-26 13:21:20');
INSERT INTO artista_imagen VALUES(84,75,'artistas/wasabipng/avatar.webp','avatar',1,'{"width":800,"height":800,"size":96082,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:21','2025-12-26 13:21:21');
INSERT INTO artista_imagen VALUES(85,62,'artistas/yatiediciones/avatar.webp','avatar',1,'{"width":800,"height":800,"size":99652,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:22','2025-12-26 13:21:22');
INSERT INTO artista_imagen VALUES(86,28,'artistas/yem/avatar.webp','avatar',1,'{"width":800,"height":800,"size":26148,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:22','2025-12-26 13:21:22');
INSERT INTO artista_imagen VALUES(87,86,'artistas/tati-san-martin/avatar.webp','avatar',1,'{"width":800,"height":800,"size":196028,"aspectRatio":"1:1","format":"webp"}','2025-12-26 13:21:33','2025-12-26 13:21:33');
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT
, correo TEXT, created_at TEXT, updated_at TEXT);
INSERT INTO agrupacion VALUES(1,'Ruvale y WasabiPNG',NULL,NULL,'2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO agrupacion VALUES(2,'Colectivo 8 Ojos','Dos ilustradoras, ocho ojos y un mundo infinito de ideas. Cat_linaa_art y p0chi_kun dibujan desde lo que son: diferentes, intensas y creativas. No creen que todo deba verse igual. Les encanta que sus diferencias se noten y se complementen, creando ilustraciones que pueden ser delicadas, potentes, dulces o explosivas… pero siempre honestas y llenas de vida.','och8jos.studio@gmail.com','2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO agrupacion VALUES(3,'Un Chincolito Me Lo Dijo',NULL,'elcorreodelchincol@gmail.com','2025-12-27 04:17:25','2025-12-27 04:17:25');
CREATE TABLE IF NOT EXISTS evento_edicion_metrica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    valor REAL,
    payload TEXT,
    fuente TEXT,
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,
    CONSTRAINT fk_metrica_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE
);
INSERT INTO evento_edicion_metrica VALUES(1,1,'participantes',27,'{"ilustracion":27,"manualidades":0,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(2,1,'bandas',6,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(3,1,'total_talleres',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(4,2,'participantes',33,'{"ilustracion":26,"manualidades":7,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(5,2,'bandas',6,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(6,2,'total_talleres',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(7,3,'participantes',39,'{"ilustracion":33,"manualidades":9,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(8,3,'bandas',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(9,3,'total_talleres',3,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(10,4,'participantes',30,'{"ilustracion":23,"manualidades":7,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(11,4,'bandas',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(12,4,'total_talleres',9,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(13,5,'participantes',50,'{"ilustracion":41,"manualidades":9,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(14,5,'bandas',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:20','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(15,5,'total_talleres',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(16,6,'participantes',40,'{"ilustracion":35,"manualidades":5,"fotografia":1,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(17,6,'bandas',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(18,6,'total_talleres',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(19,7,'participantes',39,'{"ilustracion":28,"manualidades":11,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(20,7,'bandas',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(21,7,'total_talleres',3,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(22,8,'participantes',54,'{"ilustracion":47,"manualidades":7,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(23,8,'bandas',5,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(24,8,'total_talleres',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(25,9,'participantes',51,'{"ilustracion":43,"manualidades":7,"fotografia":1,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(26,9,'bandas',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(27,9,'total_talleres',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(28,10,'participantes',50,'{"ilustracion":41,"manualidades":9,"fotografia":0,"narrativa_grafica":0}','Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(29,10,'bandas',4,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
INSERT INTO evento_edicion_metrica VALUES(30,10,'total_talleres',2,NULL,'Base de Datos - Exponentes - Festival','2025-12-25 19:11:21','datos preliminares extraídos de google sheets Base de Datos - Exponentes - Festival');
CREATE TABLE IF NOT EXISTS evento_edicion_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    generado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_snapshot_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_snapshot UNIQUE (evento_edicion_id, tipo)
);
CREATE TABLE IF NOT EXISTS evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER NOT NULL,
    nombre TEXT,
    numero_edicion TEXT NOT NULL,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, slug TEXT,
    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (evento_id)
    REFERENCES evento (id) ON DELETE CASCADE
);
INSERT INTO evento_edicion VALUES(1,1,NULL,'I','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-i.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','i');
INSERT INTO evento_edicion VALUES(2,1,'Día del Libro','II','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-ii.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','ii');
INSERT INTO evento_edicion VALUES(3,1,NULL,'III','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-iii.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','iii');
INSERT INTO evento_edicion VALUES(4,1,'En Búsqueda del Secreto del Frijol','IV','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-iv.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','iv');
INSERT INTO evento_edicion VALUES(5,1,'I Aniversario','V','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-v.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','v');
INSERT INTO evento_edicion VALUES(6,1,'Descubriendo nuevas raíces','VI','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-vi.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','vi');
INSERT INTO evento_edicion VALUES(7,1,'Recolectando Semillas','VII','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-vii.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','vii');
INSERT INTO evento_edicion VALUES(8,1,'II Aniversario','VIII','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-viii.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','viii');
INSERT INTO evento_edicion VALUES(9,1,'Frijoles con Riendas','IX','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-ix.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','ix');
INSERT INTO evento_edicion VALUES(10,1,'III Aniversario','X','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-x.webp','2025-12-25 18:32:03','2025-12-26 15:55:20','x');
INSERT INTO evento_edicion VALUES(11,2,NULL,'1','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-1.webp','2025-12-26 18:01:15','2025-12-26 18:01:15','1');
INSERT INTO evento_edicion VALUES(12,2,'Season 2','2','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-2.webp','2025-12-26 18:01:15','2025-12-26 18:01:15','2');
INSERT INTO evento_edicion VALUES(13,2,'Season 3','3','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-3.webp','2025-12-26 18:01:15','2025-12-26 18:01:15','3');
CREATE TABLE IF NOT EXISTS evento_edicion_dia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, lugar_id INTEGER REFERENCES lugar (id) ON DELETE SET NULL, modalidad TEXT NOT NULL DEFAULT 'presencial' CHECK (modalidad IN ('presencial', 'online', 'hibrido')),
    CONSTRAINT fk_evento_edicion_dia_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_evento_edicion_dia UNIQUE (evento_edicion_id, fecha)
);
INSERT INTO evento_edicion_dia VALUES(1,1,'2017-02-25','14:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(2,2,'2017-04-22','12:00','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(3,3,'2017-08-19','11:30','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(4,4,'2017-12-16','12:30','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(5,5,'2018-02-23','12:00','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(6,5,'2018-02-24','12:00','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(7,6,'2018-08-10','12:00','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(8,6,'2018-08-11','12:00','20:30','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(9,7,'2018-12-22','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(10,8,'2019-03-01','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(11,8,'2019-03-02','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(12,9,'2019-08-16','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(13,9,'2019-08-17','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(14,10,'2020-02-28','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(15,10,'2020-02-29','12:00','20:00','2025-12-25 18:32:21','2025-12-25 18:32:21',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(16,11,'2016-02-18','15:00','21:00','2025-12-26 18:01:20','2025-12-26 18:01:20',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(17,12,'2016-08-15','14:20','20:00','2025-12-26 18:01:20','2025-12-26 18:01:20',NULL,'presencial');
INSERT INTO evento_edicion_dia VALUES(18,13,'2016-10-31','14:00','20:00','2025-12-26 18:01:20','2025-12-26 18:01:20',NULL,'presencial');
CREATE TABLE IF NOT EXISTS lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT,
    coordenadas TEXT,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, ciudad TEXT,
    CONSTRAINT uq_lugar_nombre_direccion UNIQUE (nombre, direccion)
);
INSERT INTO lugar VALUES(1,'Monasterio Casa Taller','Peatonal Santo Domingo #228, La Serena','{"lat": -29.904389, "lng": -71.253670}',NULL,'2025-12-26 15:00:04','2025-12-26 15:00:04',NULL);
INSERT INTO lugar VALUES(2,'Centro Cultural Santa Inés','Almagro #232, La Serena','{"lat": -29.898163, "lng": -71.252212}',NULL,'2025-12-26 15:00:04','2025-12-26 15:00:04',NULL);
INSERT INTO lugar VALUES(3,'Bender''s Games','Lautaro #856, La Serena','{"lat": -29.90528, "lng": -71.24533}',NULL,'2025-12-26 17:41:12','2025-12-26 17:41:12',NULL);
CREATE TABLE IF NOT EXISTS catalogo_artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL UNIQUE,
    orden TEXT NOT NULL,
    destacado INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, descripcion TEXT,
    CONSTRAINT fk_catalogo_artista FOREIGN KEY (artista_id)
        REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT chk_catalogo_artista_destacado CHECK (destacado IN (0, 1)),
    CONSTRAINT chk_catalogo_artista_activo CHECK (activo IN (0, 1))
);
INSERT INTO catalogo_artista VALUES(1,1,'a0',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Lic. en arquitectura, ilustradora y artista visual chilena.\nDesarrolla trabajos con temáticas relacionadas a la fantasía y la naturaleza, enfocándose en ilustrar y diseñar en torno a la creación de personajes originales y criaturas imaginarias, sus medios principales tradicionales artísticos son la acuarela, el grafito y los lápices de colores','\n',char(10)));
INSERT INTO catalogo_artista VALUES(2,2,'a1',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Shobian, diseñadora gráfica de profesión e ilustradora autodidacta, se caracteriza por utilizar texturas análogas en la ilustración digital, aportando calidez a sus obras que retratan naturaleza y elementos de la vida cotidiana. Ha estado presente en diversos eventos de ilustración, destacando previas versiones del Festival Frijol Mágico y Festival ARC.');
INSERT INTO catalogo_artista VALUES(3,3,'a2',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Artista regional que busca representar la expresividad de los animales, la belleza de la naturaleza y la cotidianidad de lo que la rodea, por medio de una pincelada segura pero dinámica. Sus técnicas predilectas son el óleo y el medio digital.');
INSERT INTO catalogo_artista VALUES(4,4,'a3',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola! Soy Josefa Aguilera, Ilustradora y artista de videojuegos, tengo 27 años y dibujo con motivación desde los 14. Adoro crear personajes con trasfondos interesantes inspirados en la cultura Chilena y Asiática, siempre esperando generar un impacto a nivel emocional y espiritual, actualmente soy freelancer y estoy dibujando un manga "Si el río suena es porque piedras trae." 川石の音 (Kawaishi no oto) el cual está basado en las mencionadas culturas. He trabajado también para diversas compañías de videojuegos internacionales y participado en ferias de arte a lo largo del país. ¡Espero que disfrutes mucho mi trabajo!');
INSERT INTO catalogo_artista VALUES(5,5,'a4',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi trabajo principalmente consiste en dibujos tradicionales coloreados con lápices de colores escolares. Abordo tópicos como el anime, videojuegos, series animadas y películas de horror. También realizo pequeños cuadros inspirados en la flora y monumentos típicos de la cuarta región de Coquimbo hechos con lápices acuarelables.');
INSERT INTO catalogo_artista VALUES(6,6,'a5',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi arte mezcla elementos provenientes de una biografía personal, desde el paisaje regional y la cultura popular de la generación millenial. Mis creaciones reflejan la manera en que habito el territorio, me inspira el patrimonio natural y urbano, los espacios de convivencia y la riqueza de la cotidianeidad.');
INSERT INTO catalogo_artista VALUES(7,7,'a6',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola! Mi nombre es Seba Endless, diseñador gráfico e ilustrador, actualmente estudiando licenciatura en artes visuales. Mi trabajo se basa en ilustraciones y pinturas digitales de colores vibrantes y saturados, todos en diversas temáticas como: fanart de series, videojuegos, comic, manga, anime y mi obra original.');
INSERT INTO catalogo_artista VALUES(8,8,'a7',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Trabajos con xilografia, materiales gráficos, plasmando formas y estilos más naturales y organicos, además de plasmar mi caracter interno  y de lo que me rodea en ilustraciones variadas, tambien vendo yogurt congelado yo le llamo congurt.');
INSERT INTO catalogo_artista VALUES(9,9,'a8',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Trauerkult, que significa "culto al luto", representa plenamente el concepto de mi obra, en la cual la muerte se manifiesta en todas sus formas y escenarios, a partir de minuciosos puntos, luces y sombras.');
INSERT INTO catalogo_artista VALUES(10,10,'a9',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Enfocado en la ilustración y las técnicas graficas artesanales, realizo series de imágenes que muestran diversos aspectos del entorno de la cuarta region, desde la naturaleza hasta temas sociales, generando relatos en diversos soportes como papel, textil, cerámica y objetos editoriales.');
INSERT INTO catalogo_artista VALUES(11,11,'aA',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola, soy Vale ilustra y me complace presentar mi trabajo como ilustradora ,me inspiro principalmente en la moda coreana, japonesa  o contemporánea en general fusionando lo con un toque cute o kawaii. Utilizo principalmente el dibujo digital como metodología lo que me permite resaltar mejor los colores y detalles.');
INSERT INTO catalogo_artista VALUES(12,12,'aB',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hago una mezcla de fanarts, personajes propios e historias, explorando tanto lo tierno como lo oscuro. Mi arte refleja la dualidad de lo dulce y lo místico.');
INSERT INTO catalogo_artista VALUES(13,13,'aC',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola! Soy Canela, ilustradora desde temprana edad con una pasión por el arte y la creatividad. En la actualidad, me concentro en comisiones y proyectos diversos, y también me encanta explorar la creación de contenido variado, como streams y mercancía. Mi estilo se caracteriza por ser tierno y colorido, pero me adapto a diferentes enfoques según tus necesidades :D!');
INSERT INTO catalogo_artista VALUES(14,14,'aD',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Grabados Aleph básicamente está enfocado en la linografía y todo lo que tenga que ver con grabado. Mi trabajo abarca todo el proceso desde diseño, carvado e impresión de una linografía. En cuanto a las ilustraciones en si, son todos diseños originales y su temática abarca distintos ámbitos: desde animales y flores hasta referencias a clásicos de la literatura.');
INSERT INTO catalogo_artista VALUES(15,15,'aE',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Buenas! Soy IviChu.jpg, una chica que se expresa a través de ilustraciones vivas. Mi trabajo destaca personajes dinámicos y explora emociones, fantasía y relaciones, con un estilo único. dibujo capturando momentos que cuentas historias. ¡Acompáñame en este viaje artístico!');
INSERT INTO catalogo_artista VALUES(16,16,'aF',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi trabajo se basa en crear dibujos y pinturas con una temática a la que me gusta llamar "fantasía macabra", para esto uso conceptos que me permitan crear una atmósfera oscura, tomando un estilo influenciado por la ilustración de libros antiguos y películas de terror.');
INSERT INTO catalogo_artista VALUES(17,17,'aG',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola! ¡Soy Kiryuu! Mi trabajo se caracteriza por la búsqueda de la expresividad y la interpretación, ya sea mediante el humor ligero, o, en contraste, en trabajos de temas más oscuros o nostálgicos. Siento mucha pasión por el storytelling, actualmente desarrollándome en el área de la animación y storyboard.');
INSERT INTO catalogo_artista VALUES(18,18,'aH',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola! Soy Aderezo, ilustrador digital, Mi estilo se basa en el animé, pero con un toque personal. con mis obras busco plasmar escenas como si de fotos se tratasen, tratando generalmente que mis trabajos cuenten una historia, por muy pequeña que sea. Eso sería todo, ¡Espero les guste mi trabajo!');
INSERT INTO catalogo_artista VALUES(19,19,'aI',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¿Cómo sería el mundo si los gatos fueran los más evolucionados? Purr Creatures aborda esta pregunta a través de personajes que combinan la figura de la mujer y los felinos. Destacando distintos rasgos de sus personalidades e incorporando un toque de humor gráfico.');
INSERT INTO catalogo_artista VALUES(20,20,'aJ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Tachipin se enfoca en ilustraciones y proyectos artísticos basados en una estética retro-futurista-surrealista, con inspiración en la animación occidental y oriental, que tratan de apelar al sentimiento de nostalgia, tomando inspiraciones de movimientos estéticos relevantes para las generaciones millennial y Z, reinterpretando personajes ya existentes, y generando historias que reflejan el vacío y la complejidad de las emociones humanas.');
INSERT INTO catalogo_artista VALUES(21,21,'aK',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Saturno, soy diseñadora gráfica e ilustradora autodidacta, me caracterizo por utilizar colores muy llamativos en mis ilustraciones y por tener stickers chistosos. También me dedico a crear diseños únicos en cerámica como llaveros, imanes, platos, espejos, ceniceros, figuras, porta velas, entre otros. Trato siempre de tener diseños nuevos y creativos.');
INSERT INTO catalogo_artista VALUES(22,22,'aL',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Constanza Toro, alias Fluchinick, ilustradora y estudiante de Diseño Digital. Mi trabajo destaca por la representación de animales antropomórficos usando colores saturados, tonos pasteles y destellos vibrantes, fusionando ternura, amor y comedia. Actualmente, exploró el universo Steampunk con mis propios personajes, también expresando mis gustos hacia las caricaturas manteniendo mi estilo.');
INSERT INTO catalogo_artista VALUES(23,23,'aM',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi trabajo se enfoca principalmente al desarrollo de obras ligadas al fan-art de series, animes, películas, videojuegos y gran parte del mundo geek, en general cosas que me gustan y me llaman la atención. Por otra parte, realizo obras que tienen que ver con el surrealismo y con la exploración del sentir humano, siendo un trabajo personal pero a la vez, algo que pueda conectar de forma directa con el espectador.');
INSERT INTO catalogo_artista VALUES(24,24,'aN',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola soy Khyaruu, Ilustradora freelancer amante de los conejitos, de todo lo rosita y kawaii. Mi especialidad es la ilustración digital en un estilo chibi, trabajando pedidos de ilustraciones personalizadas, emotes para redes sociales y ahora, finalmente merch!');
INSERT INTO catalogo_artista VALUES(25,25,'aO',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi nombre es Alexis Cepeda Esquivel alias Acekuros, me denomino como dibujante de la ciudad de La Serena. En mis obras trato de capturar momentos cotidianos como también destacar la biodiversidad de la región de Coquimbo, me esfuerzo en transmitir historias que conecten con el pasado y el presente, destacando la identidad cultural y el patrimonio natural en mi propio estilo.');
INSERT INTO catalogo_artista VALUES(26,26,'aP',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('La mayoría de mi arte solo son dibujos de algun personaje que creo para serie, juego o anime.\nSuelo poner creativo en mis dibujos y experimentar con cosas nuevas en mis ilustraciones \nYa sea luces, sombras o lineart','\n',char(10)));
INSERT INTO catalogo_artista VALUES(27,27,'aQ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy chiimewe, ilustrador de La Serena que se dedica a hacer arte creado a partir de la imaginación e inspirado en lo tierno y lo colorido. Creando personajes y criaturas constantemente usando lo tradicional y lo digital al mismo tiempo.');
INSERT INTO catalogo_artista VALUES(28,28,'aR',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola soy Yem, un ilustrador digital, principalmente de personajes originales, aunque también disfruto haciendo fanarts de vez en cuando. Mi objetivo es que mi arte alcance un mayor reconocimiento y conecte con más personas a través de lo que hago.');
INSERT INTO catalogo_artista VALUES(29,29,'aS',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola me presento soy Skyderen mi trabajo consiste en ilustraciones que exploran la creatividad y la imaginación tratando de que la ilustración sea uno lleno de color, textura y emoción. Mi enfoque se centra en el estilo artístico del cartoon, anime, los comics y un poco el de los videojuegos.');
INSERT INTO catalogo_artista VALUES(30,30,'aT',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Ghostie, un ilustrador que crear fanarts de personajes de Marvel, series icónicas como Hannibal, The Walking Dead y Breaking Bad, así como también de músicos legendarios como The Beatles y Guns N'' Roses. Ofrezco prints, chapitas, stickers y llaveros de mis obras, compartiendo así mi arte con los demás.');
INSERT INTO catalogo_artista VALUES(31,31,'aU',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Ilustradora naturalista, egresada de arquitectura. Enfoco mi trabajo en la naturaleza, arte y territorio a través de técnicas tradicionales como acuarela, gouache y lápices de colores. Autora del libro "Bitácora: ilustrando la flora en la ciudad" e ilustradora de diversas publicaciones sobre patrimonios, flora y fauna nativa y educación ambiental.');
INSERT INTO catalogo_artista VALUES(32,32,'aV',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','La ilustración es mi forma de expresar ternura. En mis ilustraciones fusiono mi mundo interno de fantasía con la naturaleza de mi realidad y generalmente creo composiciones que transmiten paz y calma.');
INSERT INTO catalogo_artista VALUES(33,33,'aW',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Me dedico a hacer ilustraciones digitales de cosas que me llamen la atención así como también a hacer comisiones, generalmente ambas comparten temáticas como por ejemplo el medio ambiente, animales y lugares de la ciudad, también de vez en cuando busco plasmar sensaciones y pensamientos a través de viñetas y mas recientemente en animación.\nCómo dibujante quiero lograr hacer trazos mas simples combinados con texturas y colores vibrantes que en conjunto resulten en algo atractivo ^^','\n',char(10)));
INSERT INTO catalogo_artista VALUES(34,34,'aX',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy ilustradora especializada en técnicas análogas, especialmente acuarela, lápices de color y técnicas mixtas. Los temas centrales de mi trabajo son la fantasía, el realismo mágico, la nostalgia y los cuentos de hadas.');
INSERT INTO catalogo_artista VALUES(35,35,'aY',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Diseñadora Gráfica e ilustradora. En mi trabajo me gusta representar, ya sea por medio de técnicas tradicionales o digitales, escenarios que resaltan elementos de la naturaleza y que estos interactúen a través de mundos oníricos con la imagen, a menudo femenina, que protagoniza la escena.');
INSERT INTO catalogo_artista VALUES(36,36,'aZ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi nombre es Daniela y en redes sociales soy Sakanita, tengo mi Tiendita llamada Sakana Papelería. Mis referentes son la naturaleza, los gatitos y halloween. Actualmente mi técnica es digital, dibujo con procreate y los productos de mi tienda van desde stickers a estuches estampados, todo realizado en mi taller.');
INSERT INTO catalogo_artista VALUES(37,37,'b0',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Hola soy Pablo, dibujante bajo el nick "chilensis" con más de una década de incursionar en el mundo del arte.\n\nHe enfatizado en crear personajes y cómics originales en un estilo simple y movido,para así también traer una propuesta original a series y juegos populares a través de fanart.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(38,38,'b1',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola! Soy Alejandro Jorquera, más conocido como el ale ilustrador, Artista gráfico dedicado al diseño e Ilustración de autor, abordo temáticas de naturaleza con características antropomórficas, fusionando lo onírico y lo místico, la vida y la muerte. explorando el camino a través de técnicas de serigrafía, fotografía acuarela y el entintado.');
INSERT INTO catalogo_artista VALUES(39,39,'b2',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Francisco Valdivia Profesor, artista visual sus técnicas preferidas son las acuarelas, gouache, acrílico, lápices de colores y técnica mixta. Sus temas a retratar más recurrentes son: paisaje, animales, flores y criaturas con elementos híbridos (quimeras) en su compasión. Además de darle un halo de mitología, fantasía y');
INSERT INTO catalogo_artista VALUES(40,40,'b3',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Ilustradora y Diseñadora. Autora del Manga "La Leyenda del Valle Negro", manga basado en la Leyenda de los Brujos de Salamanca de donde provengo y autora de "Pacita", cómic de humor para mujeres. Mis ilustraciones, mangas y comics están inspirados en mangakas como Junji Ito, Kaori Yuki y Tamayo Akiyama.');
INSERT INTO catalogo_artista VALUES(41,41,'b4',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace(replace('Futuro Comics es un sello editorial autogestionado de historietas de aventuras y ciencia\r\nficción creado por el dibujante Diego Maya, nacido originalmente como fanzine a finales de\r\nlos noventa. Desde hace un par de años, con la llegada del autor a la IV Región, se ha\r\nreinventado en un nuevo formato más profesional, que busca acercar la narrativa gráfica al\r\npúblico lector, con un enfoque que busca encantar tanto a los fans veteranos del género,\r\ncomo a nuevas generaciones de comiqueros.','\r',char(13)),'\n',char(10)));
INSERT INTO catalogo_artista VALUES(42,42,'b5',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Nada me ha motivado más que utilizar las historietas como generadoras de ideas, reflexión y muchas veces hasta de denuncia, sí, porque si bien las historietas basan gran parte de su contenido en entretener, en infinidad de géneros, sin duda no está exenta también  de abrir y expandir la mente para mantenernos atentos e informados, ya que es un arte directo que no da mucho para la imaginación a quien nos lee.');
INSERT INTO catalogo_artista VALUES(43,43,'b6',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Dibujante de comics, enfocado en el humor gráfico y la narrativa. Entre mi trabajo pueden encontrar viñetas semanales de humor gráfico, con personajes de Godzilla en situaciones del día a día, y comics con historias serializadas o auto concluyentes, que van desde lo personal a lo bizarro.');
INSERT INTO catalogo_artista VALUES(44,44,'b7',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi nombre es Pía Ahumada y desde 2013 trabajo en Taller Editorial Me pego un tiro, me dedico principalmente a la encuadernación, reparación y publicación; en general me interesa cualquier labor que esté relacionada con libros como objeto o como bien cultural.');
INSERT INTO catalogo_artista VALUES(45,45,'b8',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Mami Sita, artesana serenense y me enfoco principalmente en el arte japonés del amigurumi. Realizo retratos de personajes, artistas y personas, diseñando y elaborando cada proyecto con dedicación, esperando que transmitan alegría, ayudando a conectar con recuerdos significativos.');
INSERT INTO catalogo_artista VALUES(46,46,'b9',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Pía, bordadora y collagista desde el año 2020. Comencé a bordar por el deseo que tenía de retratar a mi gatita tonks y hacer collages digitales como hobby, el 2021 decidí abrir @sratonks para mostrar mis bordados y experimentos varios, con el tiempo se transformó en mi trabajo y hoy bordo mascotas a pedido');
INSERT INTO catalogo_artista VALUES(47,47,'bA',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Alkimia.cl , un espacio para seres mágicos. Joyería artesanal hecha a mano con cristales. Amuletos intencionados que sacan a relucir tu belleza interior, te acompañan y protegen. Boutique de artículos brujiles para usar en el día a día.');
INSERT INTO catalogo_artista VALUES(48,48,'bB',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','KaO ArtWork es un espacio de creación que ha evolucionado a lo largo de 10 años. Hoy en día uno oficios y técnicas como joyería, artesanías, pintura y en este último tiempo tatuajes. Tras bambalinas, estoy yo Jessica de profesión Diseñadora, oficio Orfebre y autodidacta en dibujo y pintura y más.');
INSERT INTO catalogo_artista VALUES(49,49,'bC',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Decordillera es un espacio donde creo cuadritos decorativos en madera inspirados en la naturaleza. Utilizando la técnica de corte láser transformo mis ilustraciones en paisajes tridimensionales, fusionando arte, diseño y precisión. Cada pieza está diseñada para aportar profundidad y vida a cualquier espacio, con un toque de naturaleza y color.');
INSERT INTO catalogo_artista VALUES(50,50,'bD',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Ovallino. Psicólogo. Aficionado al animé y los cómics. Desde niño he buscado contar historias con dibujos.\n\nEntiendo el cómic como una herramienta que nos permite entretenernos y aprender. En los últimos años he publicado diversas historietas breves disponibles en mis redes sociales que abordan la fantasía infantil, aventuras educativas y problemáticas de salud mental. Además, realizo charlas y talleres de creación de cómics para niños y jóvenes en diversos establecimientos educacionales.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(51,51,'bE',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola, soy Pat!, una artista visual chileno que trabaja con técnicas mixtas, fusionando lo digital y lo tradicional, con el propósito de crear ilustraciones que exploran lo lúgubre, lo etéreo y lo nostálgico. Mi obra se inspira profundamente en la estética/cultura goth, las muñecas bjd (ball jointed dolls) y los animes de los 2000.');
INSERT INTO catalogo_artista VALUES(52,52,'bF',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola soy ilustradora, titulada en diseño gráfico. Disfruto dibujar en tradicional jugando entre la fantasía y la realidad con un estilo infantil, siendo las acuarelas, los lápices de colores y mi creatividad el lenguaje que da vida a mis trabajos, donde plasmo momentos de tranquilidad, historias y varios personajes tocados por la magia.');
INSERT INTO catalogo_artista VALUES(53,53,'bG',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi estilo visual se enfoca en los colores vibrantes, es fantasioso y fuertemente influenciado por elementos de cultura pop, anime y fantasía mágica.');
INSERT INTO catalogo_artista VALUES(54,54,'bH',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Chris Olivares, también conocido como Remembranzas negras en rr.ss. es un ilustrador y pintor serense quien aborda con pasión tematicas como melancolía, la nostalgia, el paso del tiempo y los recuerdos que se filtran con el paso de este, a través un lenguaje emotivo pero esperanzador, su técnica de predilección es la acuarela pero tambien trabajando con otros con medios tales como el pastel, carboncillo y programas digitales, sus influencias siempre presentes son el arte clasico, lo religioso, el tenebrismo, la escultura y la figura femenina.');
INSERT INTO catalogo_artista VALUES(55,55,'bI',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Eve Maluenda, Ilustradora de profesion y escritora/poeta autodidacta, autora de Eco Austral y otras historias. n0tarts es mi proyecto de arte, donde mesclo ilustracion digital, pintura tradicional acrilica y mi poesia. Si logro transmitirte algo de lo que quiero expresar con mi trabajo sigueme 🫶');
INSERT INTO catalogo_artista VALUES(56,56,'bJ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Microbits y hago cosas en 3D. A veces salen personajes tiernos, a veces cosas más darks. No siempre sé bien qué estoy haciendo, pero me gusta el proceso. Me interesa jugar con emociones, lo raro y lo nostálgico, aunque no siempre tenga una idea clara al empezar. A veces solo quiero ver qué sale.');
INSERT INTO catalogo_artista VALUES(57,57,'bK',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Bekzar, artista regional que mediante el uso de cultura pop y humor, busca retratar personajes reconocibles y propios en situaciones divertidas y estilo pinup, intentando siempre sacar una sonrisa con ilustraciones atractivas y variadas con un enfoque en los colores y la armonía de fondos en la pieza completa');
INSERT INTO catalogo_artista VALUES(58,58,'bL',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola! Soy Arcanista, Ilustrador, Artista Conceptual y Streamer. Me especializo en arte digital de fantasía, donde exploro mundos mágicos estilizados con un toque colorido, expresivo y lleno de simbología. Mi trabajo fusiona lo espiritual y lo místico con influencias de la cultura pop, el anime y los videojuegos. Realizo comisiones personalizadas, portadas de libros, diseño de personajes, fanarts y arte para desarrollo visual de juegos');
INSERT INTO catalogo_artista VALUES(59,59,'bM',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Nació en Coquimbo y creció rodeado de perros hasta alcanzar la mayoría de edad. Sabe leer, escribir y dibujar. Es autor de Seiyam: sangre en la camanchaca. Del resto solo saben sus clientes.');
INSERT INTO catalogo_artista VALUES(60,60,'bN',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','¡Hola! Mi nombre es Javiera, Ilustradora y estudiante actualmente de Arquitectura. Mi trabajo se destaca por ilustrar armaduras y robots, además de ilustraciones detalladas y el uso de colores vibrantes. De manera profesional me dedico al diseño de personajes para clientes de todo el mundo. Tomando desde siempre inspiración en el dibujo japonés, sobre todo estilo kawaii/chibi y estilo de comic como los tomos de Transformers.  ☆');
INSERT INTO catalogo_artista VALUES(61,61,'bO',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Desarrollo ilustraciones en digital con estilo Anime, especializándome en Lineart, fanart y el Diseño de Personajes, con un enfoque particular en la fantasía. Mi trayectoria como artista autodidacta impulsa un constante perfeccionamiento técnico y narrativo');
INSERT INTO catalogo_artista VALUES(62,62,'bP',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Yatiediciones, es una editorial enfocada en la recopilación, sensibilización y difusión de los pueblos originarios a través de material didáctico, cuadernos de aprendizaje, poesía y narrativa ilustrada. \nLlevamos años como educadores tradicionales de lengua y cultura de los pueblos originarios y desde el 2014, nos hemos reunido bajo el nombre de Yatiediciones, para difundir nuestro trabajo en Chile y el mundo.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(63,63,'bQ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Victoria Rubio, conocida como "Lesbilais", es chilena, migrante y autora de cómics como “Lesbilais” (de ahí su apodo) y que tiene una publicación recopilatoria en formato libro. Además cuenta con un segundo libro de cómic publicado, llamado “Loreto poco Hetero” y con un tercer libro realizado a modo de Antología.\nHa viajado mostrando su trabajo en eventos de cómic, como “Viñetas en altura” en La Paz, Bolivia, “Lady’s Comic” en Sao Paulo, Brasil, “Festival de Artes Feministas”, en México, “Vamos las pibas” en Buenos Aires, Argentina y salones del cómics en Valencia y Barcelona. Ha participado de eventos dando charlas sobre cómic hecho por mujeres en diferentes instancias en Chile, Latinoamérica, España y Francia. Ha dado entrevistas para televisión, diarios en Latinoamérica y medios independientes sobre la importancia de ser lesbiana visible y creadora de historietas.\nComo artista de cómics, se le ha considerado como una artista integral, ya que se dedica al guión y al dibujo. Actualmente vive en España, donde ha potenciado su faceta como fanzinera, dedicándose a la autoedición de juegos de cartas y de libros de cómics.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(64,64,'bR',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('¡Hola! Soy Myru Ann.\nMi trabajo se desarrolla principalmente en ilustración digital, aunque también disfruto explorando técnicas tradicionales como los lápices policromos y la pintura. Mi estilo se caracteriza por una estética suave, femenina y simbólica, donde a veces lo tierno combina con lo crudo.\nMe interesa especialmente lo emocional, abordado desde una mirada íntima y personal.\nTambién disfruto mucho hacer retratos por encargo, ya sean de mascotas, parejas o familias en especial en lienzos con óleo :-)','\n',char(10)));
INSERT INTO catalogo_artista VALUES(65,65,'bS',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Soy Nati y creo figuras de animalillos en arcilla, en pompones de lana, y otros experimentos. Mi inspiración nace de artistas del otro lado del mundo, entre ellos: Trikotri, Viktoria Volcheg y Hashimotomio, échenle un vistazo también! : )');
INSERT INTO catalogo_artista VALUES(66,66,'bT',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Nicole comenzó desarrollando la técnica del collage con prensado botánico de forma autodidacta, creando diversas obras que permiten la apreciación de la flora en su materialidad y estructura. Actualmente, trabaja la misma materia prima pero explorando la bisutería con resina, creando piezas únicas. Su principal inspiración son las flores y como éstas pueden extender su vida en el tiempo.');
INSERT INTO catalogo_artista VALUES(67,67,'bU',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola, soy Nino, licenciada en Pedagogía en Educación Parvularia e ilustradora autodidacta. Me caracterizo por realizar ilustraciones con colores vibrantes, fanarts expresivos y por mi pasión por dibujar mapaches y gatitos. Desde temprana edad he sentido un profundo amor por explorar el arte y la creatividad. Me gusta expresar en mis ilustraciones una mezcla de lo absurdo, lo tierno y bizarro, dando vida a personajes y escenas que invitan a imaginar, reír o sentir. Hace un tiempo perdí mi cuenta principal de Instagram, pero por suerte logré recuperar "nino_nyart", donde sigo compartiendo todo lo que me inspira. Día a día trabajo para seguir mejorando la composición visual de mis obras y tratar de contar historias con ellas.');
INSERT INTO catalogo_artista VALUES(68,68,'bV',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('¡Hola! Soy Paper Pupy, diseñadora gráfica e ilustradora apasionada por la cultura kawaii de los 90-2000, y el journaling. Mi trabajo se centra principalmente en crear papelería y accesorios que complementan este hobby, inspirando nostalgia y felicidad. \n\nMis ilustraciones, influenciadas por los animes de los 90, personajes de la cultura kawaii y tendencias de moda, fusionan lo nostálgico con un toque actual a través de formas ornamentales, románticas, y colores pasteles.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(69,69,'bW',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Ilustradora autodidacta de La Serena\nDe 27 años, Mi estilo se rige por las espontaneidad y momentos de inspiración, me caracterizo mayoritariamente por dibujos digitales, tratando de abarcar diferentes estilo, formas y colores, creación de personajes y de estetica simple y saturado.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(70,70,'bX',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Mi nombre es Rocío, realizo encuadernación artesanal clásica, timbres de goma y miniaturas de cuadernos en aros y collares. Considero a mi tienda como un espacio de proteccion y homenaje a este oficio,a lo hecho a mano y a la expresión en papel.');
INSERT INTO catalogo_artista VALUES(71,71,'bY',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Solid Ediciones es una editorial sin fines de lucro, que busca difundir el Cómic y a sus autores en la Cuarta Región.');
INSERT INTO catalogo_artista VALUES(72,72,'bZ',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('"Sueño de Pájaro" es un taller autogestionado donde experimento con cerámica principalmente. Me inspiro en la alfarería tradicional de los pueblos originarios de América (Abya Yala).\n\nCada pieza busca conectar lo antiguo con lo actual, el espacio interior con algunos elementos de la cultura popular.\n\n“en mi memoria habitan sonidos que intento recrear a través de estos instrumentos de caña y greda"','\n',char(10)));
INSERT INTO catalogo_artista VALUES(73,73,'c0',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('¡Hola! Soy Tekaeme, diseñadora gráfica e ilustradora freelance. Mi trabajo se basa en ilustraciones digitales con un estilo tierno y adorable, fuertemente inspirado en el anime.\nBusco transmitir esa ternura a quienes ven mi arte, y que cada persona sienta alegría al tener una de mis obras.\nTrabajo principalmente con ilustraciones originales, pero también me encanta hacer fanarts de cantantes, animes, series y todo lo que me inspira.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(74,74,'c1',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola! Ruvale aquí. Soy estudiante de psicología y me dedico en mi tiempo libre como dibujante digital. Mi arte consiste por sobre todo de personajes originales y fanarts de mis gustos personales. También realizo videos de análisis en Youtube, integrando animaciones cortas hechas por mi e ilustraciones como portadas de los videos.');
INSERT INTO catalogo_artista VALUES(75,75,'c2',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Ilustrador de comics y animador, nacido en Uruguay y viviendo en Chile actualmente. Soy un youtuber de reseñas de videojuegos y otras cosas en el mundo del arte.\nApasionado por lo que hago y muy feliz de compartir mis proyectos con el mundo. Ahora trabajando en mi comic llamado Power Pow.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(76,76,'c3',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Aquí Ilustravel! Diseñadora, Ilustradora y escritora diplomada en LIJ. Amante de la literatura y los gatos.\nMi trabajo busca contar historias inspirado en temas patrimoniales y de época. Me enfoco en personajes originales y la creación de mundos donde mezclo lo local con temáticas sobrenaturales más universales.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(77,77,'c4',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Intercultural arte es una marca con la que busco identidad local a través de la Ilustración y el oficio de la  serigrafía, retrato el patrimonio natural y cultural del territorio, tanto de la región, nacional y a nivel latinoamericano.');
INSERT INTO catalogo_artista VALUES(78,78,'c5',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Soy ilustrador digital y Diseñador Gráfico de la cuenca del Elki.\nMi trabajo se orienta hacia la construcción de escenarios ominosos que integran elementos propios de la fantasía oscura y el surrealismo digital. Opto por una estética de contrastes marcados y formas fluidas que van construyendo parajes desolados y entidades solitarias que se mezclan con lo profundo.\nElijo mantenerme al margen de los elementos totalmente figurativos, ya que valoro que cada persona construya su propia interpretación desde lo que ve.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(79,79,'c6',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Ensimismada es un proyecto de confección y reinvención artesanal de moda y accesorios, nacido desde la introspección del hogar y el amor por lo cotidiano. Trabajamos con telas vintage y prendas reutilizadas para crear piezas únicas, cómodas y llenas de identidad.\n\nLejos de la cultura de lo descartable, cada prenda está hecha para durar y acompañar, como un objeto querido que guarda historia y alma.','\n',char(10)));
INSERT INTO catalogo_artista VALUES(80,80,'c7',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47',replace('Hola, soy Prrr Miaow\nLlevo casi un año adentrandome al mundo del pixel art, aunque dibujo ilustración digital desde hace tiempo.\nMis ilustraciónes son mayormente animales, naturaleza y un poco de fanart.\nTengo un estilo soft y tierno, me gusta causar ese "Awww" en las personas, que se lleven un producto mio y mi arte los acompañe','\n',char(10)));
INSERT INTO catalogo_artista VALUES(81,81,'c8',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Hola, soy Javo Siniestro: arquitecto, ilustrador y ceramista en proceso. Mi trabajo se basa principalmente en la cultura pop y en elementos del mundo geek. Me gusta usar colores vibrantes y un line art con carácter en mis composiciones. Suelo trabajar en ilustración digital y en acuarela tradicional');
INSERT INTO catalogo_artista VALUES(82,82,'c9',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Diseñadora y artista de la Región de Coquimbo, crea piezas únicas y originales, utilizando una variedad de materiales y técnicas que dan vida a obras cargadas de color, emoción y simbolismo. Su trabajo se nutre de la psicodelia, el arte intuitivo y un proceso creativo profundamente consciente, donde cada pieza responde a una intención y una historia propia.');
INSERT INTO catalogo_artista VALUES(83,83,'cA',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Ilustradora que fusiona técnicas digitales y tradicionales, especialmente la acuarela. Su estilo combina el anime y el cartoon, creando ilustraciones vibrantes llenas de colores intensos y personajes expresivos, inspirados en la figura humana, la naturaleza, los animales y figuras coleccionables.');
INSERT INTO catalogo_artista VALUES(84,84,'cC',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Gusto en conocerte, soy Nami! Creadora de contenido, ilustradora, diseñadora gráfica y textil especializada en peluches. Mi estilo se basa en un lineart grueso chocolate junto con paletas pasteles y saturadas que se asocian con los dulces y la magia. Mis peluches son creados por mis propias manos desde la idea en papel hasta la mano de obra en tela, entregando una identidad y propósito para quien los adopte y les de un bonito hogar.');
INSERT INTO catalogo_artista VALUES(85,85,'cD',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Ilustrador, dibujante de cómics y editor en Cazar al Tiburón Editores, su trabajo se ha expuesto en galerías de arte, bibliotecas públicas y otros espacios culturales. En sus ilustraciones de @fabian_ilustrado, los personajes son el alma de escenas que exploran la introspección, la nostalgia y la vulnerabilidad humana. Entre lo real y lo imaginario, sus obras invitan a conectar con emociones universales a través de momentos cotidianos cargados de significado.');
INSERT INTO catalogo_artista VALUES(86,86,'cE',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Escultora y Licenciada en artes plásticas de la Universidad de Chile, autora de cinco libros para la educación artística para niños en la Editorial Voluntad, Colombia, 1997; 1er lugar en Escultura en la V Bienal Internacional de Suba, Bogotá en 2005; profesora de artes para niños, jóvenes y adultos en colegios, centros culturales y municipalidades desde año 2000 a la fecha; exposiciones de escultura y pintura en Bogotá, Miami, Santiago, Puerto Montt, La Serena y Coquimbo.');
INSERT INTO catalogo_artista VALUES(87,87,'cB',0,1,'2025-12-26 20:07:29','2025-12-27 04:50:47','Ilustradora digital que destaca por su estilo anime semirealista. Disfruta crear fanarts, doodles sillies y personajes originales que reflejan sus emociones e intereses, siempre explorando nuevas técnicas para dar vida a sus ideas.');
CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(255) NOT NULL PRIMARY KEY);
INSERT INTO schema_migrations VALUES('1766948368');
INSERT INTO schema_migrations VALUES('1766948369');
INSERT INTO schema_migrations VALUES('1766948370');
INSERT INTO schema_migrations VALUES('1766948371');
CREATE TABLE IF NOT EXISTS artista_historial (id INTEGER PRIMARY KEY AUTOINCREMENT, artista_id INTEGER NOT NULL, pseudonimo TEXT, correo TEXT, rrss TEXT, ciudad TEXT, pais TEXT, orden INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, notas TEXT, CONSTRAINT fk_artista_historial_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE, CONSTRAINT uq_artista_historial_orden UNIQUE (artista_id, orden), CONSTRAINT chk_artista_historial_orden CHECK (orden > 0), CONSTRAINT chk_artista_historial_has_data CHECK (pseudonimo IS NOT NULL OR correo IS NOT NULL OR rrss IS NOT NULL OR ciudad IS NOT NULL OR pais IS NOT NULL));
INSERT INTO artista_historial VALUES(1,13,NULL,'magda.lena.nt.56@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:18','Importado desde CSV histórico. Pseudónimo original: CANELA');
INSERT INTO artista_historial VALUES(2,32,'Glitter Illustration','list.retamal@gmail.com','{"instagram":"https://www.instagram.com/glitter.illustration/","facebook":"https://web.facebook.com/glitter.illustration/"}','Coquimbo',NULL,1,'2025-12-27 04:34:19','Importado desde CSV histórico. Pseudónimo original: Glitter Illustration');
INSERT INTO artista_historial VALUES(3,17,'Kiryuu','cami.malebran21@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:19','Importado desde CSV histórico. Pseudónimo original: Kiryuu');
INSERT INTO artista_historial VALUES(4,2,NULL,'vargaslvanesa@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:19','Importado desde CSV histórico. Pseudónimo original: Shobian');
INSERT INTO artista_historial VALUES(5,33,'Algún Diaz Yueng (Niño Pan)','diazyueng@gmail.com','{"instagram":"https://www.instagram.com/algundiazyueng/","facebook":"https://web.facebook.com/colectivoninopan/"}',NULL,NULL,1,'2025-12-27 04:34:19','Importado desde CSV histórico. Pseudónimo original: Algún Diaz Yueng (Niño Pan)');
INSERT INTO artista_historial VALUES(6,6,NULL,'a.gutierrezuribe@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:19','Importado desde CSV histórico. Pseudónimo original: CatAna');
INSERT INTO artista_historial VALUES(7,31,'Chinchilla Cosmica','cam.ann.gn@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: Chinchilla Cosmica');
INSERT INTO artista_historial VALUES(8,35,'Hanrra_Artwork',NULL,NULL,'La Serena',NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: Hanrra_Artwork');
INSERT INTO artista_historial VALUES(9,4,'Hype_Monters','bloody.blossom.3@gmail.com','{"instagram":"https://www.instagram.com/hype_monsters/"}',NULL,NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: Hype_Monters');
INSERT INTO artista_historial VALUES(10,38,'LaFresiaTrama','lafresiatrama@gmail.com','{"instagram":"https://www.instagram.com/lafresiatrama/"}',NULL,NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: LaFresiaTrama');
INSERT INTO artista_historial VALUES(11,69,NULL,'javiera_-_pelitos@hotmail.cl',NULL,NULL,NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: Peliitos');
INSERT INTO artista_historial VALUES(12,43,'Rotten Monkey Inc.',NULL,'{"instagram":"https://www.instagram.com/rottenmonkey_inc/","facebook":"https://web.facebook.com/rottenmonkeyinc/"}','La Serena',NULL,1,'2025-12-27 04:34:20','Importado desde CSV histórico. Pseudónimo original: Rotten Monkey Inc.');
INSERT INTO artista_historial VALUES(13,81,'Siniestre',NULL,'{"instagram":"https://www.instagram.com/siniestre/","facebook":"https://web.facebook.com/siniestre/"}',NULL,NULL,1,'2025-12-27 04:34:21','Importado desde CSV histórico. Pseudónimo original: Siniestre');
INSERT INTO artista_historial VALUES(14,71,NULL,'solidediciones@gmail.com',NULL,NULL,NULL,1,'2025-12-27 04:34:21','Importado desde CSV histórico. Pseudónimo original: Solid Ediciones');
INSERT INTO artista_historial VALUES(15,39,NULL,NULL,NULL,'Tongoy',NULL,1,'2025-12-27 04:34:21','Importado desde CSV histórico. Pseudónimo original: Pancho Valdivia');
INSERT INTO artista_historial VALUES(16,48,'Kao Joyas',NULL,'{"instagram":"https://www.instagram.com/kao.joyas/","facebook":"https://www.facebook.com/KaOJoyas"}',NULL,NULL,1,'2025-12-27 04:34:21','Importado desde CSV histórico. Pseudónimo original: Kao Joyas');
INSERT INTO artista_historial VALUES(17,45,'Mamisita Modo On',NULL,'{"instagram":"https://www.instagram.com/mamisitamodeon/","facebook":"https://www.facebook.com/mamisitamodeon/"}',NULL,NULL,1,'2025-12-27 04:34:21','Importado desde CSV histórico. Pseudónimo original: Mamisita Modo On');
CREATE TABLE IF NOT EXISTS "evento_edicion_postulacion" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    disciplina_id INTEGER NOT NULL,
    dossier_url TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_postulacion_evento_edicion 
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_disciplina 
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT chk_postulacion_estado 
        CHECK (estado IN ('pendiente', 'seleccionado', 'rechazado', 'invitado'))
);
CREATE TABLE IF NOT EXISTS "artista" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    pseudonimo TEXT NOT NULL,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,
    slug TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO artista VALUES(1,'Paula Rojas Videla','Anima Red','Animared.ilustracion@gmail.com','{"instagram":"https://Instagram.com/anima.red"}','La Serena','Chile','anima-red','2025-12-25 05:11:50','2025-12-26 04:52:28');
INSERT INTO artista VALUES(2,'Vanesa Estefanie Vargas Leyton','Shobian','shobian.art@gmail.com','{"instagram":"https://www.instagram.com/shobian.art/"}','Coquimbo','Chile','shobian','2025-12-25 05:11:50','2025-12-26 04:52:28');
INSERT INTO artista VALUES(3,NULL,'Fran.Aerre','fran.aerre@gmail.com','{"instagram":"https://www.instagram.com/fran_aerre/"}','Coquimbo','Chile','fran-aerre','2025-12-25 05:11:50','2025-12-26 04:52:29');
INSERT INTO artista VALUES(4,'Josefa Aguilera','Skelly.Uwu','skelly.ilustra@gmail.com','{"instagram":"https://www.instagram.com/skelly.uwu/"}','La Serena','Chile','skelly-uwu','2025-12-25 05:11:50','2025-12-26 04:52:30');
INSERT INTO artista VALUES(5,NULL,'P3Dro','p_rojas03@hotmail.com','{"instagram":"https://www.instagram.com/p3dro_rv.03?igsh=MWh2cnRzZHpmeDMzNg=="}','Coquimbo','Chile','p3dro','2025-12-25 05:11:50','2025-12-26 04:52:31');
INSERT INTO artista VALUES(6,'Ana Aurora Gutierrez Uribe','Catana','holacatana@gmail.com','{"instagram":"https://www.instagram.com/c_a_t_a_n_a/","facebook":"https://web.facebook.com/catanasworld/"}','La Serena','Chile','catana','2025-12-25 05:11:50','2025-12-26 04:52:31');
INSERT INTO artista VALUES(7,'Sebastian Aguirre','Seba Endless','seba.endlesss@gmail.com','{"instagram":"https://www.instagram.com/seba.endless/","facebook":"https://web.facebook.com/Seba.Endless/"}','La Serena','Chile','seba-endless','2025-12-25 05:11:50','2025-12-26 04:52:32');
INSERT INTO artista VALUES(8,NULL,'Viliz_Vz','vilizthementor21@gmail.com','{"instagram":"https://www.instagram.com/viliz_vz?igsh=aTF5dWFzMWl4azl6"}','Vicuña','Chile','viliz-vz','2025-12-25 05:11:50','2025-12-26 04:52:33');
INSERT INTO artista VALUES(9,'Karime Simon Viñales','Karime Simon','avinagretta@gmail.com','{"instagram":"https://www.instagram.com/trauerkult_/?hl=es"}','La Serena','Chile','karime-simon','2025-12-25 05:11:50','2025-12-26 04:52:33');
INSERT INTO artista VALUES(10,'Ulises Lopez','Uliseslo','tallerelqui@gmail.com','{"instagram":"https://instagram.com/uliseslo","web":"http://fauna-impo.blogspot.com/"}','La Serena','Chile','uliseslo','2025-12-25 05:11:50','2025-12-26 04:52:34');
INSERT INTO artista VALUES(11,NULL,'Vale Ilustra','valeilustra2@gmail.com','{"instagram":"https://www.instagram.com/vale_ilustra?igsh=a21rMmw0cGx5bDlh"}','La Serena','Chile','vale-ilustra','2025-12-25 05:11:50','2025-12-26 04:52:35');
INSERT INTO artista VALUES(12,NULL,'Nyxandr','Nyxandr.contacto@gmail.com','{"instagram":"https://www.instagram.com/nyxandr"}','La Serena','Chile','nyxandr','2025-12-25 05:11:50','2025-12-26 04:52:35');
INSERT INTO artista VALUES(13,'Magdalena Antonia Pizarro Lopez','Canela','Canelaqq@gmail.com','{"instagram":"https://www.instagram.com/canela_qq1?igsh=MXdjbWRxOGRmaWZiYQ=="}','Coquimbo','Chile','canela','2025-12-25 05:11:50','2025-12-26 04:52:36');
INSERT INTO artista VALUES(14,NULL,'Grabados Aleph','angelbarra07@gmail.com','{"instagram":"https://www.instagram.com/grabados_aleph/"}','La Serena','Chile','grabados-aleph','2025-12-25 05:11:50','2025-12-26 04:52:37');
INSERT INTO artista VALUES(15,'Ivannia Belen Jacob García','Ivichu.Jpg','Ivabelen@gmail.com','{"instagram":"https://www.instagram.com/ivichu.jpg/"}','La Serena','Chile','ivichu-jpg','2025-12-25 05:11:50','2025-12-26 04:52:38');
INSERT INTO artista VALUES(16,NULL,'Osamenta En El Jardin','valeria.suarez.diaz97@gmail.com','{"instagram":"https://www.instagram.com/osamentaseneljardin/"}','Vicuña','Chile','osamenta-en-el-jardin','2025-12-25 05:11:50','2025-12-26 04:52:38');
INSERT INTO artista VALUES(17,'Camila Rosa Malebrán Cabezas','Ckiryuu','madkiryuu@gmail.com','{"instagram":"https://www.instagram.com/ckiryuu","facebook":"https://www.facebook.com/Kiryuu00/"}','Coquimbo','Chile','ckiryuu','2025-12-25 05:11:50','2025-12-26 04:52:39');
INSERT INTO artista VALUES(18,NULL,'Aderezo','addless7u7@gmail.com','{"instagram":"https://instagram.com/addless7u7"}','La Serena','Chile','aderezo','2025-12-25 05:11:50','2025-12-26 04:52:40');
INSERT INTO artista VALUES(19,NULL,'Purr Creatures','purrcreatures@gmail.com','{"instagram":"https://www.instagram.com/purrcreatures/"}','Coquimbo','Chile','purr-creatures','2025-12-25 05:11:50','2025-12-26 04:52:40');
INSERT INTO artista VALUES(20,'Anastassia Bou Copier','Tachipin','tachipinillustrations@gmail.com','{"web":"https://linktr.ee/Tachipinillustrations13","facebook":"https://web.facebook.com/Tachipin/"}','La Serena','Chile','tapichin','2025-12-25 05:11:50','2025-12-27 04:19:37');
INSERT INTO artista VALUES(21,NULL,'Saturno','saturnooarte@gmail.com','{"instagram":"https://www.instagram.com/sa_tu_rno/"}','Coquimbo','Chile','saturno','2025-12-25 05:11:50','2025-12-26 04:52:42');
INSERT INTO artista VALUES(22,'Constanza Toro','Fluchinick','Fluchinick@gmail.com','{"instagram":"https://www.instagram.com/fluchinick/"}','La Serena','Chile','fluchinick','2025-12-25 05:11:50','2025-12-26 04:52:43');
INSERT INTO artista VALUES(23,NULL,'Noezzal','noezzal@gmail.com','{"instagram":"https://www.instagram.com/noezzal"}','Coquimbo','Chile','noezzal','2025-12-25 05:11:50','2025-12-26 04:52:43');
INSERT INTO artista VALUES(24,NULL,'Khyaruu','khyaruustore@gmail.com','{"web":"https://khyaruu.carrd.co/"}','La Serena','Chile','khyaruu','2025-12-25 05:11:50','2025-12-26 04:52:44');
INSERT INTO artista VALUES(25,'Alexis Ivan Cepeda Esquivel','Acekuros','Acekuros@gmail.com','{"instagram":"https://Instagram.com/acekuros"}','La Serena','Chile','acekuros','2025-12-25 05:11:50','2025-12-26 04:52:45');
INSERT INTO artista VALUES(26,NULL,'Nomito','Olivaresdafne1@gmail.com','{"instagram":"https://www.instagram.com/_n0mito.art_/"}','La Serena','Chile','nomito','2025-12-25 05:11:50','2025-12-26 04:52:45');
INSERT INTO artista VALUES(27,NULL,'Chiimewe','chiimewe@gmail.com','{"instagram":"https://www.instagram.com/chiimewe?igsh=cG96N2txaWdseGtt"}','Coquimbo','Chile','chiimewe','2025-12-25 05:11:50','2025-12-26 04:52:46');
INSERT INTO artista VALUES(28,NULL,'Yem','j.n.t.c.200312@gmail.com','{"instagram":"https://www.instagram.com/yem.ito_art?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}','La Serena','Chile','yem','2025-12-25 05:11:50','2025-12-26 04:52:47');
INSERT INTO artista VALUES(29,NULL,'Skyderen','marcelovergara4507@gmail.com','{"web":"https://linktr.ee/_skyderen"}','La Serena','Chile','skyderen','2025-12-25 05:11:50','2025-12-26 04:52:48');
INSERT INTO artista VALUES(30,NULL,'Ghostie','lcmr.brownstone@gmail.com','{"instagram":"https://www.instagram.com/lc_mr.brownstone?igsh=cjFmaHljbjhlczN4"}','La Serena','Chile','ghostie','2025-12-25 05:11:50','2025-12-26 04:52:48');
INSERT INTO artista VALUES(31,'Camila Guamán','Camila Guaman','camilaguaman.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/camilaguaman.ilustracion","facebook":"https://web.facebook.com/chinchillacosmica/"}','La Serena','Chile','camila-guaman','2025-12-25 05:11:50','2025-12-26 04:52:49');
INSERT INTO artista VALUES(32,'Liset Retamal','Astro Glitter','astroglitter.studio@gmail.com','{"instagram":"https://www.instagram.com/astro.glitter/"}','La Serena','Chile','astro-glitter','2025-12-25 05:11:50','2025-12-26 04:52:50');
INSERT INTO artista VALUES(33,'Jorge Diaz Yueng','Niño Pan','elninopan99@gmail.com','{"instagram":"https://www.instagram.com/elninopan","facebook":"https://web.facebook.com/colectivoninopan/"}','La Serena','Chile','nino-pan','2025-12-25 05:11:50','2025-12-26 04:52:50');
INSERT INTO artista VALUES(34,'Camila Herrera','Camellia Liz','camihlatournerie@gmail.com','{"instagram":"https://www.instagram.com/camellia.liz","facebook":"https://web.facebook.com/camellializ/"}','Coquimbo','Chile','camellia-liz','2025-12-25 05:11:50','2025-12-26 04:52:51');
INSERT INTO artista VALUES(35,'Alejandra Avilés','Hanrra','hanrra.artwork@gmail.com','{"instagram":"https://www.instagram.com/hanrra.artwork/","facebook":"https://web.facebook.com/hanrraartwork/"}','Coquimbo','Chile','hanrra','2025-12-25 05:11:50','2025-12-26 04:52:52');
INSERT INTO artista VALUES(36,NULL,'Sakanita','sakanastationery@gmail.com','{"instagram":"https://instagram.com/_sakanita_/"}','Coquimbo','Chile','sakanita','2025-12-25 05:11:50','2025-12-26 04:52:52');
INSERT INTO artista VALUES(37,'Pablo Araya','Chilensis','Chilensisboy@gmail.com','{"instagram":"https://www.instagram.com/chilensisboy/","facebook":"https://web.facebook.com/chilensisboy/"}','La Serena','Chile','chilensis','2025-12-25 05:11:50','2025-12-26 04:52:53');
INSERT INTO artista VALUES(38,'Alejandro Jorquera','El Ale','creativotrama@gmail.com','{"instagram":"https://www.instagram.com/elale_ilustrador/"}','La Serena','Chile','el-ale','2025-12-25 05:11:50','2025-12-26 04:52:54');
INSERT INTO artista VALUES(39,'Francisco Valdivia Aguirre','Pancho Valdivia','HOMBREMEDIVAL@gmail.com','{"instagram":"https://www.instagram.com/pancho_valdivia/"}','La Serena','Chile','pancho-valdivia','2025-12-25 05:11:50','2025-12-26 04:52:54');
INSERT INTO artista VALUES(40,NULL,'Polet Komiksu','poletcomics@gmail.com','{"instagram":"https://www.instagram.com/poletkomiksu?igsh=MXd1bHdsOTd6YWl4cg=="}','Coquimbo','Chile','polet-komiksu','2025-12-25 05:11:50','2025-12-26 04:52:55');
INSERT INTO artista VALUES(41,'Diego Maya','Futuro Comics','contactodiegomaya@gmail.com','{"instagram":"http://instagram.com/futurocomics"}','La Serena','Chile','futuro-comics','2025-12-25 05:11:50','2025-12-26 04:52:56');
INSERT INTO artista VALUES(42,NULL,'Carvajal Ilustraciones','nacionautonoma@yahoo.es','{"instagram":"https://www.instagram.com/carvajalilustraciones/"}','Coquimbo','Chile','carvajal-ilustraciones','2025-12-25 05:11:50','2025-12-26 04:52:57');
INSERT INTO artista VALUES(43,'Rodan Castro Muñoz','Rotten Monkey','ro.felipe768@gmail.com','{"instagram":"https://instagram.com/rottenmonkey_inc/","facebook":"https://web.facebook.com/rottenmonkeyinc/"}','Coquimbo','Chile','rotten-monkey','2025-12-25 05:11:50','2025-12-26 04:52:57');
INSERT INTO artista VALUES(44,'Pía Ahumada','Me Pego Un Tiro','tallermepegountiro@gmail.com','{"instagram":"https://www.instagram.com/mepegountiro?igsh=NW40MW5udWl4OGM0"}','La Serena','Chile','me-pego-un-tiro','2025-12-25 05:11:50','2025-12-26 04:52:58');
INSERT INTO artista VALUES(45,'Fernanda Pérez Pérez','Mami Sita','Mamisitamodeon@gmail.com','{"instagram":"https://Instagram.com/mamisitamodeon"}','La Serena','Chile','mami-sita','2025-12-25 05:11:50','2025-12-26 04:52:59');
INSERT INTO artista VALUES(46,'Pía Fredes','Sra Tonks','nidoodepajaros@gmail.com','{"instagram":"https://www.instagram.com/sratonks/"}','La Serena','Chile','sra-tonks','2025-12-25 05:11:50','2025-12-26 04:52:59');
INSERT INTO artista VALUES(47,NULL,'Alkimia','Valentinasofiascalderon@gmail.com','{"instagram":"https://www.instagram.com/alkimia.cl?igsh=MW9vZDZhcWs2d3YxbQ=="}','Coquimbo','Chile','alkimia','2025-12-25 05:11:50','2025-12-26 04:53:00');
INSERT INTO artista VALUES(48,'Jessica Gutierrez Vega','Kao Artwork','Kathykiba@gmail.com','{"instagram":"https://www.instagram.com/kao.art.work/"}','Coquimbo','Chile','kao-artwork','2025-12-25 05:11:50','2025-12-26 04:53:01');
INSERT INTO artista VALUES(49,NULL,'De Cordillera','decordillerachile@gmail.com','{"instagram":"https://www.instagram.com/decordillera"}','Coquimbo','Chile','de-cordillera','2025-12-25 05:11:50','2025-12-26 04:53:01');
INSERT INTO artista VALUES(50,NULL,'Bolbarán Cómics','jose.bolbaran.r@gmail.com','{"instagram":"https://www.instagram.com/jose.bolbaran.r/"}','Ovalle','Chile','bolbaran-comics','2025-12-25 05:11:50','2025-12-26 04:53:02');
INSERT INTO artista VALUES(51,NULL,'Pat_trashoart','benjaminurrutiaramos@gmail.com','{"instagram":"https://www.instagram.com/pat_trashoart?igsh=MTZ2b3Q1bDdod2MxeQ=="}','La Serena','Chile','pat-trashoart','2025-12-25 05:11:50','2025-12-26 04:53:03');
INSERT INTO artista VALUES(52,'Valeria Venegas Fernández','Blanquis','blanquis.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/blanquis.ilus/","facebook":"https://www.facebook.com/blanquis.ilus/"}','Coquimbo','Chile','blanquis','2025-12-25 05:11:50','2025-12-26 04:53:04');
INSERT INTO artista VALUES(53,NULL,'Kmilu','camila.inostroza.liebsch@gmail.com','{"instagram":"https://www.instagram.com/kmiluup?igsh=Ym1vbGx3Y3R1ZXNu"}','La Serena','Chile','kmilu','2025-12-25 05:11:50','2025-12-26 04:53:04');
INSERT INTO artista VALUES(54,'Chris Olivares','Remebranzas Negras','floresolivarescc@gmail.com','{"instagram":"https://www.instagram.com/remembranzas_negras/"}','La Serena','Chile','remebranzas-negras','2025-12-25 05:11:50','2025-12-26 04:53:05');
INSERT INTO artista VALUES(55,'Eve Maluenda','N0tarts','epmg990@gmail.com','{"instagram":"https://www.instagram.com/n0tarts"}','La Serena','Chile','n0tarts','2025-12-25 05:11:50','2025-12-26 04:53:06');
INSERT INTO artista VALUES(56,NULL,'Microbits','contacto@fabianvallejos.cl','{"instagram":"https://www.instagram.com/maikurobitto/"}','La Serena','Chile','microbits','2025-12-25 05:11:50','2025-12-26 04:53:06');
INSERT INTO artista VALUES(57,NULL,'Bekzar','felipe.becar@mayor.cl','{"instagram":"https://www.instagram.com/bekzar.art/"}','Coquimbo','Chile','bekzar','2025-12-25 05:11:50','2025-12-26 04:53:07');
INSERT INTO artista VALUES(58,NULL,'Arcanista draws','arcanistadraws@gmail.com','{"instagram":"https://instagram.com/arcanistadraws"}','Ovalle','Chile','arcanista-draws','2025-12-25 05:11:50','2025-12-26 04:53:08');
INSERT INTO artista VALUES(59,NULL,'Francisco Llimy','francisco.llimy@gmail.com','{"instagram":"https://www.instagram.com/francisco.llimy/"}','La Serena','Chile','francisco-llimy','2025-12-25 05:11:50','2025-12-26 04:53:08');
INSERT INTO artista VALUES(60,NULL,'JaviiIlustrations','javieraramirez351@gmail.com','{"instagram":"https://www.instagram.com/javiiilustrations_?igsh=c2p5bnd4bDNkeDdi"}','La Serena','Chile','javiiilustrations','2025-12-25 05:11:50','2025-12-26 04:53:09');
INSERT INTO artista VALUES(61,NULL,'Ilustración khasumii','daniela18042@gmail.com','{"instagram":"https://www.instagram.com/_khasumii_/"}','La Serena','Chile','ilustracion-khasumii','2025-12-25 05:11:50','2025-12-26 04:53:10');
INSERT INTO artista VALUES(62,NULL,'Yatiediciones','layatiediciones@gmail.com','{"instagram":"https://www.instagram.com/editorial_yatiediciones"}','Coquimbo','Chile','yatiediciones','2025-12-25 05:11:50','2025-12-26 04:53:10');
INSERT INTO artista VALUES(63,'Victoria Rubio','Lesbilais','vicky.rubio@gmail.com','{"instagram":"https://www.instagram.com/lesbilais/"}','Crevillent','España','lesbilais','2025-12-25 05:11:50','2025-12-26 04:53:11');
INSERT INTO artista VALUES(64,'Maira Alday Villalobos','Myru Ann','myruann@gmail.com','{"instagram":"https://www.instagram.com/myru.ann","facebook":"https://web.facebook.com/myruann/"}','La Serena','Chile','myru-ann','2025-12-25 05:11:50','2025-12-26 04:53:12');
INSERT INTO artista VALUES(65,NULL,'Pininati','nati.macaya@gmail.com','{"instagram":"https://www.instagram.com/pininati/"}','La Serena','Chile','pininati','2025-12-25 05:11:50','2025-12-26 04:53:12');
INSERT INTO artista VALUES(66,NULL,'Flowerspower','nramirezrivera1@gmail.com','{"instagram":"https://www.instagram.com/el_flowers_power?igsh=MTdpOW12cWtsNXR2bw=="}','Coquimbo','Chile','flowerspower','2025-12-25 05:11:50','2025-12-26 04:53:13');
INSERT INTO artista VALUES(67,NULL,'Minino_nyart','ninoskhalohmayer@gmail.com','{"instagram":"https://www.instagram.com/minino_nyart?igsh=MWM2N3Mybm55ZjRhdA=="}','Coquimbo','Chile','minino-nyart','2025-12-25 05:11:50','2025-12-26 04:53:14');
INSERT INTO artista VALUES(68,'Claudia Lazo Gajardo','Paper pupy','claudialazo.gajardo@gmail.com','{"instagram":"https://www.instagram.com/paperpupy"}','La Serena','Chile','paper-pupy','2025-12-25 05:11:50','2025-12-26 04:53:14');
INSERT INTO artista VALUES(69,'Javiera Génesis Gonzalez Trujillo','Peliitos','pelitos.pelitos123@gmail.com','{"instagram":"https://www.instagram.com/_peliitos_"}','La Serena','Chile','peliitos','2025-12-25 05:11:50','2025-12-26 04:53:15');
INSERT INTO artista VALUES(70,NULL,'Planea papeleria','rocio.medina.h@gmail.com','{"instagram":"https://www.instagram.com/planeapapeleria/"}','La Serena','Chile','planea-papeleria','2025-12-25 05:11:50','2025-12-26 04:53:16');
INSERT INTO artista VALUES(71,'Marcelo Tapia','Solid Ediciones','disenorgb@gmail.com','{"instagram":"https://www.instagram.com/solidediciones/","facebook":"https://web.facebook.com/solidediciones"}','La Serena','Chile','solid-ediciones','2025-12-25 05:11:50','2025-12-26 04:53:17');
INSERT INTO artista VALUES(72,NULL,'Sueño de Pajaro','suenodepajaro@gmail.com','{"instagram":"https://www.instagram.com/suenodepajaro/"}','Vicuña','Chile','sueno-de-pajaro','2025-12-25 05:11:50','2025-12-26 04:53:17');
INSERT INTO artista VALUES(73,NULL,'Tekaeme','tekaemeilustraciones@gmail.com','{"instagram":"https://www.instagram.com/tekaeme____/"}','Coquimbo','Chile','tekaeme','2025-12-25 05:11:50','2025-12-26 04:53:18');
INSERT INTO artista VALUES(74,NULL,'Ruvale','ruvale123@gmail.com','{"instagram":"https://www.instagram.com/ruruvale/"}','La Serena','Chile','ruvale','2025-12-25 05:11:50','2025-12-26 04:53:19');
INSERT INTO artista VALUES(75,NULL,'WasabiPNG','powerpowmail@gmail.com','{"instagram":"https://www.instagram.com/sgt_wasabi/"}','La Serena','Chile','wasabipng','2025-12-25 05:11:50','2025-12-26 04:53:19');
INSERT INTO artista VALUES(76,NULL,'Ilustravel','holavelgato@gmail.com','{"instagram":"https://www.instagram.com/bel.ilustravel/"}','La Serena','Chile','ilustravel','2025-12-25 05:11:50','2025-12-26 04:53:20');
INSERT INTO artista VALUES(77,NULL,'Intercultural Arte','josecifuentes983@gmail.com','{"instagram":"https://www.instagram.com/intercultural_arte_/"}','La Serena','Chile','intercultural-arte','2025-12-25 05:11:50','2025-12-26 04:53:21');
INSERT INTO artista VALUES(78,NULL,'Tierramarga','c.diazt92@gmail.com','{"instagram":"https://www.instagram.com/_tierramarga/"}','La Serena','Chile','tierramarga','2025-12-25 05:11:50','2025-12-26 04:53:22');
INSERT INTO artista VALUES(79,NULL,'Ensimismada','ensimismada00@gmail.com','{"instagram":"https://www.instagram.com/ensimismada.cl/"}','La Serena','Chile','ensimismada','2025-12-25 05:11:50','2025-12-26 04:53:22');
INSERT INTO artista VALUES(80,'Karen Valenzuela','Prrr Miaow','karenvalen.diseno@gmail.com','{"instagram":"https://www.instagram.com/prrr.miaow?igsh=MTlxdDE4cDZ2aGx1cA==","facebook":"https://web.facebook.com/Prrr-Miaow-179920085887390/"}','La Serena','Chile','prrr-miaow','2025-12-25 05:11:50','2025-12-26 04:53:23');
INSERT INTO artista VALUES(81,'Javier Carvajal Ramirez','Javo_Siniestro','javosiniestre@gmail.com','{"instagram":"https://www.instagram.com/javo_siniestro/","facebook":"https://web.facebook.com/siniestre/"}','La Serena','Chile','javo-siniestro','2025-12-25 05:11:50','2025-12-26 04:53:24');
INSERT INTO artista VALUES(82,NULL,'Coticocodrila','Holacoticocodrila@gmail.com','{"instagram":"https://www.instagram.com/coticocodrila/"}','La Serena','Chile','coticocodrila','2025-12-25 05:11:50','2025-12-26 04:53:24');
INSERT INTO artista VALUES(83,NULL,'Cat_linaa_art','och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/cat_linaa_art/"}','La Serena','Chile','cat-linaa-art','2025-12-25 05:11:50','2025-12-26 04:53:25');
INSERT INTO artista VALUES(84,NULL,'Namine Anami','namineanami@gmail.com','{"instagram":"https://www.instagram.com/namineanami/"}','La Serena','Chile','namine-anami','2025-12-25 05:11:50','2025-12-26 04:53:26');
INSERT INTO artista VALUES(85,NULL,'Cazar al tiburon','f.zambranoaviles@gmail.com','{"instagram":"https://www.instagram.com/cazaraltiburon.cl/"}','La Serena','Chile','cazar-al-tiburon','2025-12-25 05:11:50','2025-12-26 04:53:27');
INSERT INTO artista VALUES(86,NULL,'Tati San Martin','tatimartin333@gmail.com','{"instagram":"https://www.instagram.com/tatimartin_artista/"}','La Serena','Chile','tati-san-martin','2025-12-25 05:11:50','2025-12-26 04:53:28');
INSERT INTO artista VALUES(87,NULL,'p0chi_kun','och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/p0chi_kun/"}','La Serena','Chile','p0chi-kun','2025-12-25 05:11:50','2025-12-26 04:53:26');
INSERT INTO artista VALUES(88,'Gabriela Contreras Arancibia','Blue Straycatt Art','gabriela95_contreras@hotmail.com','{"instagram":"https://www.instagram.com/blue_straycatt_art/"}','Coquimbo','Chile','blue-straycatt-art','2025-12-27 04:02:27','2025-12-27 04:02:27');
INSERT INTO artista VALUES(89,'Daniel Allende','Danyfoo','danyfoo.art@gmail.com','{"instagram":"https://www.instagram.com/danyfoo_art/","facebook":"https://web.facebook.com/Danyfooart/"}','Coquimbo','Chile','danyfoo','2025-12-27 04:02:29','2025-12-27 04:02:29');
INSERT INTO artista VALUES(90,'Cristian Correa Zuleta','Darkos','darkoscorreaz@gmail.com','{"instagram":"https://www.instagram.com/darkoscorrea/"}','Coquimbo','Chile','darkos','2025-12-27 04:02:29','2025-12-27 04:02:29');
INSERT INTO artista VALUES(91,'Francisco Toro','Decay','f-toro@live.cl','{"instagram":"https://www.instagram.com/decay.ink/","facebook":"https://web.facebook.com/decaying.ink/"}','Coquimbo','Chile','decay','2025-12-27 04:02:30','2025-12-27 04:02:30');
INSERT INTO artista VALUES(92,'Gabriela Elgueta','Drömmer Art','drommer.art@gmail.com','{"instagram":"https://www.instagram.com/drommer_art/"}','Coquimbo','Chile','drommer-art','2025-12-27 04:02:31','2025-12-27 04:02:31');
INSERT INTO artista VALUES(93,'Claudia Tardito Herreros','Groteska','hola@groteska.cl','{"instagram":"https://www.instagram.com/lagroteska/"}','Coquimbo','Chile','groteska','2025-12-27 04:02:32','2025-12-27 04:02:32');
INSERT INTO artista VALUES(94,'Jonathan Barraza Veas','Jonariel','jonathanbv.1995@gmail.com','{"instagram":"https://www.instagram.com/jonariel20/","facebook":"https://web.facebook.com/JonAriel20"}','Coquimbo','Chile','jonariel','2025-12-27 04:02:33','2025-12-27 04:02:33');
INSERT INTO artista VALUES(95,'Judy Helena Malla','JudyDoodles','j.helenita@gmail.com','{"instagram":"https://www.instagram.com/judy_doodles/","facebook":"https://web.facebook.com/judydoodles/"}','Coquimbo','Chile','judydoodles','2025-12-27 04:02:34','2025-12-27 04:02:34');
INSERT INTO artista VALUES(96,'Lucas Alvayay Durand','La Nueve Ce','richarhoos@gmail.com','{"instagram":"https://www.instagram.com/lanuevece/?hl=es-la"}','Coquimbo','Chile','la-nueve-ce','2025-12-27 04:02:35','2025-12-27 04:02:35');
INSERT INTO artista VALUES(97,'Felipe Orlando Larco Mondaca','Larcolepsia','larcolerico@gmail.com','{"instagram":"https://www.instagram.com/larcolepsia/?hl=es-la"}','Coquimbo','Chile','larcolepsia','2025-12-27 04:02:35','2025-12-27 04:02:35');
INSERT INTO artista VALUES(98,'Maximiliano Roco','MaxRoco','maxroco@gmail.com','{"instagram":"https://www.instagram.com/proyectomaxroco/","facebook":"https://web.facebook.com/proyectomaxroco/"}','Coquimbo','Chile','maxroco','2025-12-27 04:02:35','2025-12-27 04:02:35');
INSERT INTO artista VALUES(99,'Daniel Alvarez Vega','MonHaku','danielart.195@gmail.com','{"instagram":"https://www.instagram.com/hakuya_kou/"}','Coquimbo','Chile','monhaku','2025-12-27 04:02:36','2025-12-27 04:02:36');
INSERT INTO artista VALUES(100,'Matias Edurado Palominos Alarcón','Mr. Palominos','mpalominosa@gmail.com','{"instagram":"https://www.instagram.com/malosjuguetes/"}','Coquimbo','Chile','mr-palominos','2025-12-27 04:02:37','2025-12-27 04:02:37');
INSERT INTO artista VALUES(101,'Arlett Vanessa Carvaja','Mysterylol','mysterylolxd@gmail.com','{"instagram":"https://www.instagram.com/dibujan2_anim3/"}','Coquimbo','Chile','mysterylol','2025-12-27 04:02:38','2025-12-27 04:02:38');
INSERT INTO artista VALUES(102,'Nevenka Sophia Silva González','Neve.nes','neve.90@gmail.com','{"instagram":"https://www.instagram.com/neve.nes/","facebook":"https://web.facebook.com/Nevenka.Silva.G/"}','Coquimbo','Chile','nevenes','2025-12-27 04:02:38','2025-12-27 04:02:38');
INSERT INTO artista VALUES(103,'Samuel Araya','Samuel Araya C Artwork (Florido)','samuel.araya.c@gmail.com','{"instagram":"https://www.instagram.com/samarayaart/","facebook":"https://web.facebook.com/Samuelarayac.artworks/"}','Coquimbo','Chile','samuel-araya-c-artwork-florido','2025-12-27 04:02:40','2025-12-27 04:02:40');
INSERT INTO artista VALUES(104,'Johanina Alfaro Rojas','Simio','johaalfarorojas@gmail.com','{"instagram":"https://www.instagram.com/il_simiox/"}','Coquimbo','Chile','simio','2025-12-27 04:02:40','2025-12-27 04:02:40');
INSERT INTO artista VALUES(105,'Solange Pacheco Ortiz','Sol Pacheco','solangepacheco.sp@gmail.com',NULL,'Coquimbo','Chile','sol-pacheco','2025-12-27 04:02:41','2025-12-27 04:02:41');
INSERT INTO artista VALUES(106,NULL,'Tommy Astorga','tepunto@gmail.com','{"instagram":"https://www.instagram.com/tommyastorga/","facebook":"https://web.facebook.com/AstorgaTommy/"}','Coquimbo','Chile','tommy-astorga','2025-12-27 04:02:42','2025-12-27 04:02:42');
INSERT INTO artista VALUES(107,'Andrea Diaz Godoy','Andreadiasnublados','andriusday93@gmail.com','{"artstation":"https://www.artstation.com/andreadiasnublados"}','Coquimbo','Chile','andreadiasnublados','2025-12-27 04:02:42','2025-12-27 04:02:42');
INSERT INTO artista VALUES(108,'Nicole Alexa Astorga Vega','exe.cute.me','nicomccurdy@gmail.com','{"instagram":"https://www.instagram.com/exe.cute.me/"}','Illapel','Chile','executeme','2025-12-27 04:02:43','2025-12-27 04:02:43');
INSERT INTO artista VALUES(109,'Antoniett Rivera Maya','Abejas Negras (Niett)','ant.rivv@gmail.com','{"instagram":"https://www.instagram.com/abejasnegras/"}','La Serena','Chile','abejas-negras-niett','2025-12-27 04:02:44','2025-12-27 04:02:44');
INSERT INTO artista VALUES(110,'Elba Gamonal Ruiz-Crespo','Agua de Quisco','elbagamonal@gmail.com','{"instagram":"https://www.instagram.com/agua_de_quisco_ilustraciones/"}','La Serena','Chile','agua-de-quisco','2025-12-27 04:02:44','2025-12-27 04:02:44');
INSERT INTO artista VALUES(111,'Benjamin Vega Rodriguez','Aitue','benja.vega0799@gmail.com','{"instagram":"https://www.instagram.com/aitue_art/?hl=es-la"}','La Serena','Chile','aitue','2025-12-27 04:02:45','2025-12-27 04:02:45');
INSERT INTO artista VALUES(112,'Margareth Gricell Contreras Mondaca','Amaggieanthine','margareth.gricell@gmail.com','{"instagram":"https://www.instagram.com/_thanksthestars_/"}','La Serena','Chile','amaggieanthine','2025-12-27 04:02:46','2025-12-27 04:02:46');
INSERT INTO artista VALUES(113,'Valentina Aurora Ravello Argandoña','Aurora Ravello','valeravello1@gmail.com','{"instagram":"https://www.instagram.com/aurora_ravello/"}','La Serena','Chile','aurora-ravello','2025-12-27 04:02:47','2025-12-27 04:02:47');
INSERT INTO artista VALUES(114,'Camila Olivares/Jose Flores','Camipepe','camiiipepe@gmail.com','{"instagram":"https://www.instagram.com/camiipepe/","facebook":"https://web.facebook.com/camiipepee/"}','La Serena','Chile','camipepe','2025-12-27 04:02:47','2025-12-27 04:02:47');
INSERT INTO artista VALUES(115,'Fiorella Tosetti Contreras','Caotica Ilustrada','caotica.siempre@gmail.com','{"instagram":"https://www.instagram.com/caotica_ilustrada/","facebook":"https://web.facebook.com/caotica.ilustrada.7"}','La Serena','Chile','caotica-ilustrada','2025-12-27 04:02:50','2025-12-27 04:02:50');
INSERT INTO artista VALUES(116,'Elisa Carolina Piñones','Caro PZ','caroi.uleta@gmail.com','{"instagram":"https://www.instagram.com/_karo.pezeta_/"}','La Serena','Chile','caro-pz','2025-12-27 04:02:52','2025-12-27 04:02:52');
INSERT INTO artista VALUES(117,'Belen Aguilar','CLEIB','beleaguilar23@gmail.com','{"instagram":"https://www.instagram.com/_cleib/","facebook":"https://web.facebook.com/Bel%C3%A9n-Aguilar-152951941518422/"}','La Serena','Chile','cleib','2025-12-27 04:02:53','2025-12-27 04:02:53');
INSERT INTO artista VALUES(118,'Romina Villegas','Collarcitos RV','cabezaortopedica@gmail.com','{"instagram":"https://www.instagram.com/collarcitosrv/","facebook":"https://web.facebook.com/Collarcitos"}','La Serena','Chile','collarcitos-rv','2025-12-27 04:02:54','2025-12-27 04:02:54');
INSERT INTO artista VALUES(119,'Cristian Marin','Cris Crowfin','cristian.p.marin@gmail.com','{"instagram":"https://www.instagram.com/crowfin_art/","facebook":"https://web.facebook.com/Cris-Crowfin-866981636665660/"}','La Serena','Chile','cris-crowfin','2025-12-27 04:02:57','2025-12-27 04:02:57');
INSERT INTO artista VALUES(120,'Daniella Le-Brauer','Dani Lee','danille28@gmail.com','{"instagram":"https://www.instagram.com/dani_lee_astro_art/","facebook":"https://www.facebook.com/DaniLeeArt28/"}','La Serena','Chile','dani-lee','2025-12-27 04:02:57','2025-12-27 04:02:57');
INSERT INTO artista VALUES(121,'Francisca Alejandra Silva Piña','Diseños Pineapple','francisca.silva.2002@gmail.com','{"instagram":"https://www.instagram.com/disenospineapple/","facebook":"https://www.facebook.com/franciscapineapple/"}','La Serena','Chile','disenos-pineapple','2025-12-27 04:02:58','2025-12-27 04:02:58');
INSERT INTO artista VALUES(122,'Romina Aguilera Zuñiga','Diskettes.ink','dizked.art@gmail.com','{"instagram":"https://www.instagram.com/diskettes.ink/","facebook":"https://web.facebook.com/dizked.art/"}','La Serena','Chile','diskettesink','2025-12-27 04:02:58','2025-12-27 04:02:58');
INSERT INTO artista VALUES(123,'Christian Herrera','DragoNest Studio','herrera.chris95@gmail.com','{"instagram":"https://www.instagram.com/chriss.herrera/","facebook":"https://web.facebook.com/chrisherrera95/"}','La Serena','Chile','dragonest-studio','2025-12-27 04:03:00','2025-12-27 04:03:00');
INSERT INTO artista VALUES(124,'Iván Andrés Jorquera Olivares','elMeNeSe','ivanjorquera.o@gmail.com','{"instagram":"https://www.instagram.com/elmenese/","web":"http://www.ivanjorquera.cl/"}','La Serena','Chile','elmenese','2025-12-27 04:03:01','2025-12-27 04:03:01');
INSERT INTO artista VALUES(125,'Harold Olivares Sarmiento','HOS','hos.artes@gmail.com','{"instagram":"https://www.instagram.com/hos.art/","facebook":"https://web.facebook.com/hos.artes/"}','La Serena','Chile','hos','2025-12-27 04:03:01','2025-12-27 04:03:01');
INSERT INTO artista VALUES(126,'Ignacio Israel Valdivia Avalos','Ignacio Gato','ignacio.kittycat@gmail.com','{"instagram":"https://www.instagram.com/ignacio_gato_/"}','La Serena','Chile','ignacio-gato','2025-12-27 04:03:03','2025-12-27 04:03:03');
INSERT INTO artista VALUES(127,'Sofia Rivera','Inky Cotton',NULL,'{"instagram":"https://www.instagram.com/inkycotton/"}','La Serena','Chile','inky-cotton','2025-12-27 04:03:03','2025-12-27 04:03:03');
INSERT INTO artista VALUES(128,'Isabela Adaos Véliz','Isa Edaliz','isaedaliz@gmail.com','{"instagram":"https://www.instagram.com/isaedaliz/"}','La Serena','Chile','isa-edaliz','2025-12-27 04:03:04','2025-12-27 04:03:04');
INSERT INTO artista VALUES(129,'José Ignacio Cifuentes Pizarro','Jotace','jc.dibujos@gmail.com','{"instagram":"https://www.instagram.com/jotace_dibujos/"}','La Serena','Chile','jotace','2025-12-27 04:03:04','2025-12-27 04:03:04');
INSERT INTO artista VALUES(130,'Catalina Ramirez','Katassj','katassjilustra53@gmail.com','{"instagram":"https://www.instagram.com/katassj/?hl=es-la"}','La Serena','Chile','katassj','2025-12-27 04:03:06','2025-12-27 04:03:06');
INSERT INTO artista VALUES(131,'Sofía Rojas Meza','Keimara','sofiarojasmeza@gmail.com','{"instagram":"https://www.instagram.com/_keimara/"}','La Serena','Chile','keimara','2025-12-27 04:03:06','2025-12-27 04:03:06');
INSERT INTO artista VALUES(132,'Francisca Rayen Riquelme Araya','Khira Yoshi','onyx.yue@gmail.com','{"instagram":"https://www.instagram.com/khirayoshi/","facebook":"https://web.facebook.com/KhiraYoshi/"}','La Serena','Chile','khira-yoshi','2025-12-27 04:03:07','2025-12-27 04:03:07');
INSERT INTO artista VALUES(133,'Noelia Guerra Flores','Kompas Ilustration','dallamokompas@gmail.com','{"instagram":"https://www.instagram.com/kompas_ilu/","facebook":"https://web.facebook.com/kompasillustration/"}','La Serena','Chile','kompas-ilustration','2025-12-27 04:03:07','2025-12-27 04:03:07');
INSERT INTO artista VALUES(134,'Francisca Casanova','KybArt','byeongari.hun@gmail.com','{"instagram":"https://www.instagram.com/kyb_art/"}','La Serena','Chile','kybart','2025-12-27 04:03:08','2025-12-27 04:03:08');
INSERT INTO artista VALUES(135,'Tamara Sepúlveda','Lady Beelze','tamarasepul@gmail.com','{"instagram":"https://www.instagram.com/ladybeelze/"}','La Serena','Chile','lady-beelze','2025-12-27 04:03:09','2025-12-27 04:03:09');
INSERT INTO artista VALUES(136,'Yarela Briceño Volta','Manitas E Gato','manitasegato@gmail.com','{"instagram":"https://www.instagram.com/manitas_e_gato/","facebook":"https://web.facebook.com/manitasegato/"}','La Serena','Chile','manitas-e-gato','2025-12-27 04:03:09','2025-12-27 04:03:09');
INSERT INTO artista VALUES(137,'Soffia Chirino Montaño','Mermaid Curse','scchirinom@gmail.com','{"instagram":"https://www.instagram.com/mermaidcurse.art/","facebook":"https://web.facebook.com/mermaid.curseart/"}','La Serena','Chile','mermaid-curse','2025-12-27 04:03:11','2025-12-27 04:03:11');
INSERT INTO artista VALUES(138,'Francesca Gamboni Núñez','Momofurambu','fran.gamboni@gmail.com','{"instagram":"https://www.instagram.com/__franbuesa/"}','La Serena','Chile','momofurambu','2025-12-27 04:03:12','2025-12-27 04:03:12');
INSERT INTO artista VALUES(139,'Rene Araya','Neeh Re','rene.f.arayaramirez@gmail.com','{"instagram":"https://www.instagram.com/neeh_re/"}','La Serena','Chile','neeh-re','2025-12-27 04:03:13','2025-12-27 04:03:13');
INSERT INTO artista VALUES(140,'Vanessa Gonzalez Schifferli','Nerdy Roll','vanessa.260601@gmail.com','{"facebook":"https://web.facebook.com/NerdyRoll/"}','La Serena','Chile','nerdy-roll','2025-12-27 04:03:14','2025-12-27 04:03:14');
INSERT INTO artista VALUES(141,'Alan Salinas Angel','Noctam','alansalinasangel@gmail.com','{"instagram":"https://www.instagram.com/noctam.ilustra/","facebook":"https://web.facebook.com/noctam.ilustra/"}','La Serena','Chile','noctam','2025-12-27 04:03:15','2025-12-27 04:03:15');
INSERT INTO artista VALUES(142,'Fernanda Aguirre Mussa','No Me Dicen Fer','fer.aguirre4@gmail.com','{"instagram":"https://www.instagram.com/nomedicenfer/","facebook":"https://web.facebook.com/nomedicenfer/"}','La Serena','Chile','no-me-dicen-fer','2025-12-27 04:03:16','2025-12-27 04:03:16');
INSERT INTO artista VALUES(143,'Karla Jeraldo','No Soy Tan Cool','nosoytancool@gmail.com','{"facebook":"https://web.facebook.com/nosoytancool.illustration/"}','La Serena','Chile','no-soy-tan-cool','2025-12-27 04:03:16','2025-12-27 04:03:16');
INSERT INTO artista VALUES(144,'Pablo Fernández Araya','Pablo Design','pablojfernandezaraya@gmail.com','{"instagram":"https://www.instagram.com/pablofernandez.diseno/"}','La Serena','Chile','pablo-design','2025-12-27 04:03:17','2025-12-27 04:03:17');
INSERT INTO artista VALUES(145,'Daniela Véliz Baeza','Pezenunpapel','pezenunpapel@gmail.com','{"instagram":"https://www.instagram.com/pezenunpapel/","facebook":"https://web.facebook.com/pezenunpapel/"}','La Serena','Chile','pezenunpapel','2025-12-27 04:03:19','2025-12-27 04:03:19');
INSERT INTO artista VALUES(146,'Anselmo Grandon','Pez Monstruo (Mo)','anselmo.grahen@gmail.com','{"instagram":"https://www.instagram.com/pezmonstruo/"}','La Serena','Chile','pez-monstruo-mo','2025-12-27 04:03:21','2025-12-27 04:03:21');
INSERT INTO artista VALUES(147,'Carolina Puerta','PinkuNina (nina racoon)','pinkbang.nina@gmail.com','{"instagram":"https://www.instagram.com/pinku_nina/","facebook":"https://web.facebook.com/PinkuNina/"}','La Serena','Chile','pinkunina-nina-racoon','2025-12-27 04:03:21','2025-12-27 04:03:21');
INSERT INTO artista VALUES(148,'Camila Fernandez','Planta Verde','plantaaverde@gmail.com','{"instagram":"https://www.instagram.com/plantaaverdeart/","facebook":"https://web.facebook.com/plantaaverde/"}','La Serena','Chile','planta-verde','2025-12-27 04:03:22','2025-12-27 04:03:22');
INSERT INTO artista VALUES(149,'Sophia Dianne Sánchez D''Arcangeli','Poppy','darcangeli764@gmail.com','{"instagram":"https://www.instagram.com/_poppyxd_/"}','La Serena','Chile','poppy','2025-12-27 04:03:24','2025-12-27 04:03:24');
INSERT INTO artista VALUES(150,'Pablo Marambio Costagliola','Raigmann (GalactikPainting)','pablomarambio.marambio@gmail.com','{"deviantart":"https://www.deviantart.com/raigmann"}','La Serena','Chile','raigmann-galactikpainting','2025-12-27 04:03:25','2025-12-27 04:03:25');
INSERT INTO artista VALUES(151,'Daniel Muñoz','Reptilians','st.daniel.ark@gmail.com','{"instagram":"https://www.instagram.com/reptillians.attack/","facebook":"https://www.facebook.com/reptillian.demons/"}','La Serena','Chile','reptilians','2025-12-27 04:03:25','2025-12-27 04:03:25');
INSERT INTO artista VALUES(152,'Carolina Angélica Barraza Cortés','Shiemi-Hime','shiemi.purr@gmail.com','{"instagram":"https://www.instagram.com/shiemi_hime/","facebook":"https://web.facebook.com/ShiemiHime/"}','La Serena','Chile','shiemi-hime','2025-12-27 04:03:26','2025-12-27 04:03:26');
INSERT INTO artista VALUES(153,'Valentina Zepeda Jopia','Shishi de Colores (Vandaloves)','valentinaandrea.zepeda@gmail.com','{"instagram":"https://www.instagram.com/shishidecolores/","facebook":"https://web.facebook.com/shishidecolores/"}','La Serena','Chile','shishi-de-colores-vandaloves','2025-12-27 04:03:26','2025-12-27 04:03:26');
INSERT INTO artista VALUES(154,'Sofía Alexandra Marambio Cortés','Sofi_niscus','sofiadango19@gmail.com','{"instagram":"https://www.instagram.com/sofi_niscus/"}','La Serena','Chile','sofiniscus','2025-12-27 04:03:27','2025-12-27 04:03:27');
INSERT INTO artista VALUES(155,'Francisca Cortes Santander','Stay Cactus','francilucortes@gmail.com','{"instagram":"https://www.instagram.com/staycactusfanzine/","facebook":"https://web.facebook.com/staycactus/"}','La Serena','Chile','stay-cactus','2025-12-27 04:03:28','2025-12-27 04:03:28');
INSERT INTO artista VALUES(156,'Sol Morales','Sun morales','sunmorales35@gmail.com','{"instagram":"https://www.instagram.com/sunmorales/","facebook":"https://web.facebook.com/SunmoralesB/"}','La Serena','Chile','sun-morales','2025-12-27 04:03:30','2025-12-27 04:03:30');
INSERT INTO artista VALUES(157,'Carla Vargas','The Bunny Art','vargascastro.c@gmail.com','{"instagram":"https://www.instagram.com/c.vargasc/","facebook":"https://www.facebook.com/carla.vargascastro"}','La Serena','Chile','the-bunny-art','2025-12-27 04:03:31','2025-12-27 04:03:31');
INSERT INTO artista VALUES(158,'Alonso Martinez','Tigre Maltés','alonsomartinez07@gmail.com','{"instagram":"https://www.instagram.com/tigre_maltes/","facebook":"https://web.facebook.com/tigremaltes/"}','La Serena','Chile','tigre-maltes','2025-12-27 04:03:33','2025-12-27 04:19:37');
INSERT INTO artista VALUES(159,'Camila Belén Arévalo Cabrera','Tsuki','camila.barevalo@gmail.com','{"instagram":"https://www.instagram.com/blanchettetsuki","facebook":"https://www.fb.com/Tsukiarte"}','La Serena','Chile','tsuki','2025-12-27 04:03:33','2025-12-27 04:03:33');
INSERT INTO artista VALUES(160,'Vallery Lorca Toledo','Valerie Lorca','vallery.lorca@hotmail.es','{"instagram":"https://www.instagram.com/valerie_lorca/"}','La Serena','Chile','valerie-lorca','2025-12-27 04:03:35','2025-12-27 04:03:35');
INSERT INTO artista VALUES(161,'Valentina Fernanda Fuentealba Palavicino','VALESTRINA','valestrina4@gmail.com','{"instagram":"https://www.instagram.com/valestrina_art/","tapas":"https://tapas.io/series/KUSH-ES"}','La Serena','Chile','valestrina','2025-12-27 04:03:37','2025-12-27 04:03:37');
INSERT INTO artista VALUES(162,'Victor Ledezma Vega','Victor Illustrations','victor.ledezma.vega@gmail.com','{"instagram":"https://www.instagram.com/victor_illustrations/","behance":"https://www.behance.net/VictorLedezma"}','La Serena','Chile','victor-illustrations','2025-12-27 04:03:37','2025-12-27 04:03:37');
INSERT INTO artista VALUES(163,'Constanza valentina godoy Díaz','Yucenkio','constanza.pgb.2016@gmail.com','{"instagram":"https://www.instagram.com/yucenkio/"}','La Serena','Chile','yucenkio','2025-12-27 04:03:38','2025-12-27 04:03:38');
INSERT INTO artista VALUES(164,'Camila Rivera','Internet Princess',NULL,'{"instagram":"https://www.instagram.com/miss.camomille/","facebook":"https://web.facebook.com/InternettPrincess/"}','La Serena','Chile','internet-princess','2025-12-27 04:03:39','2025-12-27 04:03:39');
INSERT INTO artista VALUES(165,'Consuelo Valentina Huerta Pereira','Co(Mentedemente)','consuelo.huerta@outlook.com','{"instagram":"https://www.instagram.com/co.mentedemente/"}','Ovalle','Chile','comentedemente','2025-12-27 04:03:39','2025-12-27 04:03:39');
INSERT INTO artista VALUES(166,'Giovanna Baldecchi Varela','Olyves (ex Moriciel)','azumaltrejo@gmail.com','{"instagram":"https://www.instagram.com/moriciel_/","facebook":"https://web.facebook.com/Giovy-293827087299049/"}','Tongoy','Chile','olyves-ex-moriciel','2025-12-27 04:03:40','2025-12-27 04:03:40');
INSERT INTO artista VALUES(167,'Felipe de Ferari Prats','Felipe de Ferari','felipedeferari@gmail.com','{"instagram":"https://www.instagram.com/felipedeferari/","facebook":"https://web.facebook.com/Artes-Visuales-Felipe-De-Ferari-wwwdeferaricl-130585523670889/"}','La Serena','Chile','felipe-de-ferari','2025-12-27 04:03:43','2025-12-27 04:03:43');
INSERT INTO artista VALUES(168,'Carolina Aguirre','We Are Tea','carolina.aguirre.skarlis@gmail.com','{"instagram":"https://www.instagram.com/we.are.tea.ilustraciones/","tumblr":"https://wearetea.tumblr.com/"}','La Serena','Chile','we-are-tea','2025-12-27 04:03:43','2025-12-27 04:03:43');
INSERT INTO artista VALUES(169,'Nicolas Torres','Nico el Mito','nicolas.torrestapia@gmail.com','{"instagram":"https://www.instagram.com/nicoelmito/","facebook":"https://web.facebook.com/nicoelmito/"}','La Serena','Chile','nico-el-mito','2025-12-27 04:03:44','2025-12-27 04:03:44');
INSERT INTO artista VALUES(170,'Cynthia Vega','Kio PsicodelicArt','cynthia.vega@gmail.com','{"facebook":"https://web.facebook.com/Kio-PsicodelicArt-1711808738837633/"}','La Serena','Chile','kio-psicodelicart','2025-12-27 04:03:45','2025-12-27 04:03:45');
INSERT INTO artista VALUES(171,'Bryan Bautista Correa','Crazy Monkey','cm.diseno7@gmail.com','{"facebook":"https://web.facebook.com/crazymonkeydesing/"}','Coquimbo','Chile','crazy-monkey','2025-12-27 04:03:46','2025-12-27 04:03:46');
INSERT INTO artista VALUES(172,'Lia Ponce Montecinos','Bubble Trafic','liarqponce@gmail.com','{"instagram":"https://www.instagram.com/bubbletrafic/","facebook":"https://web.facebook.com/BuuubbleTraaafic/"}','Coquimbo','Chile','bubble-trafic','2025-12-27 04:03:46','2025-12-27 04:03:46');
INSERT INTO artista VALUES(173,'André Alejandro Pizarro','André','aerograndes@gmail.com','{"instagram":"https://www.instagram.com/andrekamin/","facebook":"https://web.facebook.com/andre.alejand"}','Ovalle','Chile','andre','2025-12-27 04:03:47','2025-12-27 04:03:47');
INSERT INTO artista VALUES(174,'Pamela Alejandra Contreras Guerra','Alza el Vuelo','pamela.contreras@live.com','{"instagram":"https://www.instagram.com/tiendalzaelvuelo/","facebook":"https://www.facebook.com/Alza-el-vuelo-860809420599226/"}','La Serena','Chile','alza-el-vuelo','2025-12-27 04:03:48','2025-12-27 04:03:48');
INSERT INTO artista VALUES(175,'Ellizabeth Fernanda Araya Loyola','Anticática Accesorios','ellizabeth.araya@gmail.com','{"instagram":"https://www.instagram.com/anti.accesorios/"}','Ovalle','Chile','anticatica-accesorios','2025-12-27 04:03:49','2025-12-27 04:03:49');
INSERT INTO artista VALUES(176,'Sebastian Oteiza','Antítesis Editorial','oteiza.sebastian@gmail.com','{"facebook":"https://web.facebook.com/EditorialAntitesis/"}','La Serena','Chile','antitesis-editorial','2025-12-27 04:03:49','2025-12-27 04:03:49');
INSERT INTO artista VALUES(177,'Karina Constanza Berríos Cortés','Artbutterfly','kony1288@gmail.com','{"instagram":"https://www.instagram.com/_artbutterfly_/","web":"https://unibles.com/Artbutterfly"}','La Serena','Chile','artbutterfly','2025-12-27 04:03:50','2025-12-27 04:03:50');
INSERT INTO artista VALUES(178,'Sofia Ramirez','Astronomical Patches',NULL,'{"facebook":"https://web.facebook.com/astronomicalpatch3s/"}','Coquimbo','Chile','astronomical-patches','2025-12-27 04:03:50','2025-12-27 04:03:50');
INSERT INTO artista VALUES(179,'Andrea Nicol Ledezma Díaz','BordabaMoza','andrea.ledezmad@gmail.com','{"instagram":"https://www.instagram.com/bordabamoza/"}','La Serena','Chile','bordabamoza','2025-12-27 04:03:51','2025-12-27 04:03:51');
INSERT INTO artista VALUES(180,'Pablo Durand Alegre','Brodat','p.durand.a@gmail.com','{"instagram":"https://www.instagram.com/tienda.brodat/"}','La Serena','Chile','brodat','2025-12-27 04:03:52','2025-12-27 04:03:52');
INSERT INTO artista VALUES(181,'Bastian Tello Campusano','Cala Cala Ká','botc@live.cl','{"facebook":"https://www.facebook.com/Editorial-Cala-Cala-k%C3%81-232505914219389/"}','La Serena','Chile','cala-cala-ka','2025-12-27 04:03:53','2025-12-27 04:03:53');
INSERT INTO artista VALUES(182,'Paula Gonzalez','Cielomenta','paual12021@gmail.com','{"facebook":"https://web.facebook.com/cielomentaaccesorios/"}','La Serena','Chile','cielomenta','2025-12-27 04:03:53','2025-12-27 04:03:53');
INSERT INTO artista VALUES(183,'Gonzalo Vilo','Experimental Lunch',NULL,NULL,'Coquimbo','Chile','experimental-lunch','2025-12-27 04:03:55','2025-12-27 04:03:55');
INSERT INTO artista VALUES(184,'Francisca Vergara','Flancito Store','fran.vergara94@gmail.com','{"facebook":"https://web.facebook.com/FlancitoStore/"}','La Serena','Chile','flancito-store','2025-12-27 04:03:56','2025-12-27 04:03:56');
INSERT INTO artista VALUES(185,'Guillermo Francisco Nuñez Perez','Guillermo Francisco','guillermo.francisco.n@gmail.com','{"instagram":"https://instagram.com/_guillermofrancisco"}','La Serena','Chile','guillermo-francisco','2025-12-27 04:03:58','2025-12-27 04:03:58');
INSERT INTO artista VALUES(186,'Marisol Ahumada Diaz','Gumis de Colores','maiteka2003@hotmail.com','{"facebook":"https://web.facebook.com/Gumisdecolores/"}','La Serena','Chile','gumis-de-colores','2025-12-27 04:03:59','2025-12-27 04:03:59');
INSERT INTO artista VALUES(187,'Felipe Monje Pinto','Hamabeads La Serena','hamabeads.ls2019@gmail.com','{"instagram":"https://www.instagram.com/hamabeads_ls/"}','La Serena','Chile','hamabeads-la-serena','2025-12-27 04:03:59','2025-12-27 04:03:59');
INSERT INTO artista VALUES(188,'Carolina Vivanco','Ivory Market','ivory.im.different@gmail.com','{"facebook":"https://web.facebook.com/IvoryMarket/"}','La Serena','Chile','ivory-market','2025-12-27 04:04:00','2025-12-27 04:04:00');
INSERT INTO artista VALUES(189,'Javiera Fernández Barahona','Javi Accesorios (ex Miko)','javieramfb@gmail.com',NULL,'La Serena','Chile','javi-accesorios-ex-miko','2025-12-27 04:04:00','2025-12-27 04:04:00');
INSERT INTO artista VALUES(190,'Evelyn Carolina Alday Espinosa','Kallfu','evelynalday@hotmail.com','{"instagram":"https://www.instagram.com/_kallfu_/","facebook":"https://web.facebook.com/kallfu.accesorios/"}','La Serena','Chile','kallfu','2025-12-27 04:04:01','2025-12-27 04:04:01');
INSERT INTO artista VALUES(191,NULL,'Kaptus','kaptusregalaydecora@gmail.com','{"facebook":"https://web.facebook.com/kaptus.ls/"}','Coquimbo','Chile','kaptus','2025-12-27 04:04:02','2025-12-27 04:04:02');
INSERT INTO artista VALUES(192,'Viviana Vega','Kguai Store','viviana.vegam@gmail.com','{"facebook":"https://web.facebook.com/kguai.store/"}','Vicuña','Chile','kguai-store','2025-12-27 04:04:02','2025-12-27 04:04:02');
INSERT INTO artista VALUES(193,NULL,'Koko',NULL,'{"instagram":"https://www.instagram.com/koko_diseno/"}','La Serena','Chile','koko','2025-12-27 04:04:03','2025-12-27 04:04:03');
INSERT INTO artista VALUES(194,'Andrea Aquea Carmona','Kusudumame','kusudamame0@gmail.com','{"instagram":"https://www.instagram.com/kusudamame_/","facebook":"https://web.facebook.com/kusudamame0/"}','La Serena','Chile','kusudumame','2025-12-27 04:04:03','2025-12-27 04:04:03');
INSERT INTO artista VALUES(195,'Karla Pineda','Limon Ventitas','k.p.angel93@gmail.com','{"facebook":"https://web.facebook.com/LimonVentitas/"}','Coquimbo','Chile','limon-ventitas','2025-12-27 04:04:05','2025-12-27 04:04:05');
INSERT INTO artista VALUES(196,NULL,'Macanudo Design','macanudo.design@gmail.com','{"facebook":"https://web.facebook.com/macanudo.design/"}','La Serena','Chile','macanudo-design','2025-12-27 04:04:06','2025-12-27 04:04:06');
INSERT INTO artista VALUES(197,'Paula Pacheco Orellana','Mallwa','paulapacheco.p@gmail.com','{"instagram":"https://www.instagram.com/mallwa_accesorios/"}','Coquimbo','Chile','mallwa','2025-12-27 04:04:06','2025-12-27 04:04:06');
INSERT INTO artista VALUES(198,'Carolina Casanova','Manitos de Quinqui','carolina.casanova.garcia@gmail.com','{"facebook":"https://web.facebook.com/manitosdequinqui/"}','Coquimbo','Chile','manitos-de-quinqui','2025-12-27 04:04:07','2025-12-27 04:04:07');
INSERT INTO artista VALUES(199,'Javiera Paz Carrillos Gonzalez','Mestiza Joyeria','javiera.carrillos@gmail.com','{"instagram":"https://www.instagram.com/mestizajoyeria/"}','Santiago','Chile','mestiza-joyeria','2025-12-27 04:04:08','2025-12-27 04:04:08');
INSERT INTO artista VALUES(200,'María Paulina Godoy Álvarez','Mi Colet','paaiflor@gmail.com','{"instagram":"https://www.instagram.com/micolet.ls/"}','La Serena','Chile','mi-colet','2025-12-27 04:04:09','2025-12-27 04:04:09');
INSERT INTO artista VALUES(201,'Melissa Osandon','Mi Chamaca','melissandon.araya@gmail.com','{"facebook":"https://web.facebook.com/michamacailustraciones/"}','La Serena','Chile','mi-chamaca','2025-12-27 04:04:09','2025-12-27 04:04:09');
INSERT INTO artista VALUES(202,'Elizabeth Pasmiño','Mi Croquera','elipasmino@gmail.com','{"instagram":"https://www.instagram.com/microquera/","facebook":"https://web.facebook.com/microquera/"}','Coquimbo','Chile','mi-croquera','2025-12-27 04:04:10','2025-12-27 04:04:10');
INSERT INTO artista VALUES(203,'Rocio Muñoz Morales','Moiris Design','moiris.design@gmail.com','{"instagram":"https://www.instagram.com/moiris.design/"}','La Serena','Chile','moiris-design','2025-12-27 04:04:12','2025-12-27 04:04:12');
INSERT INTO artista VALUES(204,'Nicole Ibarra Jara','Nicfotos','nicoleibarraj@gmail.com','{"instagram":"https://www.instagram.com/nicfotos/","behance":"https://www.behance.net/nicoleibarra"}','La Serena','Chile','nicfotos','2025-12-27 04:04:12','2025-12-27 04:04:12');
INSERT INTO artista VALUES(205,'Manuel Pereira Araya','Okato Design****','okatown@gmail.com','{"instagram":"https://www.instagram.com/okatodesign/","facebook":"https://web.facebook.com/disenos.okatodesign"}','La Serena','Chile','okato-design','2025-12-27 04:04:13','2025-12-27 04:04:13');
INSERT INTO artista VALUES(206,'Carolina Contreras Soto','Pochi Amigurumi','amigurumisosweet@gmail.com','{"facebook":"https://web.facebook.com/pochi.amigurumi"}','Coquimbo','Chile','pochi-amigurumi','2025-12-27 04:04:14','2025-12-27 04:04:14');
INSERT INTO artista VALUES(207,'Katterine del Rosario Aguilera Olivares','Primavera de Prados','primaveradeprados@gmail.com','{"instagram":"https://www.instagram.com/primaveradeprados/"}','La Serena','Chile','primavera-de-prados','2025-12-27 04:04:14','2025-12-27 04:04:14');
INSERT INTO artista VALUES(208,'Carolina Paz Garcia','Remolino','carolinapaz.garcia@outlook.com','{"facebook":"https://web.facebook.com/artesaniaremolino/"}','La Serena','Chile','remolino','2025-12-27 04:04:15','2025-12-27 04:04:15');
INSERT INTO artista VALUES(209,'Francisca Gonzales Cornejo','Soy de Lanita','fgc023@alumnos.ucn.cl','{"facebook":"https://web.facebook.com/soydelanita/"}','Coquimbo','Chile','soy-de-lanita','2025-12-27 04:04:15','2025-12-27 04:04:15');
INSERT INTO artista VALUES(210,'Rocío Josefa Segovia Sanchez','Tienda Shibarita','rocio001122@gmail.com','{"instagram":"https://www.instagram.com/tienda_shibarita/"}','Coquimbo','Chile','tienda-shibarita','2025-12-27 04:04:16','2025-12-27 04:04:16');
INSERT INTO artista VALUES(211,'Sol Vielma Ramos','Vicent Design','svr1906@gmail.com','{"instagram":"https://www.instagram.com/designvicent/"}','La Serena','Chile','vicent-design','2025-12-27 04:04:16','2025-12-27 04:04:16');
INSERT INTO artista VALUES(212,'Carlos Herrera','Carlos Herrera (Dragonest Studio)','cherreradraw@gmail.com','{"instagram": "https://www.instagram.com/carlosdracoherrera/", "behance": "https://www.behance.net/Chaos-Draco"}','La Serena','Chile','carlos-herrera-dragonest-studio','2025-12-27 04:14:01','2025-12-27 04:14:01');
INSERT INTO artista VALUES(213,NULL,'Philippe Sapiains','philippe.sapiains@gmail.com','{"instagram": "https://www.instagram.com/philippe.sapiains_artista/", "web": "https://philippesapiains.cl/"}','La Serena','Chile','philippe-sapiains','2025-12-27 04:17:15','2025-12-27 04:17:15');
INSERT INTO artista VALUES(214,NULL,'Gabriel Garvo',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(215,NULL,'Takamo',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(216,NULL,'Satin',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(217,NULL,'CaroCelis',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(218,NULL,'Sephko',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(219,NULL,'Papafritologia',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(220,NULL,'Juanca Cortes',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(221,NULL,'Nico Gonzales',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(222,NULL,'Rayaismo',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(223,NULL,'Pablo Delcielo',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(224,NULL,'Godersi',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista VALUES(225,NULL,'Emisario de Greda',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista VALUES(226,NULL,'Fakuta',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista VALUES(227,NULL,'A Veces Amanda',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista VALUES(228,NULL,'El Comodo Silencio de los que Hablan Poco',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista VALUES(229,NULL,'Los Animales Tambien Se Suicidan',NULL,NULL,NULL,NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
CREATE TABLE IF NOT EXISTS tipo_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uq_tipo_actividad_nombre UNIQUE (nombre)
);
INSERT INTO tipo_actividad VALUES(1,'Taller','Actividad práctica con participación de asistentes','2025-12-28 18:27:07','2025-12-28 19:09:23');
INSERT INTO tipo_actividad VALUES(2,'Charla','Presentación o conferencia','2025-12-28 18:27:07','2025-12-28 19:09:23');
INSERT INTO tipo_actividad VALUES(3,'Música','Presentación musical en vivo','2025-12-28 18:27:07','2025-12-28 19:09:23');
CREATE TABLE IF NOT EXISTS participante_exposicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_exposicion_participante 
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE CASCADE,
    CONSTRAINT fk_exposicion_disciplina 
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_exposicion_agrupacion 
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT uq_exposicion_participante UNIQUE (participante_id),
    CONSTRAINT chk_exposicion_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);
INSERT INTO participante_exposicion VALUES(1,1,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(2,2,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(3,3,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(4,4,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(5,5,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(6,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(7,7,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(8,8,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(9,9,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(10,10,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(11,11,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(12,12,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(13,13,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(14,14,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(15,15,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(16,16,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(17,17,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(18,18,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(19,19,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(20,20,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(21,21,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(22,22,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(23,23,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(24,24,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(25,25,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(26,26,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(27,27,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(28,28,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(29,29,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(30,30,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(31,31,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(32,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(33,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(34,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(35,35,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(36,36,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(37,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(38,38,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO participante_exposicion VALUES(39,39,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(40,40,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(41,41,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(42,42,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(43,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(44,44,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(45,45,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(46,46,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(47,47,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(48,48,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(49,49,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(50,50,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(51,51,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(52,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(53,53,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(54,54,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(55,55,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(56,56,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(57,57,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(58,58,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(59,59,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(60,60,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(61,61,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(62,62,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(63,63,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(64,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(65,65,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(66,66,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(67,67,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(68,68,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(69,69,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(70,70,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(71,71,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(72,72,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(73,73,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(74,74,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(75,75,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(76,76,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(77,77,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(78,78,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(79,79,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(80,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(81,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(82,82,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(83,83,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(84,84,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(85,85,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(86,86,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(87,87,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(88,88,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(89,89,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(90,90,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(91,91,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO participante_exposicion VALUES(92,92,1,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO participante_exposicion VALUES(93,93,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO participante_exposicion VALUES(94,94,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO participante_exposicion VALUES(95,95,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO participante_exposicion VALUES(96,96,1,NULL,'confirmado',NULL,'2025-12-27 04:32:59','2025-12-27 04:32:59');
INSERT INTO participante_exposicion VALUES(97,97,1,NULL,'confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO participante_exposicion VALUES(98,98,1,NULL,'confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO participante_exposicion VALUES(99,99,1,NULL,'confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO participante_exposicion VALUES(100,100,1,NULL,'confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO participante_exposicion VALUES(101,101,1,NULL,'confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO participante_exposicion VALUES(102,102,1,NULL,'confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO participante_exposicion VALUES(103,103,1,NULL,'confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO participante_exposicion VALUES(104,104,1,NULL,'confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO participante_exposicion VALUES(105,105,1,NULL,'confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO participante_exposicion VALUES(106,106,1,NULL,'confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO participante_exposicion VALUES(107,107,1,NULL,'confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO participante_exposicion VALUES(108,108,1,NULL,'confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO participante_exposicion VALUES(109,109,1,NULL,'confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO participante_exposicion VALUES(110,110,1,NULL,'confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO participante_exposicion VALUES(111,111,1,NULL,'confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO participante_exposicion VALUES(112,112,1,NULL,'confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO participante_exposicion VALUES(113,113,1,NULL,'confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO participante_exposicion VALUES(114,114,1,NULL,'confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO participante_exposicion VALUES(115,115,1,NULL,'confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO participante_exposicion VALUES(116,116,1,NULL,'confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO participante_exposicion VALUES(117,117,1,NULL,'confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO participante_exposicion VALUES(118,118,1,NULL,'confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO participante_exposicion VALUES(119,119,1,NULL,'confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO participante_exposicion VALUES(120,120,1,NULL,'confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO participante_exposicion VALUES(121,121,1,NULL,'confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO participante_exposicion VALUES(122,122,1,NULL,'confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO participante_exposicion VALUES(123,123,1,NULL,'confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO participante_exposicion VALUES(124,124,1,NULL,'confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO participante_exposicion VALUES(125,125,1,NULL,'confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO participante_exposicion VALUES(126,126,1,NULL,'confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO participante_exposicion VALUES(127,127,1,NULL,'confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO participante_exposicion VALUES(128,128,1,NULL,'confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO participante_exposicion VALUES(129,129,1,NULL,'confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO participante_exposicion VALUES(130,130,1,NULL,'confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO participante_exposicion VALUES(131,131,1,NULL,'confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO participante_exposicion VALUES(132,132,1,NULL,'confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO participante_exposicion VALUES(133,133,1,NULL,'confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO participante_exposicion VALUES(134,134,1,NULL,'confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO participante_exposicion VALUES(135,135,1,NULL,'confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO participante_exposicion VALUES(136,136,1,NULL,'confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO participante_exposicion VALUES(137,137,1,NULL,'confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO participante_exposicion VALUES(138,138,1,NULL,'confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO participante_exposicion VALUES(139,139,1,NULL,'confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO participante_exposicion VALUES(140,140,1,NULL,'confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO participante_exposicion VALUES(141,141,1,NULL,'confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO participante_exposicion VALUES(142,142,1,NULL,'confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO participante_exposicion VALUES(143,143,1,NULL,'confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO participante_exposicion VALUES(144,144,1,NULL,'confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO participante_exposicion VALUES(145,145,1,NULL,'confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO participante_exposicion VALUES(146,146,1,NULL,'confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO participante_exposicion VALUES(147,147,1,NULL,'confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO participante_exposicion VALUES(148,148,1,NULL,'confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO participante_exposicion VALUES(149,149,1,NULL,'confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO participante_exposicion VALUES(150,150,1,NULL,'confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO participante_exposicion VALUES(151,151,1,NULL,'confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO participante_exposicion VALUES(152,152,1,NULL,'confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO participante_exposicion VALUES(153,153,1,NULL,'confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO participante_exposicion VALUES(154,154,1,NULL,'confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO participante_exposicion VALUES(155,155,1,NULL,'confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO participante_exposicion VALUES(156,156,1,NULL,'confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO participante_exposicion VALUES(157,157,1,NULL,'confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO participante_exposicion VALUES(158,158,1,NULL,'confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO participante_exposicion VALUES(159,159,1,NULL,'confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO participante_exposicion VALUES(160,160,1,NULL,'confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO participante_exposicion VALUES(161,161,1,NULL,'confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO participante_exposicion VALUES(162,162,1,NULL,'confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO participante_exposicion VALUES(163,163,1,NULL,'confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO participante_exposicion VALUES(164,164,1,NULL,'confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO participante_exposicion VALUES(165,165,1,NULL,'confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO participante_exposicion VALUES(166,166,1,NULL,'confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO participante_exposicion VALUES(167,167,1,NULL,'confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO participante_exposicion VALUES(168,168,1,NULL,'confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO participante_exposicion VALUES(169,169,1,NULL,'confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO participante_exposicion VALUES(170,170,1,NULL,'confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO participante_exposicion VALUES(171,171,1,NULL,'confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO participante_exposicion VALUES(172,172,1,NULL,'confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO participante_exposicion VALUES(173,173,1,NULL,'confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO participante_exposicion VALUES(174,174,1,NULL,'confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO participante_exposicion VALUES(175,175,1,NULL,'confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO participante_exposicion VALUES(176,176,1,NULL,'confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO participante_exposicion VALUES(177,177,1,NULL,'confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO participante_exposicion VALUES(178,178,1,NULL,'confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO participante_exposicion VALUES(179,179,1,NULL,'confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO participante_exposicion VALUES(180,180,1,NULL,'confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO participante_exposicion VALUES(181,181,1,NULL,'confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO participante_exposicion VALUES(182,182,1,NULL,'confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO participante_exposicion VALUES(183,183,1,NULL,'confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO participante_exposicion VALUES(184,184,1,NULL,'confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO participante_exposicion VALUES(185,185,1,NULL,'confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO participante_exposicion VALUES(186,186,1,NULL,'confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO participante_exposicion VALUES(187,187,1,NULL,'confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO participante_exposicion VALUES(188,188,1,NULL,'confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO participante_exposicion VALUES(189,189,1,NULL,'confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO participante_exposicion VALUES(190,190,1,NULL,'confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO participante_exposicion VALUES(191,191,1,NULL,'confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO participante_exposicion VALUES(192,192,1,NULL,'confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO participante_exposicion VALUES(193,193,1,NULL,'confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO participante_exposicion VALUES(194,194,1,NULL,'confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO participante_exposicion VALUES(195,195,1,NULL,'confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO participante_exposicion VALUES(196,196,1,NULL,'confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO participante_exposicion VALUES(197,197,1,NULL,'confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO participante_exposicion VALUES(198,198,1,NULL,'confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO participante_exposicion VALUES(199,199,1,NULL,'confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO participante_exposicion VALUES(200,200,1,NULL,'confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO participante_exposicion VALUES(201,201,1,NULL,'confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO participante_exposicion VALUES(202,202,1,NULL,'confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO participante_exposicion VALUES(203,203,1,NULL,'confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO participante_exposicion VALUES(204,204,1,NULL,'confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO participante_exposicion VALUES(205,205,1,NULL,'confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO participante_exposicion VALUES(206,206,1,NULL,'confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO participante_exposicion VALUES(207,207,1,NULL,'confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO participante_exposicion VALUES(208,208,1,NULL,'confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO participante_exposicion VALUES(209,209,1,NULL,'confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO participante_exposicion VALUES(210,210,1,NULL,'confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO participante_exposicion VALUES(211,211,1,NULL,'confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO participante_exposicion VALUES(212,212,1,NULL,'confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO participante_exposicion VALUES(213,213,1,NULL,'confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO participante_exposicion VALUES(214,214,1,NULL,'confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO participante_exposicion VALUES(215,215,1,NULL,'confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO participante_exposicion VALUES(216,216,1,NULL,'confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO participante_exposicion VALUES(217,217,1,NULL,'confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO participante_exposicion VALUES(218,218,1,NULL,'confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO participante_exposicion VALUES(219,219,1,NULL,'confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO participante_exposicion VALUES(220,220,1,NULL,'confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO participante_exposicion VALUES(221,221,1,NULL,'confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO participante_exposicion VALUES(222,222,1,NULL,'confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO participante_exposicion VALUES(223,223,1,NULL,'confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO participante_exposicion VALUES(224,224,1,NULL,'confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO participante_exposicion VALUES(225,225,1,NULL,'confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO participante_exposicion VALUES(226,226,1,NULL,'confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO participante_exposicion VALUES(227,227,1,NULL,'confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO participante_exposicion VALUES(228,228,1,NULL,'confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO participante_exposicion VALUES(229,229,1,NULL,'confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO participante_exposicion VALUES(230,230,1,NULL,'confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO participante_exposicion VALUES(231,231,1,NULL,'confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO participante_exposicion VALUES(232,232,1,NULL,'confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO participante_exposicion VALUES(233,233,1,NULL,'confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO participante_exposicion VALUES(234,234,1,NULL,'confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO participante_exposicion VALUES(235,235,1,NULL,'confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO participante_exposicion VALUES(236,236,1,NULL,'confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO participante_exposicion VALUES(237,237,1,NULL,'confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO participante_exposicion VALUES(238,238,1,NULL,'confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO participante_exposicion VALUES(239,239,1,NULL,'confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO participante_exposicion VALUES(240,240,1,NULL,'confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO participante_exposicion VALUES(241,241,1,NULL,'confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO participante_exposicion VALUES(242,242,1,NULL,'confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO participante_exposicion VALUES(243,243,1,NULL,'confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO participante_exposicion VALUES(244,244,1,NULL,'confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO participante_exposicion VALUES(245,245,1,NULL,'confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO participante_exposicion VALUES(246,246,1,NULL,'confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO participante_exposicion VALUES(247,247,1,NULL,'confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO participante_exposicion VALUES(248,248,1,NULL,'confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO participante_exposicion VALUES(249,249,1,NULL,'confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO participante_exposicion VALUES(250,250,1,NULL,'confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO participante_exposicion VALUES(251,251,1,NULL,'confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO participante_exposicion VALUES(252,252,1,NULL,'confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO participante_exposicion VALUES(253,253,1,NULL,'confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO participante_exposicion VALUES(254,254,1,NULL,'confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO participante_exposicion VALUES(255,255,1,NULL,'confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO participante_exposicion VALUES(256,256,1,NULL,'confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO participante_exposicion VALUES(257,257,1,NULL,'confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO participante_exposicion VALUES(258,258,1,NULL,'confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO participante_exposicion VALUES(259,259,1,NULL,'confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO participante_exposicion VALUES(260,260,1,NULL,'confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO participante_exposicion VALUES(261,261,1,NULL,'confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO participante_exposicion VALUES(262,262,1,NULL,'confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO participante_exposicion VALUES(263,263,1,NULL,'confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO participante_exposicion VALUES(264,264,1,NULL,'confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO participante_exposicion VALUES(265,265,1,NULL,'confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO participante_exposicion VALUES(266,266,1,NULL,'confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO participante_exposicion VALUES(267,267,1,NULL,'confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO participante_exposicion VALUES(268,268,1,NULL,'confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO participante_exposicion VALUES(269,269,1,NULL,'confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO participante_exposicion VALUES(270,270,1,NULL,'confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO participante_exposicion VALUES(271,271,1,NULL,'confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO participante_exposicion VALUES(272,272,1,NULL,'confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO participante_exposicion VALUES(273,273,1,NULL,'confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO participante_exposicion VALUES(274,274,1,NULL,'confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO participante_exposicion VALUES(275,275,1,NULL,'confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO participante_exposicion VALUES(276,276,1,NULL,'confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO participante_exposicion VALUES(277,277,1,NULL,'confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO participante_exposicion VALUES(278,278,1,NULL,'confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO participante_exposicion VALUES(279,279,1,NULL,'confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO participante_exposicion VALUES(280,280,1,NULL,'confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO participante_exposicion VALUES(281,281,1,NULL,'confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO participante_exposicion VALUES(282,282,1,NULL,'confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO participante_exposicion VALUES(283,283,1,NULL,'confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO participante_exposicion VALUES(284,284,1,NULL,'confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO participante_exposicion VALUES(285,285,3,NULL,'confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO participante_exposicion VALUES(286,286,3,NULL,'confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO participante_exposicion VALUES(287,287,3,NULL,'confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO participante_exposicion VALUES(288,288,3,NULL,'confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO participante_exposicion VALUES(289,289,3,NULL,'confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO participante_exposicion VALUES(290,290,3,NULL,'confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO participante_exposicion VALUES(291,291,3,NULL,'confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO participante_exposicion VALUES(292,292,3,NULL,'confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO participante_exposicion VALUES(293,293,3,NULL,'confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO participante_exposicion VALUES(294,294,3,NULL,'confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO participante_exposicion VALUES(295,295,3,NULL,'confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO participante_exposicion VALUES(296,296,3,NULL,'confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO participante_exposicion VALUES(297,297,3,NULL,'confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO participante_exposicion VALUES(298,298,3,NULL,'confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO participante_exposicion VALUES(299,299,3,NULL,'confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO participante_exposicion VALUES(300,300,3,NULL,'confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO participante_exposicion VALUES(301,301,3,NULL,'confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO participante_exposicion VALUES(302,302,3,NULL,'confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO participante_exposicion VALUES(303,303,3,NULL,'confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO participante_exposicion VALUES(304,304,3,NULL,'confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO participante_exposicion VALUES(305,305,3,NULL,'confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO participante_exposicion VALUES(306,306,3,NULL,'confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO participante_exposicion VALUES(307,307,3,NULL,'confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO participante_exposicion VALUES(308,308,3,NULL,'confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO participante_exposicion VALUES(309,309,3,NULL,'confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO participante_exposicion VALUES(310,310,3,NULL,'confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO participante_exposicion VALUES(311,311,3,NULL,'confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO participante_exposicion VALUES(312,312,3,NULL,'confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO participante_exposicion VALUES(313,313,3,NULL,'confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO participante_exposicion VALUES(314,314,3,NULL,'confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO participante_exposicion VALUES(315,315,3,NULL,'confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO participante_exposicion VALUES(316,316,3,NULL,'confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO participante_exposicion VALUES(317,317,3,NULL,'confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO participante_exposicion VALUES(318,318,3,NULL,'confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO participante_exposicion VALUES(319,319,3,NULL,'confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO participante_exposicion VALUES(320,320,3,NULL,'confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO participante_exposicion VALUES(321,321,3,NULL,'confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO participante_exposicion VALUES(322,322,3,NULL,'confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO participante_exposicion VALUES(323,323,3,NULL,'confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO participante_exposicion VALUES(324,324,3,NULL,'confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO participante_exposicion VALUES(325,325,3,NULL,'confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO participante_exposicion VALUES(326,326,3,NULL,'confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO participante_exposicion VALUES(327,327,3,NULL,'confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO participante_exposicion VALUES(328,328,3,NULL,'confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO participante_exposicion VALUES(329,329,3,NULL,'confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO participante_exposicion VALUES(330,330,3,NULL,'confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO participante_exposicion VALUES(331,331,3,NULL,'confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO participante_exposicion VALUES(332,332,3,NULL,'confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO participante_exposicion VALUES(333,333,3,NULL,'confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO participante_exposicion VALUES(334,334,3,NULL,'confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO participante_exposicion VALUES(335,335,3,NULL,'confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO participante_exposicion VALUES(336,336,3,NULL,'confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO participante_exposicion VALUES(337,337,3,NULL,'confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO participante_exposicion VALUES(338,338,3,NULL,'confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO participante_exposicion VALUES(339,339,3,NULL,'confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO participante_exposicion VALUES(340,340,3,NULL,'confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO participante_exposicion VALUES(341,341,3,NULL,'confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO participante_exposicion VALUES(342,342,3,NULL,'confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO participante_exposicion VALUES(343,343,3,NULL,'confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO participante_exposicion VALUES(344,344,3,NULL,'confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO participante_exposicion VALUES(345,345,3,NULL,'confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO participante_exposicion VALUES(346,346,3,NULL,'confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO participante_exposicion VALUES(347,347,3,NULL,'confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO participante_exposicion VALUES(348,348,3,NULL,'confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO participante_exposicion VALUES(349,349,3,NULL,'confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO participante_exposicion VALUES(350,350,3,NULL,'confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO participante_exposicion VALUES(351,351,3,NULL,'confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO participante_exposicion VALUES(352,352,3,NULL,'confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO participante_exposicion VALUES(353,353,3,NULL,'confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO participante_exposicion VALUES(354,354,1,NULL,'confirmado',NULL,'2025-12-27 04:34:54','2025-12-27 04:34:54');
INSERT INTO participante_exposicion VALUES(355,355,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(356,356,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(357,357,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(358,358,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(359,359,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(360,360,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(361,361,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(362,362,1,3,'confirmado',NULL,'2025-12-27 04:35:34','2025-12-28 18:27:11');
INSERT INTO participante_exposicion VALUES(363,363,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(364,364,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(365,365,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(366,366,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(367,367,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(368,368,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(369,369,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(370,370,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(371,371,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(372,372,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(373,373,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(374,374,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(375,375,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(376,376,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(377,377,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_exposicion VALUES(378,378,1,NULL,'confirmado',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
CREATE TABLE IF NOT EXISTS participante_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_id INTEGER NOT NULL,
    tipo_actividad_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_actividad_participante 
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE CASCADE,
    CONSTRAINT fk_actividad_tipo 
        FOREIGN KEY (tipo_actividad_id) REFERENCES tipo_actividad (id),
    CONSTRAINT fk_actividad_agrupacion 
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT chk_actividad_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);
INSERT INTO participante_actividad VALUES(1,365,3,NULL,'confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_actividad VALUES(2,367,3,NULL,'confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_actividad VALUES(3,372,3,NULL,'confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_actividad VALUES(4,376,2,NULL,'confirmado','[Rol: charlista]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_actividad VALUES(5,377,3,NULL,'confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO participante_actividad VALUES(6,378,3,NULL,'confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
CREATE TABLE IF NOT EXISTS "evento_edicion_participante" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    modo_ingreso TEXT NOT NULL DEFAULT 'seleccion',
    estado TEXT NOT NULL DEFAULT 'confirmado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_participante_evento_edicion 
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista 
        FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_participante_modo_ingreso 
        CHECK (modo_ingreso IN ('seleccion', 'invitacion')),
    CONSTRAINT chk_participante_estado 
        CHECK (estado IN ('seleccionado', 'confirmado', 'cancelado', 'no_asistio'))
);
INSERT INTO evento_edicion_participante VALUES(1,8,1,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(2,9,1,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(3,10,1,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(4,10,2,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(5,5,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(6,6,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(7,7,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(8,8,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(9,9,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(10,10,6,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(11,4,7,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(12,5,7,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(13,6,7,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(14,7,7,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(15,8,9,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(16,3,10,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(17,4,10,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(18,6,10,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(19,10,13,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(20,8,17,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(21,9,17,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(22,10,17,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(23,5,20,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(24,8,20,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(25,1,31,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(26,2,31,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(27,3,31,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(28,1,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(29,2,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(30,5,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(31,6,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(32,7,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(33,8,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(34,9,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(35,10,32,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(36,1,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(37,2,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(38,3,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(39,4,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(40,5,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(41,6,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(42,9,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(43,10,33,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(44,4,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(45,5,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(46,6,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(47,7,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(48,8,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(49,9,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(50,10,34,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(51,3,35,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(52,9,35,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(53,1,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(54,2,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(55,3,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(56,4,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(57,5,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(58,8,37,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(59,5,39,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(60,4,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(61,6,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(62,7,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(63,8,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(64,9,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(65,10,43,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(66,3,52,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(67,4,52,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(68,5,52,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(69,7,52,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(70,9,52,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(71,6,64,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(72,7,64,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(73,8,64,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(74,9,64,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(75,10,64,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(76,7,68,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(77,8,68,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(78,9,69,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(79,10,69,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(80,1,71,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(81,4,80,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(82,5,80,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(83,6,80,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(84,7,80,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(85,10,80,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(86,1,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(87,2,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(88,3,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(89,5,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(90,7,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(91,8,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(92,10,81,'seleccion','confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(93,9,45,'seleccion','confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(94,8,48,'seleccion','confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(95,10,48,'seleccion','confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(96,6,88,'seleccion','confirmado',NULL,'2025-12-27 04:32:59','2025-12-27 04:32:59');
INSERT INTO evento_edicion_participante VALUES(97,7,88,'seleccion','confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO evento_edicion_participante VALUES(98,8,88,'seleccion','confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO evento_edicion_participante VALUES(99,9,88,'seleccion','confirmado',NULL,'2025-12-27 04:33:00','2025-12-27 04:33:00');
INSERT INTO evento_edicion_participante VALUES(100,10,88,'seleccion','confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO evento_edicion_participante VALUES(101,6,89,'seleccion','confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO evento_edicion_participante VALUES(102,3,90,'seleccion','confirmado',NULL,'2025-12-27 04:33:01','2025-12-27 04:33:01');
INSERT INTO evento_edicion_participante VALUES(103,3,91,'seleccion','confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO evento_edicion_participante VALUES(104,4,91,'seleccion','confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO evento_edicion_participante VALUES(105,5,91,'seleccion','confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO evento_edicion_participante VALUES(106,7,92,'seleccion','confirmado',NULL,'2025-12-27 04:33:02','2025-12-27 04:33:02');
INSERT INTO evento_edicion_participante VALUES(107,8,92,'seleccion','confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO evento_edicion_participante VALUES(108,9,92,'seleccion','confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO evento_edicion_participante VALUES(109,10,92,'seleccion','confirmado',NULL,'2025-12-27 04:33:03','2025-12-27 04:33:03');
INSERT INTO evento_edicion_participante VALUES(110,7,93,'seleccion','confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO evento_edicion_participante VALUES(111,6,94,'seleccion','confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO evento_edicion_participante VALUES(112,8,94,'seleccion','confirmado',NULL,'2025-12-27 04:33:04','2025-12-27 04:33:04');
INSERT INTO evento_edicion_participante VALUES(113,9,94,'seleccion','confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO evento_edicion_participante VALUES(114,3,95,'seleccion','confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO evento_edicion_participante VALUES(115,10,95,'seleccion','confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO evento_edicion_participante VALUES(116,10,96,'seleccion','confirmado',NULL,'2025-12-27 04:33:05','2025-12-27 04:33:05');
INSERT INTO evento_edicion_participante VALUES(117,10,97,'seleccion','confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO evento_edicion_participante VALUES(118,6,98,'seleccion','confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO evento_edicion_participante VALUES(119,9,98,'seleccion','confirmado',NULL,'2025-12-27 04:33:06','2025-12-27 04:33:06');
INSERT INTO evento_edicion_participante VALUES(120,8,99,'seleccion','confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO evento_edicion_participante VALUES(121,9,99,'seleccion','confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO evento_edicion_participante VALUES(122,10,99,'seleccion','confirmado',NULL,'2025-12-27 04:33:07','2025-12-27 04:33:07');
INSERT INTO evento_edicion_participante VALUES(123,10,100,'seleccion','confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO evento_edicion_participante VALUES(124,5,101,'seleccion','confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO evento_edicion_participante VALUES(125,6,102,'seleccion','confirmado',NULL,'2025-12-27 04:33:08','2025-12-27 04:33:08');
INSERT INTO evento_edicion_participante VALUES(126,7,102,'seleccion','confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO evento_edicion_participante VALUES(127,8,102,'seleccion','confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO evento_edicion_participante VALUES(128,4,103,'seleccion','confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO evento_edicion_participante VALUES(129,3,104,'seleccion','confirmado',NULL,'2025-12-27 04:33:09','2025-12-27 04:33:09');
INSERT INTO evento_edicion_participante VALUES(130,7,104,'seleccion','confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO evento_edicion_participante VALUES(131,9,104,'seleccion','confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO evento_edicion_participante VALUES(132,3,105,'seleccion','confirmado',NULL,'2025-12-27 04:33:10','2025-12-27 04:33:10');
INSERT INTO evento_edicion_participante VALUES(133,1,106,'seleccion','confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO evento_edicion_participante VALUES(134,1,107,'seleccion','confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO evento_edicion_participante VALUES(135,2,107,'seleccion','confirmado',NULL,'2025-12-27 04:33:11','2025-12-27 04:33:11');
INSERT INTO evento_edicion_participante VALUES(136,9,108,'seleccion','confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO evento_edicion_participante VALUES(137,10,108,'seleccion','confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO evento_edicion_participante VALUES(138,6,109,'seleccion','confirmado',NULL,'2025-12-27 04:33:12','2025-12-27 04:33:12');
INSERT INTO evento_edicion_participante VALUES(139,9,110,'seleccion','confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO evento_edicion_participante VALUES(140,10,110,'seleccion','confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO evento_edicion_participante VALUES(141,5,111,'seleccion','confirmado',NULL,'2025-12-27 04:33:13','2025-12-27 04:33:13');
INSERT INTO evento_edicion_participante VALUES(142,6,111,'seleccion','confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO evento_edicion_participante VALUES(143,9,111,'seleccion','confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO evento_edicion_participante VALUES(144,8,112,'seleccion','confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO evento_edicion_participante VALUES(145,9,113,'seleccion','confirmado',NULL,'2025-12-27 04:33:14','2025-12-27 04:33:14');
INSERT INTO evento_edicion_participante VALUES(146,1,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO evento_edicion_participante VALUES(147,2,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO evento_edicion_participante VALUES(148,3,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:15','2025-12-27 04:33:15');
INSERT INTO evento_edicion_participante VALUES(149,4,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO evento_edicion_participante VALUES(150,5,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO evento_edicion_participante VALUES(151,7,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:16','2025-12-27 04:33:16');
INSERT INTO evento_edicion_participante VALUES(152,8,114,'seleccion','confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO evento_edicion_participante VALUES(153,6,115,'seleccion','confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO evento_edicion_participante VALUES(154,7,115,'seleccion','confirmado',NULL,'2025-12-27 04:33:17','2025-12-27 04:33:17');
INSERT INTO evento_edicion_participante VALUES(155,8,115,'seleccion','confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO evento_edicion_participante VALUES(156,9,115,'seleccion','confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO evento_edicion_participante VALUES(157,10,115,'seleccion','confirmado',NULL,'2025-12-27 04:33:18','2025-12-27 04:33:18');
INSERT INTO evento_edicion_participante VALUES(158,1,116,'seleccion','confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO evento_edicion_participante VALUES(159,3,116,'seleccion','confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO evento_edicion_participante VALUES(160,5,116,'seleccion','confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO evento_edicion_participante VALUES(161,2,117,'seleccion','confirmado',NULL,'2025-12-27 04:33:19','2025-12-27 04:33:19');
INSERT INTO evento_edicion_participante VALUES(162,3,117,'seleccion','confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO evento_edicion_participante VALUES(163,10,117,'seleccion','confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO evento_edicion_participante VALUES(164,2,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:20','2025-12-27 04:33:20');
INSERT INTO evento_edicion_participante VALUES(165,3,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO evento_edicion_participante VALUES(166,5,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO evento_edicion_participante VALUES(167,6,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:21','2025-12-27 04:33:21');
INSERT INTO evento_edicion_participante VALUES(168,8,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO evento_edicion_participante VALUES(169,9,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO evento_edicion_participante VALUES(170,10,118,'seleccion','confirmado',NULL,'2025-12-27 04:33:22','2025-12-27 04:33:22');
INSERT INTO evento_edicion_participante VALUES(171,6,119,'seleccion','confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO evento_edicion_participante VALUES(172,7,120,'seleccion','confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO evento_edicion_participante VALUES(173,8,121,'seleccion','confirmado',NULL,'2025-12-27 04:33:23','2025-12-27 04:33:23');
INSERT INTO evento_edicion_participante VALUES(174,1,122,'seleccion','confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO evento_edicion_participante VALUES(175,2,122,'seleccion','confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO evento_edicion_participante VALUES(176,3,122,'seleccion','confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO evento_edicion_participante VALUES(177,4,122,'seleccion','confirmado',NULL,'2025-12-27 04:33:24','2025-12-27 04:33:24');
INSERT INTO evento_edicion_participante VALUES(178,5,122,'seleccion','confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO evento_edicion_participante VALUES(179,3,123,'seleccion','confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO evento_edicion_participante VALUES(180,6,124,'seleccion','confirmado',NULL,'2025-12-27 04:33:25','2025-12-27 04:33:25');
INSERT INTO evento_edicion_participante VALUES(181,3,125,'seleccion','confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO evento_edicion_participante VALUES(182,4,125,'seleccion','confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO evento_edicion_participante VALUES(183,6,125,'seleccion','confirmado',NULL,'2025-12-27 04:33:26','2025-12-27 04:33:26');
INSERT INTO evento_edicion_participante VALUES(184,9,126,'seleccion','confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO evento_edicion_participante VALUES(185,2,127,'seleccion','confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO evento_edicion_participante VALUES(186,9,128,'seleccion','confirmado',NULL,'2025-12-27 04:33:27','2025-12-27 04:33:27');
INSERT INTO evento_edicion_participante VALUES(187,7,129,'seleccion','confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO evento_edicion_participante VALUES(188,8,129,'seleccion','confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO evento_edicion_participante VALUES(189,9,129,'seleccion','confirmado',NULL,'2025-12-27 04:33:28','2025-12-27 04:33:28');
INSERT INTO evento_edicion_participante VALUES(190,10,130,'seleccion','confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO evento_edicion_participante VALUES(191,9,131,'seleccion','confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO evento_edicion_participante VALUES(192,4,132,'seleccion','confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO evento_edicion_participante VALUES(193,1,133,'seleccion','confirmado',NULL,'2025-12-27 04:33:29','2025-12-27 04:33:29');
INSERT INTO evento_edicion_participante VALUES(194,3,133,'seleccion','confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO evento_edicion_participante VALUES(195,7,133,'seleccion','confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO evento_edicion_participante VALUES(196,8,134,'seleccion','confirmado',NULL,'2025-12-27 04:33:30','2025-12-27 04:33:30');
INSERT INTO evento_edicion_participante VALUES(197,10,135,'seleccion','confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO evento_edicion_participante VALUES(198,1,136,'seleccion','confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO evento_edicion_participante VALUES(199,2,136,'seleccion','confirmado',NULL,'2025-12-27 04:33:31','2025-12-27 04:33:31');
INSERT INTO evento_edicion_participante VALUES(200,3,136,'seleccion','confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO evento_edicion_participante VALUES(201,5,136,'seleccion','confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO evento_edicion_participante VALUES(202,7,136,'seleccion','confirmado',NULL,'2025-12-27 04:33:32','2025-12-27 04:33:32');
INSERT INTO evento_edicion_participante VALUES(203,5,137,'seleccion','confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO evento_edicion_participante VALUES(204,6,137,'seleccion','confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO evento_edicion_participante VALUES(205,8,137,'seleccion','confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO evento_edicion_participante VALUES(206,5,138,'seleccion','confirmado',NULL,'2025-12-27 04:33:33','2025-12-27 04:33:33');
INSERT INTO evento_edicion_participante VALUES(207,3,139,'seleccion','confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO evento_edicion_participante VALUES(208,4,139,'seleccion','confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO evento_edicion_participante VALUES(209,9,139,'seleccion','confirmado',NULL,'2025-12-27 04:33:34','2025-12-27 04:33:34');
INSERT INTO evento_edicion_participante VALUES(210,10,139,'seleccion','confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO evento_edicion_participante VALUES(211,3,140,'seleccion','confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO evento_edicion_participante VALUES(212,4,141,'seleccion','confirmado',NULL,'2025-12-27 04:33:35','2025-12-27 04:33:35');
INSERT INTO evento_edicion_participante VALUES(213,6,141,'seleccion','confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO evento_edicion_participante VALUES(214,4,142,'seleccion','confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO evento_edicion_participante VALUES(215,1,143,'seleccion','confirmado',NULL,'2025-12-27 04:33:36','2025-12-27 04:33:36');
INSERT INTO evento_edicion_participante VALUES(216,2,143,'seleccion','confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO evento_edicion_participante VALUES(217,5,143,'seleccion','confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO evento_edicion_participante VALUES(218,5,144,'seleccion','confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO evento_edicion_participante VALUES(219,6,144,'seleccion','confirmado',NULL,'2025-12-27 04:33:37','2025-12-27 04:33:37');
INSERT INTO evento_edicion_participante VALUES(220,7,144,'seleccion','confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO evento_edicion_participante VALUES(221,9,144,'seleccion','confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO evento_edicion_participante VALUES(222,2,145,'seleccion','confirmado',NULL,'2025-12-27 04:33:38','2025-12-27 04:33:38');
INSERT INTO evento_edicion_participante VALUES(223,3,145,'seleccion','confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO evento_edicion_participante VALUES(224,6,145,'seleccion','confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO evento_edicion_participante VALUES(225,7,145,'seleccion','confirmado',NULL,'2025-12-27 04:33:39','2025-12-27 04:33:39');
INSERT INTO evento_edicion_participante VALUES(226,8,145,'seleccion','confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO evento_edicion_participante VALUES(227,5,146,'seleccion','confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO evento_edicion_participante VALUES(228,1,147,'seleccion','confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO evento_edicion_participante VALUES(229,2,147,'seleccion','confirmado',NULL,'2025-12-27 04:33:40','2025-12-27 04:33:40');
INSERT INTO evento_edicion_participante VALUES(230,2,148,'seleccion','confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO evento_edicion_participante VALUES(231,6,148,'seleccion','confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO evento_edicion_participante VALUES(232,7,148,'seleccion','confirmado',NULL,'2025-12-27 04:33:41','2025-12-27 04:33:41');
INSERT INTO evento_edicion_participante VALUES(233,8,148,'seleccion','confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO evento_edicion_participante VALUES(234,9,148,'seleccion','confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO evento_edicion_participante VALUES(235,8,149,'seleccion','confirmado',NULL,'2025-12-27 04:33:42','2025-12-27 04:33:42');
INSERT INTO evento_edicion_participante VALUES(236,9,149,'seleccion','confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO evento_edicion_participante VALUES(237,5,150,'seleccion','confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO evento_edicion_participante VALUES(238,4,151,'seleccion','confirmado',NULL,'2025-12-27 04:33:43','2025-12-27 04:33:43');
INSERT INTO evento_edicion_participante VALUES(239,6,152,'seleccion','confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO evento_edicion_participante VALUES(240,4,153,'seleccion','confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO evento_edicion_participante VALUES(241,7,153,'seleccion','confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO evento_edicion_participante VALUES(242,8,154,'seleccion','confirmado',NULL,'2025-12-27 04:33:44','2025-12-27 04:33:44');
INSERT INTO evento_edicion_participante VALUES(243,2,155,'seleccion','confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO evento_edicion_participante VALUES(244,3,155,'seleccion','confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO evento_edicion_participante VALUES(245,5,155,'seleccion','confirmado',NULL,'2025-12-27 04:33:45','2025-12-27 04:33:45');
INSERT INTO evento_edicion_participante VALUES(246,7,155,'seleccion','confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO evento_edicion_participante VALUES(247,10,155,'seleccion','confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO evento_edicion_participante VALUES(248,1,156,'seleccion','confirmado',NULL,'2025-12-27 04:33:46','2025-12-27 04:33:46');
INSERT INTO evento_edicion_participante VALUES(249,2,156,'seleccion','confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO evento_edicion_participante VALUES(250,4,156,'seleccion','confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO evento_edicion_participante VALUES(251,10,156,'seleccion','confirmado',NULL,'2025-12-27 04:33:47','2025-12-27 04:33:47');
INSERT INTO evento_edicion_participante VALUES(252,3,157,'seleccion','confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO evento_edicion_participante VALUES(253,4,157,'seleccion','confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO evento_edicion_participante VALUES(254,5,157,'seleccion','confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO evento_edicion_participante VALUES(255,6,157,'seleccion','confirmado',NULL,'2025-12-27 04:33:48','2025-12-27 04:33:48');
INSERT INTO evento_edicion_participante VALUES(256,5,158,'seleccion','confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO evento_edicion_participante VALUES(257,10,159,'seleccion','confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO evento_edicion_participante VALUES(258,3,160,'seleccion','confirmado',NULL,'2025-12-27 04:33:49','2025-12-27 04:33:49');
INSERT INTO evento_edicion_participante VALUES(259,4,160,'seleccion','confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO evento_edicion_participante VALUES(260,5,160,'seleccion','confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO evento_edicion_participante VALUES(261,9,160,'seleccion','confirmado',NULL,'2025-12-27 04:33:50','2025-12-27 04:33:50');
INSERT INTO evento_edicion_participante VALUES(262,10,160,'seleccion','confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO evento_edicion_participante VALUES(263,8,161,'seleccion','confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO evento_edicion_participante VALUES(264,2,162,'seleccion','confirmado',NULL,'2025-12-27 04:33:51','2025-12-27 04:33:51');
INSERT INTO evento_edicion_participante VALUES(265,3,162,'seleccion','confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO evento_edicion_participante VALUES(266,5,162,'seleccion','confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO evento_edicion_participante VALUES(267,9,163,'seleccion','confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO evento_edicion_participante VALUES(268,2,164,'seleccion','confirmado',NULL,'2025-12-27 04:33:52','2025-12-27 04:33:52');
INSERT INTO evento_edicion_participante VALUES(269,4,164,'seleccion','confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO evento_edicion_participante VALUES(270,7,165,'seleccion','confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO evento_edicion_participante VALUES(271,5,166,'seleccion','confirmado',NULL,'2025-12-27 04:33:53','2025-12-27 04:33:53');
INSERT INTO evento_edicion_participante VALUES(272,10,166,'seleccion','confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO evento_edicion_participante VALUES(273,3,167,'seleccion','confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO evento_edicion_participante VALUES(274,3,168,'seleccion','confirmado',NULL,'2025-12-27 04:33:54','2025-12-27 04:33:54');
INSERT INTO evento_edicion_participante VALUES(275,4,168,'seleccion','confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO evento_edicion_participante VALUES(276,1,169,'seleccion','confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO evento_edicion_participante VALUES(277,2,169,'seleccion','confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO evento_edicion_participante VALUES(278,3,169,'seleccion','confirmado',NULL,'2025-12-27 04:33:55','2025-12-27 04:33:55');
INSERT INTO evento_edicion_participante VALUES(279,4,170,'seleccion','confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO evento_edicion_participante VALUES(280,3,171,'seleccion','confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO evento_edicion_participante VALUES(281,3,172,'seleccion','confirmado',NULL,'2025-12-27 04:33:56','2025-12-27 04:33:56');
INSERT INTO evento_edicion_participante VALUES(282,3,173,'seleccion','confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO evento_edicion_participante VALUES(283,4,173,'seleccion','confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO evento_edicion_participante VALUES(284,6,173,'seleccion','confirmado',NULL,'2025-12-27 04:33:57','2025-12-27 04:33:57');
INSERT INTO evento_edicion_participante VALUES(285,8,174,'seleccion','confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO evento_edicion_participante VALUES(286,9,175,'seleccion','confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO evento_edicion_participante VALUES(287,10,175,'seleccion','confirmado',NULL,'2025-12-27 04:33:58','2025-12-27 04:33:58');
INSERT INTO evento_edicion_participante VALUES(288,2,176,'seleccion','confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO evento_edicion_participante VALUES(289,8,177,'seleccion','confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO evento_edicion_participante VALUES(290,1,178,'seleccion','confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO evento_edicion_participante VALUES(291,2,178,'seleccion','confirmado',NULL,'2025-12-27 04:33:59','2025-12-27 04:33:59');
INSERT INTO evento_edicion_participante VALUES(292,7,179,'seleccion','confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO evento_edicion_participante VALUES(293,8,179,'seleccion','confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO evento_edicion_participante VALUES(294,10,180,'seleccion','confirmado',NULL,'2025-12-27 04:34:00','2025-12-27 04:34:00');
INSERT INTO evento_edicion_participante VALUES(295,3,181,'seleccion','confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO evento_edicion_participante VALUES(296,6,181,'seleccion','confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO evento_edicion_participante VALUES(297,5,182,'seleccion','confirmado',NULL,'2025-12-27 04:34:01','2025-12-27 04:34:01');
INSERT INTO evento_edicion_participante VALUES(298,7,182,'seleccion','confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO evento_edicion_participante VALUES(299,8,182,'seleccion','confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO evento_edicion_participante VALUES(300,10,182,'seleccion','confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO evento_edicion_participante VALUES(301,2,183,'seleccion','confirmado',NULL,'2025-12-27 04:34:02','2025-12-27 04:34:02');
INSERT INTO evento_edicion_participante VALUES(302,1,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO evento_edicion_participante VALUES(303,2,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO evento_edicion_participante VALUES(304,3,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:03','2025-12-27 04:34:03');
INSERT INTO evento_edicion_participante VALUES(305,4,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO evento_edicion_participante VALUES(306,5,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO evento_edicion_participante VALUES(307,7,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:04','2025-12-27 04:34:04');
INSERT INTO evento_edicion_participante VALUES(308,10,184,'seleccion','confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO evento_edicion_participante VALUES(309,7,185,'seleccion','confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO evento_edicion_participante VALUES(310,3,186,'seleccion','confirmado',NULL,'2025-12-27 04:34:05','2025-12-27 04:34:05');
INSERT INTO evento_edicion_participante VALUES(311,9,187,'seleccion','confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO evento_edicion_participante VALUES(312,4,188,'seleccion','confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO evento_edicion_participante VALUES(313,5,189,'seleccion','confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO evento_edicion_participante VALUES(314,7,189,'seleccion','confirmado',NULL,'2025-12-27 04:34:06','2025-12-27 04:34:06');
INSERT INTO evento_edicion_participante VALUES(315,6,190,'seleccion','confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO evento_edicion_participante VALUES(316,8,190,'seleccion','confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO evento_edicion_participante VALUES(317,9,190,'seleccion','confirmado',NULL,'2025-12-27 04:34:07','2025-12-27 04:34:07');
INSERT INTO evento_edicion_participante VALUES(318,2,191,'seleccion','confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO evento_edicion_participante VALUES(319,2,192,'seleccion','confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO evento_edicion_participante VALUES(320,5,193,'seleccion','confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO evento_edicion_participante VALUES(321,4,194,'seleccion','confirmado',NULL,'2025-12-27 04:34:08','2025-12-27 04:34:08');
INSERT INTO evento_edicion_participante VALUES(322,5,194,'seleccion','confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO evento_edicion_participante VALUES(323,6,194,'seleccion','confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO evento_edicion_participante VALUES(324,7,194,'seleccion','confirmado',NULL,'2025-12-27 04:34:09','2025-12-27 04:34:09');
INSERT INTO evento_edicion_participante VALUES(325,3,195,'seleccion','confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO evento_edicion_participante VALUES(326,4,195,'seleccion','confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO evento_edicion_participante VALUES(327,2,196,'seleccion','confirmado',NULL,'2025-12-27 04:34:10','2025-12-27 04:34:10');
INSERT INTO evento_edicion_participante VALUES(328,6,197,'seleccion','confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO evento_edicion_participante VALUES(329,7,197,'seleccion','confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO evento_edicion_participante VALUES(330,9,197,'seleccion','confirmado',NULL,'2025-12-27 04:34:11','2025-12-27 04:34:11');
INSERT INTO evento_edicion_participante VALUES(331,4,198,'seleccion','confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO evento_edicion_participante VALUES(332,5,198,'seleccion','confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO evento_edicion_participante VALUES(333,10,199,'seleccion','confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO evento_edicion_participante VALUES(334,7,200,'seleccion','confirmado',NULL,'2025-12-27 04:34:12','2025-12-27 04:34:12');
INSERT INTO evento_edicion_participante VALUES(335,3,201,'seleccion','confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO evento_edicion_participante VALUES(336,4,201,'seleccion','confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO evento_edicion_participante VALUES(337,3,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:13','2025-12-27 04:34:13');
INSERT INTO evento_edicion_participante VALUES(338,5,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO evento_edicion_participante VALUES(339,7,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO evento_edicion_participante VALUES(340,8,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO evento_edicion_participante VALUES(341,9,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:14','2025-12-27 04:34:14');
INSERT INTO evento_edicion_participante VALUES(342,10,202,'seleccion','confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO evento_edicion_participante VALUES(343,10,203,'seleccion','confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO evento_edicion_participante VALUES(344,9,204,'seleccion','confirmado',NULL,'2025-12-27 04:34:15','2025-12-27 04:34:15');
INSERT INTO evento_edicion_participante VALUES(345,3,205,'seleccion','confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO evento_edicion_participante VALUES(346,4,205,'seleccion','confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO evento_edicion_participante VALUES(347,5,205,'seleccion','confirmado',NULL,'2025-12-27 04:34:16','2025-12-27 04:34:16');
INSERT INTO evento_edicion_participante VALUES(348,2,206,'seleccion','confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO evento_edicion_participante VALUES(349,9,207,'seleccion','confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO evento_edicion_participante VALUES(350,3,208,'seleccion','confirmado',NULL,'2025-12-27 04:34:17','2025-12-27 04:34:17');
INSERT INTO evento_edicion_participante VALUES(351,3,209,'seleccion','confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO evento_edicion_participante VALUES(352,10,210,'seleccion','confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO evento_edicion_participante VALUES(353,10,211,'seleccion','confirmado',NULL,'2025-12-27 04:34:18','2025-12-27 04:34:18');
INSERT INTO evento_edicion_participante VALUES(354,3,212,'seleccion','confirmado',NULL,'2025-12-27 04:34:54','2025-12-27 04:34:54');
INSERT INTO evento_edicion_participante VALUES(355,3,213,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(356,4,213,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(357,8,213,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(358,9,213,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(359,3,158,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(360,4,158,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(361,8,158,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(362,9,158,'seleccion','confirmado',NULL,'2025-12-27 04:35:34','2025-12-27 04:35:34');
INSERT INTO evento_edicion_participante VALUES(363,5,214,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(364,5,215,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(365,5,226,'invitacion','confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(366,6,216,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(367,6,227,'invitacion','confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(368,7,217,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(369,8,218,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(370,8,219,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(371,8,220,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(372,8,228,'invitacion','confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(373,9,221,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(374,9,222,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(375,10,223,'invitacion','confirmado','[Rol: ilustrador]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(376,10,224,'invitacion','confirmado','[Rol: charlista]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(377,10,229,'invitacion','confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_participante VALUES(378,3,225,'invitacion','confirmado','[Rol: musico]','2025-12-25 19:14:36','2025-12-25 19:14:36');
CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_actividad_id INTEGER NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    duracion_minutos INTEGER,
    ubicacion TEXT,
    hora_inicio TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_actividad_participante_actividad 
        FOREIGN KEY (participante_actividad_id) REFERENCES participante_actividad (id) ON DELETE CASCADE,
    CONSTRAINT uq_actividad_participante_actividad UNIQUE (participante_actividad_id),
    CONSTRAINT chk_actividad_duracion CHECK (duracion_minutos IS NULL OR duracion_minutos > 0)
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('disciplina',4);
INSERT INTO sqlite_sequence VALUES('agrupacion',3);
INSERT INTO sqlite_sequence VALUES('organizacion',1);
INSERT INTO sqlite_sequence VALUES('evento',2);
INSERT INTO sqlite_sequence VALUES('evento_edicion',13);
INSERT INTO sqlite_sequence VALUES('evento_edicion_dia',18);
INSERT INTO sqlite_sequence VALUES('evento_edicion_metrica',30);
INSERT INTO sqlite_sequence VALUES('artista_imagen',87);
INSERT INTO sqlite_sequence VALUES('lugar',3);
INSERT INTO sqlite_sequence VALUES('catalogo_artista',87);
INSERT INTO sqlite_sequence VALUES('artista_historial',17);
INSERT INTO sqlite_sequence VALUES('evento_edicion_postulacion',0);
INSERT INTO sqlite_sequence VALUES('artista',229);
INSERT INTO sqlite_sequence VALUES('tipo_actividad',4);
INSERT INTO sqlite_sequence VALUES('participante_exposicion',378);
INSERT INTO sqlite_sequence VALUES('participante_actividad',6);
INSERT INTO sqlite_sequence VALUES('evento_edicion_participante',378);
CREATE INDEX idx_evento_edicion_metrica_evento_edicion
ON evento_edicion_metrica (evento_edicion_id);
CREATE INDEX idx_evento_edicion_metrica_fecha
ON evento_edicion_metrica (fecha_registro);
CREATE INDEX idx_evento_edicion_snapshot_evento_edicion
ON evento_edicion_snapshot (evento_edicion_id);
CREATE TRIGGER trg_organizacion_updated_at
AFTER UPDATE ON organizacion
FOR EACH ROW
BEGIN
    UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_organizacion_equipo_updated_at
AFTER UPDATE ON organizacion_equipo
FOR EACH ROW
BEGIN
    UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_evento_updated_at
AFTER UPDATE ON evento
FOR EACH ROW
BEGIN
    UPDATE evento SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_disciplina_updated_at
AFTER UPDATE ON disciplina
FOR EACH ROW
BEGIN
    UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_disciplina_created_at
AFTER INSERT ON disciplina
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE disciplina SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER trg_artista_imagen_updated_at
AFTER UPDATE ON artista_imagen
FOR EACH ROW
BEGIN
    UPDATE artista_imagen SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_artista_imagen_created_at
AFTER INSERT ON artista_imagen
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista_imagen SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER trg_agrupacion_updated_at
AFTER UPDATE ON agrupacion
FOR EACH ROW
BEGIN
    UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_agrupacion_created_at
AFTER INSERT ON agrupacion
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE agrupacion SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
CREATE TRIGGER trg_evento_edicion_updated_at
AFTER UPDATE ON evento_edicion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_evento_edicion_dia_updated_at
AFTER UPDATE ON evento_edicion_dia
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_lugar_updated_at
AFTER UPDATE ON lugar
FOR EACH ROW
BEGIN
    UPDATE lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE UNIQUE INDEX idx_evento_slug ON evento (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX idx_evento_edicion_numero 
ON evento_edicion (evento_id, numero_edicion);
CREATE UNIQUE INDEX idx_evento_edicion_slug 
ON evento_edicion (evento_id, slug);
CREATE TRIGGER trg_catalogo_artista_updated_at
AFTER UPDATE ON catalogo_artista
FOR EACH ROW
BEGIN
    UPDATE catalogo_artista SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE INDEX idx_catalogo_artista_orden ON catalogo_artista(orden);
CREATE INDEX idx_catalogo_artista_activo ON catalogo_artista(activo);
CREATE INDEX idx_catalogo_artista_destacado ON catalogo_artista(destacado);
CREATE INDEX idx_evento_edicion_evento ON evento_edicion (evento_id);
CREATE INDEX idx_evento_edicion_dia_edicion ON evento_edicion_dia (evento_edicion_id);
CREATE INDEX idx_evento_edicion_dia_fecha ON evento_edicion_dia (fecha);
CREATE INDEX idx_artista_imagen_artista ON artista_imagen (artista_id);
CREATE INDEX idx_evento_edicion_dia_lugar ON evento_edicion_dia (lugar_id);
CREATE INDEX idx_artista_historial_artista ON artista_historial (artista_id);
CREATE INDEX idx_artista_historial_pseudonimo ON artista_historial (pseudonimo) WHERE pseudonimo IS NOT NULL;
CREATE INDEX idx_artista_historial_orden ON artista_historial (artista_id, orden);
CREATE TRIGGER trg_evento_edicion_postulacion_updated_at
AFTER UPDATE ON evento_edicion_postulacion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE UNIQUE INDEX idx_artista_slug ON artista (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX idx_artista_correo_pseudonimo ON artista (correo, pseudonimo) WHERE correo IS NOT NULL;
CREATE TRIGGER trg_tipo_actividad_updated_at
AFTER UPDATE ON tipo_actividad
FOR EACH ROW
BEGIN
    UPDATE tipo_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE INDEX idx_exposicion_participante ON participante_exposicion (participante_id);
CREATE INDEX idx_exposicion_disciplina ON participante_exposicion (disciplina_id);
CREATE INDEX idx_exposicion_agrupacion ON participante_exposicion (agrupacion_id);
CREATE INDEX idx_exposicion_estado ON participante_exposicion (estado);
CREATE TRIGGER trg_participante_exposicion_updated_at
AFTER UPDATE ON participante_exposicion
FOR EACH ROW
BEGIN
    UPDATE participante_exposicion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE INDEX idx_actividad_participante ON participante_actividad (participante_id);
CREATE INDEX idx_actividad_tipo ON participante_actividad (tipo_actividad_id);
CREATE INDEX idx_actividad_agrupacion ON participante_actividad (agrupacion_id);
CREATE INDEX idx_actividad_estado ON participante_actividad (estado);
CREATE TRIGGER trg_participante_actividad_updated_at
AFTER UPDATE ON participante_actividad
FOR EACH ROW
BEGIN
    UPDATE participante_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE INDEX idx_participante_evento_edicion ON evento_edicion_participante (evento_edicion_id);
CREATE INDEX idx_participante_artista ON evento_edicion_participante (artista_id);
CREATE INDEX idx_participante_estado ON evento_edicion_participante (estado);
CREATE INDEX idx_participante_modo_ingreso ON evento_edicion_participante (modo_ingreso);
CREATE TRIGGER trg_evento_edicion_participante_updated_at
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE INDEX idx_actividad_participante_actividad ON actividad (participante_actividad_id);
CREATE TRIGGER trg_actividad_updated_at
AFTER UPDATE ON actividad
FOR EACH ROW
BEGIN
    UPDATE actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
COMMIT;
