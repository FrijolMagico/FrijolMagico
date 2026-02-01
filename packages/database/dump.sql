PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS organizacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    mision TEXT,
    vision TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO organizacion VALUES(1,'Asociación Cultural Frijol Mágico','La Asociación Cultural Frijol Mágico es una corporación cultural sin fines de lucro, que desde el 2015, se enfoca su quehacer en el desarrollo de la ilustración, la Narrativa Gráfica, el Diseño y la Animación como disciplinas artísticas y potenciales creativos en la Región de Coquimbo, generando instancias de difusión, programación de actividades culturales, articulación entre artistas e instituciones privadas o públicas, con el fin de ser una plataforma de representación que profesionalice la labor de ilustradores e ilustradoras del territorio.','Nuestra misión es fomentar y promover las expresiones artístico - culturales relacionadas con el quehacer de disciplinas como la Ilustración, la Narrativa Gráfica, el Diseño y la Animación que se desarrollan en la Región de Coquimbo, a través de la realización de actividades que fomenten las economías creativas relacionadas con estas disciplinas, instancias de difusión, formación y la construcción de un ecosistema creativo de participación, vinculación y respeto, con el fin de enriquecer la comunidad del territorio y estimular el diálogo cultural.','Nuestra visión es ser un motor y un referente a nivel local, nacional e internacional que impulse y fortalezca a los artistas que forman parte de nuestro quehacer, generando nuevas oportunidades dentro de las economías creativas. Buscamos que su trabajo en las artes gráficas sea sustentable y sostenible, ampliando sus posibilidades laborales y proyectando su obra hacia otros territorios del país y mercados internacionales.','2026-01-20 03:38:49','2026-01-20 03:38:49');
CREATE TABLE IF NOT EXISTS organizacion_equipo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    cargo TEXT,
    rrss TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_org_equipo_organizacion FOREIGN KEY (organizacion_id)
    REFERENCES organizacion (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS lugar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    direccion TEXT,
    ciudad TEXT,
    coordenadas TEXT,
    url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_lugar_nombre_direccion UNIQUE (nombre, direccion)
);
INSERT INTO lugar VALUES(1,'Monasterio Casa Taller','Peatonal Santo Domingo #228, La Serena','La Serena','{"lat": -29.904389, "lng": -71.253670}',NULL,'2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO lugar VALUES(2,'Centro Cultural Santa Inés','Almagro #232, La Serena','La Serena','{"lat": -29.898163, "lng": -71.252212}',NULL,'2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO lugar VALUES(3,'Bender''s Games','Lautaro #856, La Serena','La Serena','{"lat": -29.90528, "lng": -71.24533}',NULL,'2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO lugar VALUES(4,'Mall VIVO Coquimbo','Avenida Varela #1524, Coquimbo','Coquimbo','{"lat": -29.95786, "lng": -71.33737}','https://www.mallsyoutletsvivo.cl/vivo-coquimbo/','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO lugar VALUES(5,'Casa Editorial Universidad de La Serena','Amunátegui #851, La Serena','La Serena','{"lat": -29.91030, "lng": -71.24648}',NULL,'2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO lugar VALUES(6,'Festival Virtual','Grabado en Estudio19, Coquimbo',NULL,NULL,'https://www.youtube.com/c/FestivalFrijolMágico','2026-01-20 03:38:59','2026-01-20 03:38:59');
CREATE TABLE IF NOT EXISTS disciplina (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO disciplina VALUES(1,'ilustracion','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO disciplina VALUES(2,'narrativa-grafica','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO disciplina VALUES(3,'manualidades','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO disciplina VALUES(4,'fotografia','2026-01-20 03:38:41','2026-01-20 03:38:41');
CREATE TABLE IF NOT EXISTS artista_estado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO artista_estado VALUES(1,'desconocido','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO artista_estado VALUES(2,'activo','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO artista_estado VALUES(3,'inactivo','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO artista_estado VALUES(4,'vetado','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO artista_estado VALUES(5,'cancelado','2026-01-20 03:38:41','2026-01-20 03:38:41');
CREATE TABLE IF NOT EXISTS artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estado_id INTEGER NOT NULL DEFAULT 1,
    nombre TEXT,
    pseudonimo TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    rut TEXT UNIQUE,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_artista_estado FOREIGN KEY (
        estado_id
    ) REFERENCES artista_estado (id)
);
INSERT INTO artista VALUES(1,1,'Paula Rojas Videla','Anima Red','anima-red',NULL,'Animared.ilustracion@gmail.com','{"instagram":"https://Instagram.com/anima.red"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(2,1,'Vanesa Estefanie Vargas Leyton','Shobian','shobian',NULL,'shobian.art@gmail.com','{"instagram":"https://www.instagram.com/shobian.art/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(3,1,NULL,'Fran.Aerre','fran-aerre',NULL,'fran.aerre@gmail.com','{"instagram":"https://www.instagram.com/fran_aerre/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(4,1,'Josefa Aguilera Pérez','Skelly.Uwu','skelly-uwu',NULL,'skelly.ilustra@gmail.com','{"instagram":"https://www.instagram.com/skelly.uwu/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(5,1,NULL,'P3Dro','p3dro',NULL,'p_rojas03@hotmail.com','{"instagram":"https://www.instagram.com/p3dro_rv.03?igsh=MWh2cnRzZHpmeDMzNg=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(6,1,'Ana Aurora Gutiérrez Uribe','Catana','catana',NULL,'holacatana@gmail.com','{"instagram":"https://www.instagram.com/c_a_t_a_n_a/","facebook":"https://web.facebook.com/catanasworld/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(7,1,'Sebastian Aguirre','Seba Endless','seba-endless',NULL,'seba.endlesss@gmail.com','{"instagram":"https://www.instagram.com/seba.endless/","facebook":"https://web.facebook.com/Seba.Endless/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(8,1,NULL,'Viliz_Vz','viliz-vz',NULL,'vilizthementor21@gmail.com','{"instagram":"https://www.instagram.com/viliz_vz?igsh=aTF5dWFzMWl4azl6"}','Vicuña','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(9,1,'Karime Simon Viñales','Karime Simon','karime-simon',NULL,'avinagretta@gmail.com','{"instagram":"https://www.instagram.com/trauerkult_/?hl=es"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(10,1,'Ulises Lopez','Uliseslo','uliseslo',NULL,'tallerelqui@gmail.com','{"instagram":"https://instagram.com/uliseslo","web":"http://fauna-impo.blogspot.com/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(11,1,NULL,'Vale Ilustra','vale-ilustra',NULL,'valeilustra2@gmail.com','{"instagram":"https://www.instagram.com/vale_ilustra?igsh=a21rMmw0cGx5bDlh"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(12,1,NULL,'Nyxandr','nyxandr',NULL,'Nyxandr.contacto@gmail.com','{"instagram":"https://www.instagram.com/nyxandr"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(13,1,'Magdalena Antonia Pizarro Lopez','Canela','canela',NULL,'Canelaqq@gmail.com','{"instagram":"https://www.instagram.com/canela_qq1?igsh=MXdjbWRxOGRmaWZiYQ=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(14,1,NULL,'Grabados Aleph','grabados-aleph',NULL,'angelbarra07@gmail.com','{"instagram":"https://www.instagram.com/grabados_aleph/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(15,1,'Ivannia Belen Jacob García','Ivichu.Jpg','ivichu-jpg',NULL,'Ivabelen@gmail.com','{"instagram":"https://www.instagram.com/ivichu.jpg/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(16,1,NULL,'Osamenta En El Jardin','osamenta-en-el-jardin',NULL,'valeria.suarez.diaz97@gmail.com','{"instagram":"https://www.instagram.com/osamentaseneljardin/"}','Vicuña','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(17,1,'Camila Rosa Malebrán Cabezas','Ckiryuu','ckiryuu',NULL,'madkiryuu@gmail.com','{"instagram":"https://www.instagram.com/ckiryuu","facebook":"https://www.facebook.com/Kiryuu00/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(18,1,NULL,'Aderezo','aderezo',NULL,'addless7u7@gmail.com','{"instagram":"https://instagram.com/addless7u7"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(19,1,NULL,'Purr Creatures','purr-creatures',NULL,'purrcreatures@gmail.com','{"instagram":"https://www.instagram.com/purrcreatures/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(20,1,'Anastassia Bou Copier','Tachipin','tapichin',NULL,'tachipinillustrations@gmail.com','{"web":"https://linktr.ee/Tachipinillustrations13","facebook":"https://web.facebook.com/Tachipin/","instagram":"https://www.instagram.com/tachipinillustrations/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(21,1,NULL,'Saturno','saturno',NULL,'saturnooarte@gmail.com','{"instagram":"https://www.instagram.com/sa_tu_rno/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(22,1,'Constanza Toro','Fluchinick','fluchinick',NULL,'Fluchinick@gmail.com','{"instagram":"https://www.instagram.com/fluchinick/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(23,1,NULL,'Noezzal','noezzal',NULL,'noezzal@gmail.com','{"instagram":"https://www.instagram.com/noezzal"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(24,1,NULL,'Khyaruu','khyaruu',NULL,'khyaruustore@gmail.com','{"web":"https://khyaruu.carrd.co/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(25,1,'Alexis Iván Cepeda Esquivel','Acekuros','acekuros',NULL,'Acekuros@gmail.com','{"instagram":"https://Instagram.com/acekuros"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(26,1,NULL,'Nomito','nomito',NULL,'Olivaresdafne1@gmail.com','{"instagram":"https://www.instagram.com/_n0mito.art_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(27,1,NULL,'Chiimewe','chiimewe',NULL,'chiimewe@gmail.com','{"instagram":"https://www.instagram.com/chiimewe?igsh=cG96N2txaWdseGtt"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(28,1,NULL,'Yem','yem',NULL,'j.n.t.c.200312@gmail.com','{"instagram":"https://www.instagram.com/yem.ito_art?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(29,1,NULL,'Skyderen','skyderen',NULL,'marcelovergara4507@gmail.com','{"web":"https://linktr.ee/_skyderen"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(30,1,NULL,'Ghostie','ghostie',NULL,'lcmr.brownstone@gmail.com','{"instagram":"https://www.instagram.com/lc_mr.brownstone?igsh=cjFmaHljbjhlczN4"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(31,1,'Camila Guamán','Camila Guaman','camila-guaman',NULL,'camilaguaman.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/camilaguaman.ilustracion","facebook":"https://web.facebook.com/chinchillacosmica/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(32,1,'Liset Retamal','Astro Glitter','astro-glitter',NULL,'astroglitter.studio@gmail.com','{"instagram":"https://www.instagram.com/astro.glitter/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(33,1,'Jorge Diaz Yueng','Niño Pan','nino-pan',NULL,'elninopan99@gmail.com','{"instagram":"https://www.instagram.com/elninopan","facebook":"https://web.facebook.com/colectivoninopan/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(34,1,'Camila Herrera','Camellia Liz','camellia-liz',NULL,'camihlatournerie@gmail.com','{"instagram":"https://www.instagram.com/camellia.liz","facebook":"https://web.facebook.com/camellializ/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(35,1,'Alejandra Avilés','Hanrra','hanrra',NULL,'hanrra.artwork@gmail.com','{"instagram":"https://www.instagram.com/hanrra.artwork/","facebook":"https://web.facebook.com/hanrraartwork/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(36,1,NULL,'Sakanita','sakanita',NULL,'sakanastationery@gmail.com','{"instagram":"https://instagram.com/_sakanita_/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(37,1,'Pablo Araya','Chilensis','chilensis',NULL,'Chilensisboy@gmail.com','{"instagram":"https://www.instagram.com/chilensisboy/","facebook":"https://web.facebook.com/chilensisboy/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(38,1,'Alejandro Jorquera','El Ale','el-ale',NULL,'creativotrama@gmail.com','{"instagram":"https://www.instagram.com/elale_ilustrador/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(39,1,'Francisco Valdivia Aguirre','Pancho Valdivia','pancho-valdivia',NULL,'HOMBREMEDIVAL@gmail.com','{"instagram":"https://www.instagram.com/pancho_valdivia/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(40,1,NULL,'Polet Komiksu','polet-komiksu',NULL,'poletcomics@gmail.com','{"instagram":"https://www.instagram.com/poletkomiksu?igsh=MXd1bHdsOTd6YWl4cg=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(41,1,'Diego Maya','Futuro Comics','futuro-comics',NULL,'contactodiegomaya@gmail.com','{"instagram":"http://instagram.com/futurocomics"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(42,1,NULL,'Carvajal Ilustraciones','carvajal-ilustraciones',NULL,'nacionautonoma@yahoo.es','{"instagram":"https://www.instagram.com/carvajalilustraciones/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(43,1,'Rodan Castro Muñoz','Rotten Monkey','rotten-monkey',NULL,'ro.felipe768@gmail.com','{"instagram":"https://instagram.com/rottenmonkey_inc/","facebook":"https://web.facebook.com/rottenmonkeyinc/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(44,1,'Pía Ahumada','Me Pego Un Tiro','me-pego-un-tiro',NULL,'tallermepegountiro@gmail.com','{"instagram":"https://www.instagram.com/mepegountiro?igsh=NW40MW5udWl4OGM0"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(45,1,'Fernanda Pérez Pérez','Mami Sita','mami-sita',NULL,'Mamisitamodeon@gmail.com','{"instagram":"https://Instagram.com/mamisitamodeon"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(46,1,'Pía Fredes','Sra Tonks','sra-tonks',NULL,'nidoodepajaros@gmail.com','{"instagram":"https://www.instagram.com/sratonks/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(47,1,NULL,'Alkimia','alkimia',NULL,'Valentinasofiascalderon@gmail.com','{"instagram":"https://www.instagram.com/alkimia.cl?igsh=MW9vZDZhcWs2d3YxbQ=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(48,1,'Jessica Gutierrez Vega','Kao Artwork','kao-artwork',NULL,'Kathykiba@gmail.com','{"instagram":"https://www.instagram.com/kao.art.work/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(49,1,NULL,'De Cordillera','de-cordillera',NULL,'decordillerachile@gmail.com','{"instagram":"https://www.instagram.com/decordillera"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(50,1,NULL,'Bolbarán Cómics','bolbaran-comics',NULL,'jose.bolbaran.r@gmail.com','{"instagram":"https://www.instagram.com/jose.bolbaran.r/"}','Ovalle','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(51,1,NULL,'Pat_trashoart','pat-trashoart',NULL,'benjaminurrutiaramos@gmail.com','{"instagram":"https://www.instagram.com/pat_trashoart?igsh=MTZ2b3Q1bDdod2MxeQ=="}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(52,1,'Valeria Venegas Fernández','Blanquis','blanquis',NULL,'blanquis.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/blanquis.ilus/","facebook":"https://www.facebook.com/blanquis.ilus/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(53,1,NULL,'Kmilu','kmilu',NULL,'camila.inostroza.liebsch@gmail.com','{"instagram":"https://www.instagram.com/kmiluup?igsh=Ym1vbGx3Y3R1ZXNu"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(54,1,'Chris Olivares','Remebranzas Negras','remebranzas-negras',NULL,'floresolivarescc@gmail.com','{"instagram":"https://www.instagram.com/remembranzas_negras/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(55,1,'Eve Maluenda','N0tarts','n0tarts',NULL,'epmg990@gmail.com','{"instagram":"https://www.instagram.com/n0tarts"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(56,1,NULL,'Microbits','microbits',NULL,'contacto@fabianvallejos.cl','{"instagram":"https://www.instagram.com/maikurobitto/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(57,1,NULL,'Bekzar','bekzar',NULL,'felipe.becar@mayor.cl','{"instagram":"https://www.instagram.com/bekzar.art/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(58,1,NULL,'Arcanista draws','arcanista-draws',NULL,'arcanistadraws@gmail.com','{"instagram":"https://instagram.com/arcanistadraws"}','Ovalle','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(59,1,NULL,'Francisco Llimy','francisco-llimy',NULL,'francisco.llimy@gmail.com','{"instagram":"https://www.instagram.com/francisco.llimy/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(60,1,NULL,'JaviiIlustrations','javiiilustrations',NULL,'javieraramirez351@gmail.com','{"instagram":"https://www.instagram.com/javiiilustrations_?igsh=c2p5bnd4bDNkeDdi"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(61,1,NULL,'Ilustración khasumii','ilustracion-khasumii',NULL,'daniela18042@gmail.com','{"instagram":"https://www.instagram.com/_khasumii_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(62,1,NULL,'Yatiediciones','yatiediciones',NULL,'layatiediciones@gmail.com','{"instagram":"https://www.instagram.com/editorial_yatiediciones"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(63,1,'Victoria Rubio','Lesbilais','lesbilais',NULL,'vicky.rubio@gmail.com','{"instagram":"https://www.instagram.com/lesbilais/"}','Crevillent','España','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(64,1,'Maira Alday Villalobos','Myru Ann','myru-ann',NULL,'myruann@gmail.com','{"instagram":"https://www.instagram.com/myru.ann","facebook":"https://web.facebook.com/myruann/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(65,1,NULL,'Pininati','pininati',NULL,'nati.macaya@gmail.com','{"instagram":"https://www.instagram.com/pininati/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(66,1,NULL,'Flowerspower','flowerspower',NULL,'nramirezrivera1@gmail.com','{"instagram":"https://www.instagram.com/el_flowers_power?igsh=MTdpOW12cWtsNXR2bw=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(67,1,NULL,'Minino_nyart','minino-nyart',NULL,'ninoskhalohmayer@gmail.com','{"instagram":"https://www.instagram.com/minino_nyart?igsh=MWM2N3Mybm55ZjRhdA=="}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(68,1,'Claudia Lazo Gajardo','Paper pupy','paper-pupy',NULL,'claudialazo.gajardo@gmail.com','{"instagram":"https://www.instagram.com/paperpupy"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(69,1,'Javiera Génesis Gonzalez Trujillo','Peliitos','peliitos',NULL,'pelitos.pelitos123@gmail.com','{"instagram":"https://www.instagram.com/_peliitos_"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(70,1,NULL,'Planea papeleria','planea-papeleria',NULL,'rocio.medina.h@gmail.com','{"instagram":"https://www.instagram.com/planeapapeleria/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(71,1,'Marcelo Tapia','Solid Ediciones','solid-ediciones',NULL,'disenorgb@gmail.com','{"instagram":"https://www.instagram.com/solidediciones/","facebook":"https://web.facebook.com/solidediciones"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(72,1,NULL,'Sueño de Pajaro','sueno-de-pajaro',NULL,'suenodepajaro@gmail.com','{"instagram":"https://www.instagram.com/suenodepajaro/"}','Vicuña','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(73,1,NULL,'Tekaeme','tekaeme',NULL,'tekaemeilustraciones@gmail.com','{"instagram":"https://www.instagram.com/tekaeme____/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(74,1,NULL,'Ruvale','ruvale',NULL,'ruvale123@gmail.com','{"instagram":"https://www.instagram.com/ruruvale/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(75,1,NULL,'WasabiPNG','wasabipng',NULL,'powerpowmail@gmail.com','{"instagram":"https://www.instagram.com/sgt_wasabi/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(76,1,NULL,'Ilustravel','ilustravel',NULL,'holavelgato@gmail.com','{"instagram":"https://www.instagram.com/bel.ilustravel/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(77,1,NULL,'Intercultural Arte','intercultural-arte',NULL,'josecifuentes983@gmail.com','{"instagram":"https://www.instagram.com/intercultural_arte_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(78,1,NULL,'Tierramarga','tierramarga',NULL,'c.diazt92@gmail.com','{"instagram":"https://www.instagram.com/_tierramarga/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(79,1,NULL,'Ensimismada','ensimismada',NULL,'ensimismada00@gmail.com','{"instagram":"https://www.instagram.com/ensimismada.cl/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(80,1,'Karen Valenzuela','Prrr Miaow','prrr-miaow',NULL,'karenvalen.diseno@gmail.com','{"instagram":"https://www.instagram.com/prrr.miaow?igsh=MTlxdDE4cDZ2aGx1cA==","facebook":"https://web.facebook.com/Prrr-Miaow-179920085887390/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(81,1,'Javier Carvajal Ramírez','Javo_Siniestro','javo-siniestro',NULL,'javosiniestre@gmail.com','{"instagram":"https://www.instagram.com/javo_siniestro/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(82,1,NULL,'Coticocodrila','coticocodrila',NULL,'Holacoticocodrila@gmail.com','{"instagram":"https://www.instagram.com/coticocodrila/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(83,1,NULL,'Cat_linaa_art','cat-linaa-art',NULL,'och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/cat_linaa_art/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(84,1,NULL,'Namine Anami','namine-anami',NULL,'namineanami@gmail.com','{"instagram":"https://www.instagram.com/namineanami/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(85,1,NULL,'Cazar al tiburon','cazar-al-tiburon',NULL,'f.zambranoaviles@gmail.com','{"instagram":"https://www.instagram.com/cazaraltiburon.cl/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(86,1,NULL,'Tati San Martin','tati-san-martin',NULL,'tatimartin333@gmail.com','{"instagram":"https://www.instagram.com/tatimartin_artista/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(87,1,NULL,'p0chi_kun','p0chi-kun',NULL,'och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/p0chi_kun/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(88,1,'Gabriela Contreras Arancibia','Blue Straycatt Art','blue-straycatt-art',NULL,'gabriela95_contreras@hotmail.com','{"instagram":"https://www.instagram.com/blue_straycatt_art/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(89,1,'Daniel Allende','Danyfoo','danyfoo',NULL,'danyfoo.art@gmail.com','{"instagram":"https://www.instagram.com/danyfoo_art/","facebook":"https://web.facebook.com/Danyfooart/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(90,1,'Cristian Correa Zuleta','Darkos','darkos',NULL,'darkoscorreaz@gmail.com','{"instagram":"https://www.instagram.com/darkoscorrea/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(91,1,'Francisco Toro','Decay','decay',NULL,'f-toro@live.cl','{"instagram":"https://www.instagram.com/decay.ink/","facebook":"https://web.facebook.com/decaying.ink/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(92,1,'Gabriela Elgueta','Drömmer Art','drommer-art',NULL,'drommer.art@gmail.com','{"instagram":"https://www.instagram.com/drommer_art/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(93,1,'Claudia Tardito Herreros','Groteska','groteska',NULL,'hola@groteska.cl','{"instagram":"https://www.instagram.com/lagroteska/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(94,1,'Jonathan Barraza Veas','Jonariel','jonariel',NULL,'jonathanbv.1995@gmail.com','{"instagram":"https://www.instagram.com/jonariel20/","facebook":"https://web.facebook.com/JonAriel20"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(95,1,'Judy Helena Malla','JudyDoodles','judydoodles',NULL,'j.helenita@gmail.com','{"instagram":"https://www.instagram.com/judy_doodles/","facebook":"https://web.facebook.com/judydoodles/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(96,1,'Lucas Alvayay Durand','La Nueve Ce','la-nueve-ce',NULL,'richarhoos@gmail.com','{"instagram":"https://www.instagram.com/lanuevece/?hl=es-la"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(97,1,'Felipe Orlando Larco Mondaca','Larcolepsia','larcolepsia',NULL,'larcolerico@gmail.com','{"instagram":"https://www.instagram.com/larcolepsia/?hl=es-la"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(98,1,'Maximiliano Roco','MaxRoco','maxroco',NULL,'maxroco@gmail.com','{"instagram":"https://www.instagram.com/proyectomaxroco/","facebook":"https://web.facebook.com/proyectomaxroco/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(99,1,'Daniel Álvarez Vega','MonHaku','monhaku',NULL,'danielart.195@gmail.com','{"instagram":"https://www.instagram.com/hakuya_kou/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(100,1,'Matías Eduardo Palominos Alarcón','Mr. Palominos','mr-palominos',NULL,'mpalominosa@gmail.com','{"instagram":"https://www.instagram.com/malosjuguetes/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(101,1,'Arlett Vanessa Carvaja','Mysterylol','mysterylol',NULL,'mysterylolxd@gmail.com','{"instagram":"https://www.instagram.com/dibujan2_anim3/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(102,1,'Nevenka Sophia Silva González','Neve.nes','nevenes',NULL,'neve.90@gmail.com','{"instagram":"https://www.instagram.com/neve.nes/","facebook":"https://web.facebook.com/Nevenka.Silva.G/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(103,1,'Samuel Araya','Samuel Araya C Artwork (Florido)','samuel-araya-c-artwork-florido',NULL,'samuel.araya.c@gmail.com','{"instagram":"https://www.instagram.com/samarayaart/","facebook":"https://web.facebook.com/Samuelarayac.artworks/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(104,1,'Johanina Alfaro Rojas','Simio','simio',NULL,'johaalfarorojas@gmail.com','{"instagram":"https://www.instagram.com/il_simiox/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(105,1,'Solange Pacheco Ortiz','Sol Pacheco','sol-pacheco',NULL,'solangepacheco.sp@gmail.com',NULL,'Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(106,1,NULL,'Tommy Astorga','tommy-astorga',NULL,'tepunto@gmail.com','{"instagram":"https://www.instagram.com/tommyastorga/","facebook":"https://web.facebook.com/AstorgaTommy/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(107,1,'Andrea Diaz Godoy','Andreadiasnublados','andreadiasnublados',NULL,'andriusday93@gmail.com','{"artstation":"https://www.artstation.com/andreadiasnublados"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(108,1,'Nicole Alexa Astorga Vega','exe.cute.me','executeme',NULL,'nicomccurdy@gmail.com','{"instagram":"https://www.instagram.com/exe.cute.me/"}','Illapel','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(109,1,'Antoniett Rivera Maya','Abejas Negras (Niett)','abejas-negras-niett',NULL,'ant.rivv@gmail.com','{"instagram":"https://www.instagram.com/abejasnegras/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(110,1,'Elba Gamonal Ruiz-Crespo','Agua de Quisco','agua-de-quisco',NULL,'elbagamonal@gmail.com','{"instagram":"https://www.instagram.com/agua_de_quisco_ilustraciones/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(111,4,'Benjamin Vega Rodriguez','Aitue','aitue',NULL,'benja.vega0799@gmail.com','{"instagram":"https://www.instagram.com/aitue_art/?hl=es-la"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(112,1,'Margareth Gricell Contreras Mondaca','Amaggieanthine','amaggieanthine',NULL,'margareth.gricell@gmail.com','{"instagram":"https://www.instagram.com/_thanksthestars_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(113,1,'Valentina Aurora Ravello Argandoña','Aurora Ravello','aurora-ravello',NULL,'valeravello1@gmail.com','{"instagram":"https://www.instagram.com/aurora_ravello/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(114,1,'Camila Olivares/José Flores','Camipepe','camipepe',NULL,'camiiipepe@gmail.com','{"instagram":"https://www.instagram.com/camiipepe/","facebook":"https://web.facebook.com/camiipepee/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(115,1,'Fiorella Tosetti Contreras','Caotica Ilustrada','caotica-ilustrada',NULL,'caotica.siempre@gmail.com','{"instagram":"https://www.instagram.com/caotica_ilustrada/","facebook":"https://web.facebook.com/caotica.ilustrada.7"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(116,1,'Elisa Carolina Piñones','Caro PZ','caro-pz',NULL,'caroi.uleta@gmail.com','{"instagram":"https://www.instagram.com/_karo.pezeta_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(117,1,'Belen Aguilar','CLEIB','cleib',NULL,'beleaguilar23@gmail.com','{"instagram":"https://www.instagram.com/_cleib/","facebook":"https://web.facebook.com/Bel%C3%A9n-Aguilar-152951941518422/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(118,1,'Romina Villegas','Collarcitos RV','collarcitos-rv',NULL,'cabezaortopedica@gmail.com','{"instagram":"https://www.instagram.com/collarcitosrv/","facebook":"https://web.facebook.com/Collarcitos"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(119,1,'Cristian Marín','Cris Crowfin','cris-crowfin',NULL,'cristian.p.marin@gmail.com','{"instagram":"https://www.instagram.com/crowfin_art/","facebook":"https://web.facebook.com/Cris-Crowfin-866981636665660/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(120,1,'Daniella Le-Brauer','Dani Lee','dani-lee',NULL,'danille28@gmail.com','{"instagram":"https://www.instagram.com/dani_lee_astro_art/","facebook":"https://www.facebook.com/DaniLeeArt28/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(121,1,'Francisca Alejandra Silva Piña','Diseños Pineapple','disenos-pineapple',NULL,'francisca.silva.2002@gmail.com','{"instagram":"https://www.instagram.com/disenospineapple/","facebook":"https://www.facebook.com/franciscapineapple/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(122,1,'Romina Aguilera Zúñiga','Luna Gatuna','luna-gatuna',NULL,'lunagatunatattoo@gmail.com','{"instagram":"https://www.instagram.com/lunagatuna.tt"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(123,1,'Christian Herrera','Christian Herrera','dragonest-studio',NULL,'herrera.chris95@gmail.com','{"instagram":"https://www.instagram.com/chriss.herrera/","facebook":"https://web.facebook.com/chrisherrera95/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(124,1,'Iván Andrés Jorquera Olivares','elMeNeSe','elmenese',NULL,'ivanjorquera.o@gmail.com','{"instagram":"https://www.instagram.com/elmenese/","web":"http://www.ivanjorquera.cl/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(125,1,'Harold Olivares Sarmiento','HOS','hos',NULL,'hos.artes@gmail.com','{"instagram":"https://www.instagram.com/hos.art/","facebook":"https://web.facebook.com/hos.artes/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(126,1,'Ignacio Israel Valdivia Ávalos','Ignacio Gato','ignacio-gato',NULL,'ignacio.kittycat@gmail.com','{"instagram":"https://www.instagram.com/ignacio_gato_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(127,1,'Sofia Rivera','Inky Cotton','inky-cotton',NULL,NULL,'{"instagram":"https://www.instagram.com/inkycotton/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(128,1,'Isabela Adaos Véliz','Isa Edaliz','isa-edaliz',NULL,'isaedaliz@gmail.com','{"instagram":"https://www.instagram.com/isaedaliz/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(129,1,'José Ignacio Cifuentes Pizarro','Jotace','jotace',NULL,'jc.dibujos@gmail.com','{"instagram":"https://www.instagram.com/jotace_dibujos/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(130,1,'Catalina Ramirez','Katassj','katassj',NULL,'katassjilustra53@gmail.com','{"instagram":"https://www.instagram.com/katassj/?hl=es-la"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(131,1,'Sofía Rojas Meza','Keimara','keimara',NULL,'sofiarojasmeza@gmail.com','{"instagram":"https://www.instagram.com/_keimara/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(132,1,'Francisca Rayen Riquelme Araya','Khira Yoshi','khira-yoshi',NULL,'onyx.yue@gmail.com','{"instagram":"https://www.instagram.com/khirayoshi/","facebook":"https://web.facebook.com/KhiraYoshi/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(133,1,'Noelia Guerra Flores','Kompas Ilustration','kompas-ilustration',NULL,'dallamokompas@gmail.com','{"instagram":"https://www.instagram.com/kompas_ilu/","facebook":"https://web.facebook.com/kompasillustration/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(134,1,'Francisca Casanova','KybArt','kybart',NULL,'byeongari.hun@gmail.com','{"instagram":"https://www.instagram.com/kyb_art/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(135,1,'Tamara Sepúlveda','Lady Beelze','lady-beelze',NULL,'tamarasepul@gmail.com','{"instagram":"https://www.instagram.com/ladybeelze/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(136,1,'Yarela Briceño Volta','Manitas E Gato','manitas-e-gato',NULL,'manitasegato@gmail.com','{"instagram":"https://www.instagram.com/manitas_e_gato/","facebook":"https://web.facebook.com/manitasegato/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(137,1,'Soffia Chirino Montaño','Mermaid Curse','mermaid-curse',NULL,'scchirinom@gmail.com','{"instagram":"https://www.instagram.com/mermaidcurse.art/","facebook":"https://web.facebook.com/mermaid.curseart/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(138,1,'Francesca Gamboni Núñez','Momofurambu','momofurambu',NULL,'fran.gamboni@gmail.com','{"instagram":"https://www.instagram.com/__franbuesa/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(139,1,'Rene Araya','Neeh Re','neeh-re',NULL,'rene.f.arayaramirez@gmail.com','{"instagram":"https://www.instagram.com/neeh_re/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(140,1,'Vanessa Gonzalez Schifferli','Nerdy Roll','nerdy-roll',NULL,'vanessa.260601@gmail.com','{"facebook":"https://web.facebook.com/NerdyRoll/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(141,1,'Alan Salinas Ángel','Noctam','noctam',NULL,'alansalinasangel@gmail.com','{"instagram":"https://www.instagram.com/noctam.ilustra/","facebook":"https://web.facebook.com/noctam.ilustra/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(142,1,'Fernanda Aguirre Mussa','No Me Dicen Fer','no-me-dicen-fer',NULL,'fer.aguirre4@gmail.com','{"instagram":"https://www.instagram.com/nomedicenfer/","facebook":"https://web.facebook.com/nomedicenfer/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(143,1,'Karla Jeraldo','No Soy Tan Cool','no-soy-tan-cool',NULL,'nosoytancool@gmail.com','{"facebook":"https://web.facebook.com/nosoytancool.illustration/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(144,1,'Pablo Fernández Araya','Pablo Design','pablo-design',NULL,'pablojfernandezaraya@gmail.com','{"instagram":"https://www.instagram.com/pablofernandez.diseno/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(145,1,'Daniela Véliz Baeza','Pezenunpapel','pezenunpapel',NULL,'pezenunpapel@gmail.com','{"instagram":"https://www.instagram.com/pezenunpapel/","facebook":"https://web.facebook.com/pezenunpapel/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(146,1,'Anselmo Grandón','Pez Monstruo (Mo)','pez-monstruo-mo',NULL,'anselmo.grahen@gmail.com','{"instagram":"https://www.instagram.com/pezmonstruo/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(147,1,'Carolina Puerta','PinkuNina','pinkunina-nina-racoon',NULL,'pinkbang.nina@gmail.com','{"instagram":"https://www.instagram.com/pinku_nina/","facebook":"https://web.facebook.com/PinkuNina/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(148,1,'Camila Fernández','Planta Verde','planta-verde',NULL,'plantaaverde@gmail.com','{"instagram":"https://www.instagram.com/plantaaverdeart/","facebook":"https://web.facebook.com/plantaaverde/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(149,1,'Sophia Dianne Sánchez D''Arcangeli','Poppy','poppy',NULL,'darcangeli764@gmail.com','{"instagram":"https://www.instagram.com/_poppyxd_/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(150,1,'Pablo Marambio Costagliola','Raigmann (GalactikPainting)','raigmann-galactikpainting',NULL,'pablomarambio.marambio@gmail.com','{"deviantart":"https://www.deviantart.com/raigmann","instagram":"https://www.instagram.com/raigmann/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(151,1,'Daniel Muñoz','Reptilians','reptilians',NULL,'st.daniel.ark@gmail.com','{"instagram":"https://www.instagram.com/reptillians.attack/","facebook":"https://www.facebook.com/reptillian.demons/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(152,1,'Carolina Angélica Barraza Cortés','Shiemi-Hime','shiemi-hime',NULL,'shiemi.purr@gmail.com','{"instagram":"https://www.instagram.com/shiemi_hime/","facebook":"https://web.facebook.com/ShiemiHime/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(153,1,'Valentina Zepeda Jopia','Shishi de Colores (Vandaloves)','shishi-de-colores-vandaloves',NULL,'valentinaandrea.zepeda@gmail.com','{"instagram":"https://www.instagram.com/shishidecolores/","facebook":"https://web.facebook.com/shishidecolores/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(154,1,'Sofía Alexandra Marambio Cortés','Sofi_niscus','sofiniscus',NULL,'sofiadango19@gmail.com','{"instagram":"https://www.instagram.com/sofi_niscus/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(155,1,'Francisca Cortes Santander','Stay Cactus','stay-cactus',NULL,'francilucortes@gmail.com','{"instagram":"https://www.instagram.com/staycactusfanzine/","facebook":"https://web.facebook.com/staycactus/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(156,1,'Sol Morales','Sun morales','sun-morales',NULL,'sunmorales35@gmail.com','{"instagram":"https://www.instagram.com/sunmorales/","facebook":"https://web.facebook.com/SunmoralesB/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(157,1,'Carla Vargas','The Bunny Art','the-bunny-art',NULL,'vargascastro.c@gmail.com','{"instagram":"https://www.instagram.com/c.vargasc/","facebook":"https://www.facebook.com/carla.vargascastro"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(158,1,'Alonso Martínez','Tigre Maltés','tigre-maltes',NULL,'alonsomartinez07@gmail.com','{"instagram":"https://www.instagram.com/tigre_maltes/","facebook":"https://web.facebook.com/tigremaltes/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(159,1,'Camila Belén Arévalo Cabrera','Tsuki','tsuki',NULL,'camila.barevalo@gmail.com','{"instagram":"https://www.instagram.com/blanchettetsuki","facebook":"https://www.fb.com/Tsukiarte"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(160,1,'Vallery Lorca Toledo','Valerie Lorca','valerie-lorca',NULL,'vallery.lorca@hotmail.es','{"instagram":"https://www.instagram.com/valerie_lorca/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(161,1,'Valentina Fernanda Fuentealba Palavicino','VALESTRINA','valestrina',NULL,'valestrina4@gmail.com','{"instagram":"https://www.instagram.com/valestrina_art/","tapas":"https://tapas.io/series/KUSH-ES"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(162,1,'Victor Ledezma Vega','Victor Illustrations','victor-illustrations',NULL,'victor.ledezma.vega@gmail.com','{"instagram":"https://www.instagram.com/victor_illustrations/","behance":"https://www.behance.net/VictorLedezma"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(163,1,'Constanza Valentina Godoy Díaz','Yucenkio','yucenkio',NULL,'constanza.pgb.2016@gmail.com','{"instagram":"https://www.instagram.com/yucenkio/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(164,1,'Camila Rivera','Internet Princess','internet-princess',NULL,NULL,'{"instagram":"https://www.instagram.com/miss.camomille/","facebook":"https://web.facebook.com/InternettPrincess/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(165,1,'Consuelo Valentina Huerta Pereira','Co(Mentedemente)','comentedemente',NULL,'consuelo.huerta@outlook.com','{"instagram":"https://www.instagram.com/co.mentedemente/"}','Ovalle','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(166,1,'Giovanna Baldecchi Varela','Olyves','olyves-ex-moriciel',NULL,'azumaltrejo@gmail.com','{"instagram":"https://www.instagram.com/olyves.mori/","facebook":"https://web.facebook.com/Giovy-293827087299049/"}','Tongoy','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(167,1,'Felipe de Ferari Prats','Felipe de Ferari','felipe-de-ferari',NULL,'felipedeferari@gmail.com','{"instagram":"https://www.instagram.com/felipedeferari/","facebook":"https://web.facebook.com/Artes-Visuales-Felipe-De-Ferari-wwwdeferaricl-130585523670889/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(168,1,'Carolina Aguirre','We Are Tea','we-are-tea',NULL,'carolina.aguirre.skarlis@gmail.com','{"instagram":"https://www.instagram.com/we.are.tea.ilustraciones/","tumblr":"https://wearetea.tumblr.com/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(169,1,'Nicolás Torres','Nico el Mito','nico-el-mito',NULL,'nicolas.torrestapia@gmail.com','{"instagram":"https://www.instagram.com/nicoelmito/","facebook":"https://web.facebook.com/nicoelmito/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(170,1,'Cynthia Vega','Kio PsicodelicArt','kio-psicodelicart',NULL,'cynthia.vega@gmail.com','{"facebook":"https://web.facebook.com/Kio-PsicodelicArt-1711808738837633/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(171,1,'Bryan Bautista Correa','Crazy Monkey','crazy-monkey',NULL,'cm.diseno7@gmail.com','{"facebook":"https://web.facebook.com/crazymonkeydesing/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(172,1,'Lia Ponce Montecinos','Bubble Trafic','bubble-trafic',NULL,'liarqponce@gmail.com','{"instagram":"https://www.instagram.com/bubbletrafic/","facebook":"https://web.facebook.com/BuuubbleTraaafic/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(173,1,'André Alejandro Pizarro','André','andre',NULL,'aerograndes@gmail.com','{"instagram":"https://www.instagram.com/andrekamin/","facebook":"https://web.facebook.com/andre.alejand"}','Ovalle','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(174,1,'Pamela Alejandra Contreras Guerra','Alza el Vuelo','alza-el-vuelo',NULL,'pamela.contreras@live.com','{"instagram":"https://www.instagram.com/tiendalzaelvuelo/","facebook":"https://www.facebook.com/Alza-el-vuelo-860809420599226/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(175,1,'Ellizabeth Fernanda Araya Loyola','Anticática Accesorios','anticatica-accesorios',NULL,'ellizabeth.araya@gmail.com','{"instagram":"https://www.instagram.com/anti.accesorios/"}','Ovalle','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(176,1,'Sebastian Oteiza','Editorial Antítesis','antitesis-editorial',NULL,'oteiza.sebastian@gmail.com','{"facebook":"https://web.facebook.com/EditorialAntitesis/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(177,1,'Karina Constanza Berríos Cortés','Artbutterfly','artbutterfly',NULL,'kony1288@gmail.com','{"instagram":"https://www.instagram.com/_artbutterfly_/","web":"https://unibles.com/Artbutterfly"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(178,1,'Sofia Ramirez','Astronomical Patches','astronomical-patches',NULL,NULL,'{"facebook":"https://web.facebook.com/astronomicalpatch3s/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(179,1,'Andrea Nicol Ledezma Díaz','BordabaMoza','bordabamoza',NULL,'andrea.ledezmad@gmail.com','{"instagram":"https://www.instagram.com/bordabamoza/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(180,1,'Pablo Durand Alegre','Brodat','brodat',NULL,'p.durand.a@gmail.com','{"instagram":"https://www.instagram.com/tienda.brodat/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(181,1,'Bastian Tello Campusano','Cala Cala Ká','cala-cala-ka',NULL,'botc@live.cl','{"facebook":"https://www.facebook.com/Editorial-Cala-Cala-k%C3%81-232505914219389/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(182,1,'Paula González','Cielomenta','cielomenta',NULL,'paual12021@gmail.com','{"facebook":"https://web.facebook.com/cielomentaaccesorios/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(183,1,'Gonzalo Vilo','Experimental Lunch','experimental-lunch',NULL,NULL,NULL,'Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(184,1,'Francisca Vergara','Flancito Store','flancito-store',NULL,'fran.vergara94@gmail.com','{"facebook":"https://web.facebook.com/FlancitoStore/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(185,1,'Guillermo Francisco Nuñez Perez','Guillermo Francisco','guillermo-francisco',NULL,'guillermo.francisco.n@gmail.com','{"instagram":"https://instagram.com/_guillermofrancisco"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(186,1,'Marisol Ahumada Diaz','Gumis de Colores','gumis-de-colores',NULL,'maiteka2003@hotmail.com','{"facebook":"https://web.facebook.com/Gumisdecolores/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(187,1,'Felipe Monje Pinto','Hamabeads La Serena','hamabeads-la-serena',NULL,'hamabeads.ls2019@gmail.com','{"instagram":"https://www.instagram.com/hamabeads_ls/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(188,1,'Carolina Vivanco','Ivory Market','ivory-market',NULL,'ivory.im.different@gmail.com','{"facebook":"https://web.facebook.com/IvoryMarket/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(189,1,'Javiera Fernández Barahona','Javi Accesorios','javi-accesorios-ex-miko',NULL,'javieramfb@gmail.com',NULL,'La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(190,1,'Evelyn Carolina Alday Espinosa','Kallfu','kallfu',NULL,'evelynalday@hotmail.com','{"instagram":"https://www.instagram.com/_kallfu_/","facebook":"https://web.facebook.com/kallfu.accesorios/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(191,1,NULL,'Kaptus','kaptus',NULL,'kaptusregalaydecora@gmail.com','{"facebook":"https://web.facebook.com/kaptus.ls/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(192,1,'Viviana Vega','Kguai Store','kguai-store',NULL,'viviana.vegam@gmail.com','{"facebook":"https://web.facebook.com/kguai.store/"}','Vicuña','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(193,1,NULL,'Koko','koko',NULL,NULL,'{"instagram":"https://www.instagram.com/koko_diseno/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(194,1,'Andrea Aquea Carmona','Kusudumame','kusudumame',NULL,'kusudamame0@gmail.com','{"instagram":"https://www.instagram.com/kusudamame_/","facebook":"https://web.facebook.com/kusudamame0/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(195,1,'Karla Pineda','Limon Ventitas','limon-ventitas',NULL,'k.p.angel93@gmail.com','{"facebook":"https://web.facebook.com/LimonVentitas/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(196,1,NULL,'Macanudo Design','macanudo-design',NULL,'macanudo.design@gmail.com','{"facebook":"https://web.facebook.com/macanudo.design/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(197,1,'Paula Pacheco Orellana','Mallwa','mallwa',NULL,'paulapacheco.p@gmail.com','{"instagram":"https://www.instagram.com/mallwa_accesorios/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(198,1,'Carolina Casanova','Manitos de Quinqui','manitos-de-quinqui',NULL,'carolina.casanova.garcia@gmail.com','{"facebook":"https://web.facebook.com/manitosdequinqui/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(199,1,'Javiera Paz Carrillos Gonzalez','Mestiza Joyeria','mestiza-joyeria',NULL,'javiera.carrillos@gmail.com','{"instagram":"https://www.instagram.com/mestizajoyeria/"}','Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(200,1,'María Paulina Godoy Álvarez','Mi Colet','mi-colet',NULL,'paaiflor@gmail.com','{"instagram":"https://www.instagram.com/micolet.ls/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(201,1,'Melissa Osandon','Mi Chamaca','mi-chamaca',NULL,'melissandon.araya@gmail.com','{"facebook":"https://web.facebook.com/michamacailustraciones/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(202,1,'Elizabeth Pasmiño','Mi Croquera','mi-croquera',NULL,'elipasmino@gmail.com','{"instagram":"https://www.instagram.com/microquera/","facebook":"https://web.facebook.com/microquera/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(203,1,'Rocio Muñoz Morales','Moiris Design','moiris-design',NULL,'moiris.design@gmail.com','{"instagram":"https://www.instagram.com/moiris.design/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(204,1,'Nicole Ibarra Jara','Nicfotos','nicfotos',NULL,'nicoleibarraj@gmail.com','{"instagram":"https://www.instagram.com/nicfotos/","behance":"https://www.behance.net/nicoleibarra"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(205,1,'Manuel Pereira Araya','Okato Design****','okato-design',NULL,'okatown@gmail.com','{"instagram":"https://www.instagram.com/okatodesign/","facebook":"https://web.facebook.com/disenos.okatodesign"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(206,1,'Carolina Contreras Soto','Pochi Amigurumi','pochi-amigurumi',NULL,'amigurumisosweet@gmail.com','{"facebook":"https://web.facebook.com/pochi.amigurumi"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(207,1,'Katterine del Rosario Aguilera Olivares','Primavera de Prados','primavera-de-prados',NULL,'primaveradeprados@gmail.com','{"instagram":"https://www.instagram.com/primaveradeprados/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(208,1,'Carolina Paz Garcia','Remolino','remolino',NULL,'carolinapaz.garcia@outlook.com','{"facebook":"https://web.facebook.com/artesaniaremolino/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(209,1,'Francisca González Cornejo','Soy de Lanita','soy-de-lanita',NULL,'fgc023@alumnos.ucn.cl','{"facebook":"https://web.facebook.com/soydelanita/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(210,1,'Rocío Josefa Segovia Sanchez','Tienda Shibarita','tienda-shibarita',NULL,'rocio001122@gmail.com','{"instagram":"https://www.instagram.com/tienda_shibarita/"}','Coquimbo','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(211,1,'Sol Vielma Ramos','Vicent Design','vicent-design',NULL,'svr1906@gmail.com','{"instagram":"https://www.instagram.com/designvicent/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(212,1,'Carlos Herrera','Carlos Herrera','carlos-herrera-dragonest-studio',NULL,'cherreradraw@gmail.com','{"instagram": "https://www.instagram.com/carlosdracoherrera/", "behance": "https://www.behance.net/Chaos-Draco"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(213,1,'Philippe Sapiains','Philippe Sapiains','philippe-sapiains',NULL,'philippe.sapiains@gmail.com','{"instagram": "https://www.instagram.com/philippe.sapiains_artista/", "web": "https://philippesapiains.cl/"}','La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(224,1,NULL,'Godersi','godersi',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(225,1,NULL,'Emisario de Greda','emisario-de-greda',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(226,1,NULL,'Fakuta','fakuta',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(227,1,NULL,'A Veces Amanda','a-veces-amanda',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(228,1,NULL,'El Comodo Silencio de los que Hablan Poco','el-comodo-silencio-de-los-que-hablan-poco',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(229,1,NULL,'Los Animales Tambien Se Suicidan','los-animales-tambien-se-suicidan',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(230,1,'Isabela Paredes Fuentes','Isabela Fuentes','isabela-fuentes',NULL,'Isabela.fuentttes@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(231,1,'Camila Alejandra Molina Rivera','Camila Molina','camila-molina',NULL,'molinacmla@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(232,1,'Carolina Celis','Carocelis','carocelis',NULL,'carocelis@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(233,4,'Nicolás González','Nico Gonzalez','nico-gonzalez',NULL,'holanicogonzalez@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(234,1,'Constanza Camila Jerez Farías','Papafritologia','papafritologia',NULL,'papafritologia@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(235,1,'Fernanda Sepulveda','Fenyarts','fenyarts',NULL,'fenyarts@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(236,1,'Juan Carlos Cortés','Juanca Cortés','juanca-cortes',NULL,'jc.cortesarria@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(237,1,'Diego Mauricio Millones Hernández','Kiltro Americano','kiltro-americano',NULL,'kiltroamericano@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(238,1,'Natasha San Martin Lopez','Natilustra','natilustra',NULL,'natilustra@gmail.com',NULL,'Concepción','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(239,1,'Alejandro Toledo Garrido','PANICO CREACIONES','panico-creaciones',NULL,'toledogarridoalejandro@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(240,1,'Pablo Orrego','Peiper','peiper',NULL,'holapeiper@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(241,1,'Marcelo Painevilo','Vilu','vilu',NULL,'marcelo.painevilo@gmail.com',NULL,'La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(242,1,'Rubén Alfonso Delgado Doerr','mr_wafflys','mr-wafflys',NULL,'mrwafflys@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(243,1,'Sofía Arias Axt','Okamy','okamy',NULL,'Okamy.info@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(244,1,'Carla Francesca Giglio Gómez','Carla Francesca Giglio Gómez','carla-francesca-giglio-gomez',NULL,'carly.giglioo@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(245,1,'Nora Espinoza mancilla','Fantasmini','fantasmini',NULL,'Fantasmini.creaciones@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(246,1,'Álvaro Rodrigo','Álvaro Rodrigo','alvaro-rodrigo',NULL,'seta49@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(247,1,'Roberto Miranda Pizarro','Biker Blue','biker-blue',NULL,'bikerblue@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(248,1,'Catalina Antonia Cerda Abarca','The Memories Blooms','the-memories-blooms',NULL,'vinylscratch775@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(249,1,'Gabriel Navarrete','Gabriel Garvo','gabriel-garvo',NULL,'gabrielgarvo@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(250,1,'Pablo Delcielo','Pablo Delcielo','pablo-delcielo',NULL,'pablo@navaja.org',NULL,'Valparaíso','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(251,1,'Navalú Toledo/Keitty Álvarez','Revista Rayaismo','revista-rayaismo',NULL,'hola@rayaismo.cl',NULL,'Valparaíso','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(252,1,'Danae Mazuela Toledo','Satin.','satin',NULL,'123tesigodondeestes@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(253,1,'Gojko Vicente Franulic Rodriguez','Sephko','sephko',NULL,'sephko@gmail.com','{"instagram": "https://www.instagram.com/sephko/", "web": "http://www.sephko.com/"}','Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(254,1,'Andrea Cortes Cerda','Agüita de Color','aguita-de-color',NULL,'andrea.cortes1201@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(255,1,'Ariel Adasme','Arieleado','arieleado',NULL,'ariel.adasme.g@gmail.com',NULL,'Valdivia','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(256,1,'Angello Lazo Santana','Art Demon','art-demon',NULL,'012angus@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(257,1,NULL,'ArtePintaColor','artepintacolor',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(258,1,'Claudio Burgos Hoyar','Burhoy','burhoy',NULL,'claudioburhoy@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(259,1,'Marta Salinas','Chini','chini',NULL,'sp.martacatalina@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(260,1,'Isidora González Herrera','Chiry','chiry',NULL,'isidelrocio@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(261,1,'Luna Alicia Irarrázaval aguilar','Conejo Galáctico','conejo-galactico',NULL,'galacticoconejo@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(262,1,'Valentina Quiroz Quijada/Claudia Cerda Morchio','Doom 101','doom-101',NULL,'doom101@protonmail.com',NULL,'Valdivia','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(263,1,'Cristobal Albornoz','Grifo','grifo',NULL,'gregorio.griffindoor@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(264,1,'Yelissa Sepulveda Paycho','Hielissa','hielissa',NULL,'yelissasepulveda@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(265,1,'Cesar Felipe Pasten Arancibia','Negrotham','negrotham',NULL,'cpasten.arancibia@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(266,1,'Javiera Ignacia Cisternas Campos','Nunaim','nunaim',NULL,'javinacis@gmail.com',NULL,'Copiapó','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(267,1,'Cristian Ignacio Pardo Silva','Oculto a plena vista','oculto-a-plena-vista',NULL,'crispar@outlook.cl',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(268,1,'Jeannette López Figueroa','Paltita','paltita',NULL,'ne.petit@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(269,1,'Paula paz lonza Riveros','Poolyink','poolyink',NULL,'Poly.lonza@gmail.com',NULL,'Vallenar','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(270,1,'Mauricio Gallego Saade','Puklin','puklin',NULL,'puklinpro@hotmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(271,1,'Suyin Ordenes','Puyina','puyina',NULL,'suyina.d@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(272,1,'Valentina Paz Sánchez','Resiliencia Paz','resiliencia-paz',NULL,'sanchez.valentinapaz@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(273,1,'Melisa Barajas','Sunset Rider','sunset-rider',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(274,1,'Julio Bastral Delgado','Takamo','takamo',NULL,'takamo@live.cl',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(275,1,'Javiera Cuevas / Patricio Valdés','Taller Washuma','taller-washuma',NULL,'tallerwashuma@gmail.com',NULL,'Iquique','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(276,1,'Natalia Millalonco','Titinip','titinip',NULL,'nataliamillalonco18@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(277,1,NULL,'Valebit','valebit',NULL,'valebit@outlook.com',NULL,'Iquique','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(278,1,'Francisco Rivera','Visceral','visceral',NULL,'fcoriverarivera@gmail.com',NULL,'Santiago','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(280,3,'Margarita Angel García','Margarita Angel','margarita-angel',NULL,NULL,NULL,'La Serena','Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(281,2,'Juan Pablo Castillo','JPan','jpan',NULL,NULL,'{"instagram": "https://www.instagram.com/jpan_art"}',NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(282,4,NULL,'CHAI','chai',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(283,1,NULL,'Cancella','cancella',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(284,1,NULL,'Yuk Ilustración','yuk-ilustracion',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(285,1,NULL,'FranColors','francolors',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(286,1,'Felipe Cortes Santander','No vivimos en Marte','no-vivimos-en-marte',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(287,1,NULL,'Flamantës','flamantes',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(288,1,NULL,'Boreal Band','boreal-band',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(289,1,NULL,'Bedroom Dreamers','bedroom-dreamers',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(290,1,NULL,'Mothercodigos','mothercodigos',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(291,1,NULL,'Dinoquake','dinoquake',NULL,NULL,NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(292,1,'Logan Rivera Contreras','Logan Comic Chile','logan-comic-chile',NULL,'logantoons@gmail.com','{"instagram":"https://www.instagram.com/logantoons"}',NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(293,2,NULL,'Pinkariine','pinkariine',NULL,'pinkariine@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(294,2,NULL,'Doppimine','doppimine',NULL,'doppgaby@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
INSERT INTO artista VALUES(295,2,NULL,'LecA','leca',NULL,'leca.ilustraciones@gmail.com',NULL,NULL,'Chile','2026-01-20 03:39:05','2026-01-20 03:39:05');
CREATE TABLE IF NOT EXISTS artista_imagen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    imagen_url TEXT NOT NULL,
    tipo TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_artista_imagen_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT chk_artista_imagen_tipo CHECK (
        tipo IN ('avatar', 'galeria')
    )
);
INSERT INTO artista_imagen VALUES(1,25,'artistas/acekuros/avatar.webp','avatar',1,'{"width":800, "height":800, "size":66372, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(2,18,'artistas/aderezo/avatar.webp','avatar',1,'{"width":800, "height":800, "size":59264, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(3,47,'artistas/alkimia/avatar.webp','avatar',1,'{"width":800, "height":800, "size":89436, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(4,1,'artistas/anima-red/avatar.webp','avatar',1,'{"width":800, "height":800, "size":121246, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(5,58,'artistas/arcanista-draws/avatar.webp','avatar',1,'{"width":800, "height":800, "size":107548, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(6,32,'artistas/astro-glitter/avatar.webp','avatar',1,'{"width":800, "height":800, "size":70512, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(7,57,'artistas/bekzar/avatar.webp','avatar',1,'{"width":800, "height":800, "size":37958, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(8,52,'artistas/blanquis/avatar.webp','avatar',1,'{"width":800, "height":800, "size":137494, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(9,50,'artistas/bolbaran-comics/avatar.webp','avatar',1,'{"width":800, "height":800, "size":110228, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(10,34,'artistas/camellia-liz/avatar.webp','avatar',1,'{"width":800, "height":800, "size":52510, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(11,31,'artistas/camila-guaman/avatar.webp','avatar',1,'{"width":800, "height":800, "size":71800, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(12,13,'artistas/canela/avatar.webp','avatar',1,'{"width":800, "height":800, "size":116490, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(13,42,'artistas/carvajal-ilustraciones/avatar.webp','avatar',1,'{"width":800, "height":800, "size":48586, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(14,83,'artistas/cat-linaa-art/avatar.webp','avatar',1,'{"width":800, "height":800, "size":54396, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(15,6,'artistas/catana/avatar.webp','avatar',1,'{"width":800, "height":800, "size":46530, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(16,85,'artistas/cazar-al-tiburon/avatar.webp','avatar',1,'{"width":800, "height":800, "size":132800, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(17,27,'artistas/chiimewe/avatar.webp','avatar',1,'{"width":800, "height":800, "size":58420, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(18,37,'artistas/chilensis/avatar.webp','avatar',1,'{"width":800, "height":800, "size":50004, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(19,17,'artistas/ckiryuu/avatar.webp','avatar',1,'{"width":800, "height":800, "size":57792, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(20,82,'artistas/coticocodrila/avatar.webp','avatar',1,'{"width":800, "height":800, "size":130890, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(21,49,'artistas/de-cordillera/avatar.webp','avatar',1,'{"width":800, "height":800, "size":107036, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(22,38,'artistas/el-ale/avatar.webp','avatar',1,'{"width":800, "height":800, "size":133580, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(23,79,'artistas/ensimismada/avatar.webp','avatar',1,'{"width":800, "height":800, "size":65260, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(24,66,'artistas/flowerspower/avatar.webp','avatar',1,'{"width":800, "height":800, "size":47228, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(25,22,'artistas/fluchinick/avatar.webp','avatar',1,'{"width":800, "height":800, "size":45832, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(26,3,'artistas/fran-aerre/avatar.webp','avatar',1,'{"width":800, "height":800, "size":107008, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(27,59,'artistas/francisco-llimy/avatar.webp','avatar',1,'{"width":800, "height":800, "size":55364, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(28,41,'artistas/futuro-comics/avatar.webp','avatar',1,'{"width":800, "height":800, "size":102244, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(29,30,'artistas/ghostie/avatar.webp','avatar',1,'{"width":800, "height":800, "size":125548, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(30,14,'artistas/grabados-aleph/avatar.webp','avatar',1,'{"width":800, "height":800, "size":19358, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(31,35,'artistas/hanrra/avatar.webp','avatar',1,'{"width":800, "height":800, "size":189324, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(32,61,'artistas/ilustracion-khasumii/avatar.webp','avatar',1,'{"width":800, "height":800, "size":111208, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(33,76,'artistas/ilustravel/avatar.webp','avatar',1,'{"width":800, "height":800, "size":51800, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(34,77,'artistas/intercultural-arte/avatar.webp','avatar',1,'{"width":800, "height":800, "size":171328, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(35,15,'artistas/ivichu-jpg/avatar.webp','avatar',1,'{"width":800, "height":800, "size":39110, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(36,60,'artistas/javiiilustrations/avatar.webp','avatar',1,'{"width":800, "height":800, "size":60032, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(37,81,'artistas/javo-siniestro/avatar.webp','avatar',1,'{"width":800, "height":800, "size":160340, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(38,48,'artistas/kao-artwork/avatar.webp','avatar',1,'{"width":800, "height":800, "size":95838, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(39,9,'artistas/karime-simon/avatar.webp','avatar',1,'{"width":800, "height":800, "size":207118, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(40,24,'artistas/khyaruu/avatar.webp','avatar',1,'{"width":800, "height":800, "size":34856, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(41,53,'artistas/kmilu/avatar.webp','avatar',1,'{"width":800, "height":800, "size":112744, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(42,63,'artistas/lesbilais/avatar.webp','avatar',1,'{"width":800, "height":800, "size":53232, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(43,45,'artistas/mami-sita/avatar.webp','avatar',1,'{"width":800, "height":800, "size":48268, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(44,44,'artistas/me-pego-un-tiro/avatar.webp','avatar',1,'{"width":800, "height":800, "size":67736, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(45,56,'artistas/microbits/avatar.webp','avatar',1,'{"width":800, "height":800, "size":49122, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(46,67,'artistas/minino-nyart/avatar.webp','avatar',1,'{"width":800, "height":800, "size":126684, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(47,64,'artistas/myru-ann/avatar.webp','avatar',1,'{"width":800, "height":800, "size":55042, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(48,55,'artistas/n0tarts/avatar.webp','avatar',1,'{"width":800, "height":800, "size":31258, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(49,84,'artistas/namine-anami/avatar.webp','avatar',1,'{"width":800, "height":800, "size":42178, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(50,33,'artistas/nino-pan/avatar.webp','avatar',1,'{"width":800, "height":800, "size":88516, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(51,23,'artistas/noezzal/avatar.webp','avatar',1,'{"width":800, "height":800, "size":24124, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(52,26,'artistas/nomito/avatar.webp','avatar',1,'{"width":800, "height":800, "size":22480, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(53,12,'artistas/nyxandr/avatar.webp','avatar',1,'{"width":800, "height":800, "size":81562, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(54,16,'artistas/osamenta-en-el-jardin/avatar.webp','avatar',1,'{"width":800, "height":800, "size":195744, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(55,87,'artistas/p0chi-kun/avatar.webp','avatar',1,'{"width":800, "height":800, "size":45484, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(56,5,'artistas/p3dro/avatar.webp','avatar',1,'{"width":800, "height":800, "size":97456, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(57,39,'artistas/pancho-valdivia/avatar.webp','avatar',1,'{"width":800, "height":800, "size":34692, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(58,68,'artistas/paper-pupy/avatar.webp','avatar',1,'{"width":800, "height":800, "size":49018, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(59,51,'artistas/pat-trashoart/avatar.webp','avatar',1,'{"width":800, "height":800, "size":31834, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(60,69,'artistas/peliitos/avatar.webp','avatar',1,'{"width":800, "height":800, "size":36278, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(61,65,'artistas/pininati/avatar.webp','avatar',1,'{"width":800, "height":800, "size":79324, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(62,70,'artistas/planea-papeleria/avatar.webp','avatar',1,'{"width":800, "height":800, "size":107514, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(63,40,'artistas/polet-komiksu/avatar.webp','avatar',1,'{"width":540, "height":540, "size":54342, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(64,80,'artistas/prrr-miaow/avatar.webp','avatar',1,'{"width":800, "height":800, "size":17558, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(65,19,'artistas/purr-creatures/avatar.webp','avatar',1,'{"width":800, "height":800, "size":64932, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(66,54,'artistas/remebranzas-negras/avatar.webp','avatar',1,'{"width":800, "height":800, "size":108442, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(67,43,'artistas/rotten-monkey/avatar.webp','avatar',1,'{"width":800, "height":800, "size":32358, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(68,74,'artistas/ruvale/avatar.webp','avatar',1,'{"width":800, "height":800, "size":73008, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(69,36,'artistas/sakanita/avatar.webp','avatar',1,'{"width":800, "height":800, "size":102426, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(70,21,'artistas/saturno/avatar.webp','avatar',1,'{"width":800, "height":800, "size":60426, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(71,7,'artistas/seba-endless/avatar.webp','avatar',1,'{"width":800, "height":800, "size":174452, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(72,2,'artistas/shobian/avatar.webp','avatar',1,'{"width":800, "height":800, "size":37348, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(73,4,'artistas/skelly-uwu/avatar.webp','avatar',1,'{"width":800, "height":800, "size":72488, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(74,29,'artistas/skyderen/avatar.webp','avatar',1,'{"width":640, "height":640, "size":14358, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(75,71,'artistas/solid-ediciones/avatar.webp','avatar',1,'{"width":800, "height":800, "size":117696, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(76,46,'artistas/sra-tonks/avatar.webp','avatar',1,'{"width":800, "height":800, "size":168854, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(77,72,'artistas/sueno-de-pajaro/avatar.webp','avatar',1,'{"width":800, "height":800, "size":208402, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(78,20,'artistas/tapichin/avatar.webp','avatar',1,'{"width":800, "height":800, "size":39934, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(79,73,'artistas/tekaeme/avatar.webp','avatar',1,'{"width":800, "height":800, "size":56402, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(80,78,'artistas/tierramarga/avatar.webp','avatar',1,'{"width":800, "height":800, "size":73806, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(81,10,'artistas/uliseslo/avatar.webp','avatar',1,'{"width":800, "height":800, "size":89988, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(82,11,'artistas/vale-ilustra/avatar.webp','avatar',1,'{"width":800, "height":800, "size":37106, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(83,8,'artistas/viliz-vz/avatar.webp','avatar',1,'{"width":800, "height":800, "size":80848, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(84,75,'artistas/wasabipng/avatar.webp','avatar',1,'{"width":800, "height":800, "size":96082, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(85,62,'artistas/yatiediciones/avatar.webp','avatar',1,'{"width":800, "height":800, "size":99652, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(86,28,'artistas/yem/avatar.webp','avatar',1,'{"width":800, "height":800, "size":26148, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
INSERT INTO artista_imagen VALUES(87,86,'artistas/tati-san-martin/avatar.webp','avatar',1,'{"width":800, "height":800, "size":196028, "aspectRatio":"1:1", "format":"webp"\}','2026-01-20 03:39:08','2026-01-20 03:39:08');
CREATE TABLE IF NOT EXISTS artista_historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    ciudad TEXT,
    pais TEXT,
    orden INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_artista_historial_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT uq_artista_historial_orden UNIQUE (artista_id, orden),
    CONSTRAINT chk_artista_historial_orden CHECK (orden > 0),
    CONSTRAINT chk_artista_historial_has_data CHECK (
        pseudonimo IS NOT NULL
        OR correo IS NOT NULL
        OR rrss IS NOT NULL
        OR ciudad IS NOT NULL
        OR pais IS NOT NULL
    )
);
INSERT INTO artista_historial VALUES(1,13,NULL,'magda.lena.nt.56@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: CANELA');
INSERT INTO artista_historial VALUES(2,32,'Glitter Illustration','list.retamal@gmail.com','{"instagram":"https://www.instagram.com/glitter.illustration/","facebook":"https://web.facebook.com/glitter.illustration/"}','Coquimbo',NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Glitter Illustration');
INSERT INTO artista_historial VALUES(3,17,'Kiryuu','cami.malebran21@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Kiryuu');
INSERT INTO artista_historial VALUES(4,2,NULL,'vargaslvanesa@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Shobian');
INSERT INTO artista_historial VALUES(5,33,'Algún Diaz Yueng (Niño Pan)','diazyueng@gmail.com','{"instagram":"https://www.instagram.com/algundiazyueng/","facebook":"https://web.facebook.com/colectivoninopan/"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Algún Diaz Yueng (Niño Pan)');
INSERT INTO artista_historial VALUES(6,6,NULL,'a.gutierrezuribe@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: CatAna');
INSERT INTO artista_historial VALUES(7,31,'Chinchilla Cosmica','cam.ann.gn@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Chinchilla Cosmica');
INSERT INTO artista_historial VALUES(8,35,'Hanrra_Artwork',NULL,'{"instagram":"https://www.instagram.com/hanrra_artwork/"}','La Serena',NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Hanrra_Artwork. Instagram anterior desde CSV ediciones III, IX');
INSERT INTO artista_historial VALUES(9,4,'Hype Monster','bloody.blossom.3@gmail.com','{"instagram":"https://www.instagram.com/hype_monsters/"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Hype_Monters');
INSERT INTO artista_historial VALUES(10,38,'LaFresiaTrama','lafresiatrama@gmail.com','{"instagram":"https://www.instagram.com/lafresiatrama/"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: LaFresiaTrama');
INSERT INTO artista_historial VALUES(11,69,NULL,'javiera_-_pelitos@hotmail.cl',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Peliitos');
INSERT INTO artista_historial VALUES(12,43,'Rotten Monkey Inc.',NULL,NULL,'La Serena',NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Rotten Monkey Inc.');
INSERT INTO artista_historial VALUES(13,81,'Siniestre',NULL,'{"instagram":"https://www.instagram.com/siniestre/","facebook":"https://web.facebook.com/siniestre/"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Siniestre');
INSERT INTO artista_historial VALUES(14,71,NULL,'solidediciones@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Solid Ediciones');
INSERT INTO artista_historial VALUES(15,39,NULL,NULL,NULL,'Tongoy',NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Pancho Valdivia');
INSERT INTO artista_historial VALUES(16,48,'Kao Joyas',NULL,'{"instagram":"https://www.instagram.com/kao.joyas/","facebook":"https://www.facebook.com/KaOJoyas"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Kao Joyas');
INSERT INTO artista_historial VALUES(17,45,'Mamisita Modo On',NULL,'{"instagram":"https://www.instagram.com/mamisitamodeon/","facebook":"https://www.facebook.com/mamisitamodeon/"}',NULL,NULL,1,'2026-01-20 03:39:14','Importado desde CSV histórico. Pseudónimo original: Mamisita Modo On');
INSERT INTO artista_historial VALUES(18,1,NULL,'paularojasvidela@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Correo original desde CSV ediciones VIII, IX, X');
INSERT INTO artista_historial VALUES(19,13,NULL,NULL,'{"instagram":"https://www.instagram.com/canela_qq/"}',NULL,NULL,2,'2026-01-20 03:39:14','Instagram anterior desde CSV edición X');
INSERT INTO artista_historial VALUES(20,37,'Chilensis Boy',NULL,NULL,'Santiago',NULL,1,'2026-01-20 03:39:14','Pseudónimo y ciudad originales desde CSV ediciones I-V, VIII');
INSERT INTO artista_historial VALUES(21,100,NULL,NULL,'{"instagram":"https://www.instagram.com/mpalominosh2/"}',NULL,NULL,1,'2026-01-20 03:39:14','Instagram anterior desde CSV edición X');
INSERT INTO artista_historial VALUES(22,64,'MyruAnn',NULL,'{"instagram":"https://www.instagram.com/myruann/"}',NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo e Instagram anteriores desde CSV ediciones VI-X');
INSERT INTO artista_historial VALUES(23,10,'Ulises Lopez',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo original desde CSV ediciones III, IV, VI');
INSERT INTO artista_historial VALUES(24,129,NULL,NULL,'{"instagram":"https://www.instagram.com/jotace_arte/"}',NULL,NULL,1,'2026-01-20 03:39:14','Instagram anterior desde CSV ediciones VII-IX');
INSERT INTO artista_historial VALUES(25,143,NULL,NULL,'{"instagram":"https://www.instagram.com/nosoytancool/"}',NULL,NULL,1,'2026-01-20 03:39:14','Instagram anterior desde CSV ediciones I, II, V');
INSERT INTO artista_historial VALUES(26,147,NULL,NULL,'{"instagram":"https://www.instagram.com/pinkuninaart/"}',NULL,NULL,1,'2026-01-20 03:39:14','Instagram anterior desde CSV ediciones I, II');
INSERT INTO artista_historial VALUES(27,134,NULL,'kyb_art@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Correo anterior desde CSV edición VIII');
INSERT INTO artista_historial VALUES(29,164,'Miss Camomille',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo alternativo/anterior');
INSERT INTO artista_historial VALUES(30,9,'Avinagrada','karisimonv@gmail.com',NULL,NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo y correo alternativos desde CSV');
INSERT INTO artista_historial VALUES(31,166,'Moriciel',NULL,'{"instagram":"https://www.instagram.com/moriciel_/"}',NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo e Instagram anteriores (antes del cambio de nombre)');
INSERT INTO artista_historial VALUES(33,213,NULL,NULL,'{"instagram":"https://www.instagram.com/psapiains/"}',NULL,NULL,1,'2026-01-20 03:39:14','Instagram anterior desde CSV');
INSERT INTO artista_historial VALUES(34,189,'Miko',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Nombre anterior');
INSERT INTO artista_historial VALUES(36,281,'RikuWokenblade',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14',NULL);
INSERT INTO artista_historial VALUES(37,122,'DIZKED',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo anterior, cambió a Diskettes.ink');
INSERT INTO artista_historial VALUES(38,147,'Nina Racoon',NULL,NULL,NULL,NULL,2,'2026-01-20 03:39:14','Cambio de pseudónimo a PinkuNina');
INSERT INTO artista_historial VALUES(39,162,'Victor Ledezma · Artwork & Illustrations',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Pseudónimo anterior, cambió a Victor Illustrations');
INSERT INTO artista_historial VALUES(40,287,'Fausto Not Disco',NULL,NULL,NULL,NULL,1,'2026-01-20 03:39:14','Nombre anterior de la banda, cambió a Flamantës');
INSERT INTO artista_historial VALUES(41,122,'Diskettes.ink','dizked.art@gmail.com','{"instagram":"https://www.instagram.com/diskettes.ink/","facebook":"https://web.facebook.com/dizked.art/"}',NULL,NULL,2,'2026-01-20 03:39:14',NULL);
CREATE TABLE IF NOT EXISTS catalogo_artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL UNIQUE,
    orden TEXT NOT NULL,
    destacado INTEGER NOT NULL DEFAULT 0,
    activo INTEGER NOT NULL DEFAULT 1,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_catalogo_artista FOREIGN KEY (
        artista_id
    ) REFERENCES artista (id),
    CONSTRAINT chk_catalogo_artista_destacado CHECK (destacado IN (0, 1)),
    CONSTRAINT chk_catalogo_artista_activo CHECK (activo IN (0, 1))
);
INSERT INTO catalogo_artista VALUES(1,1,'a0',0,1,replace('Lic. en arquitectura, ilustradora y artista visual chilena.\nDesarrolla trabajos con temáticas relacionadas a la fantasía y la naturaleza, enfocándose en ilustrar y diseñar en torno a la creación de personajes originales y criaturas imaginarias, sus medios principales tradicionales artísticos son la acuarela, el grafito y los lápices de colores','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(2,2,'a1',0,1,'Shobian, diseñadora gráfica de profesión e ilustradora autodidacta, se caracteriza por utilizar texturas análogas en la ilustración digital, aportando calidez a sus obras que retratan naturaleza y elementos de la vida cotidiana. Ha estado presente en diversos eventos de ilustración, destacando previas versiones del Festival Frijol Mágico y Festival ARC.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(3,3,'a2',0,1,'Artista regional que busca representar la expresividad de los animales, la belleza de la naturaleza y la cotidianidad de lo que la rodea, por medio de una pincelada segura pero dinámica. Sus técnicas predilectas son el óleo y el medio digital.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(4,4,'a3',0,1,'Hola! Soy Josefa Aguilera, Ilustradora y artista de videojuegos, tengo 27 años y dibujo con motivación desde los 14. Adoro crear personajes con trasfondos interesantes inspirados en la cultura Chilena y Asiática, siempre esperando generar un impacto a nivel emocional y espiritual, actualmente soy freelancer y estoy dibujando un manga "Si el río suena es porque piedras trae." 川石の音 (Kawaishi no oto) el cual está basado en las mencionadas culturas. He trabajado también para diversas compañías de videojuegos internacionales y participado en ferias de arte a lo largo del país. ¡Espero que disfrutes mucho mi trabajo!','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(5,5,'a4',0,1,'Mi trabajo principalmente consiste en dibujos tradicionales coloreados con lápices de colores escolares. Abordo tópicos como el anime, videojuegos, series animadas y películas de horror. También realizo pequeños cuadros inspirados en la flora y monumentos típicos de la cuarta región de Coquimbo hechos con lápices acuarelables.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(6,6,'a5',0,1,'Mi arte mezcla elementos provenientes de una biografía personal, desde el paisaje regional y la cultura popular de la generación millenial. Mis creaciones reflejan la manera en que habito el territorio, me inspira el patrimonio natural y urbano, los espacios de convivencia y la riqueza de la cotidianeidad.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(7,7,'a6',0,1,'¡Hola! Mi nombre es Seba Endless, diseñador gráfico e ilustrador, actualmente estudiando licenciatura en artes visuales. Mi trabajo se basa en ilustraciones y pinturas digitales de colores vibrantes y saturados, todos en diversas temáticas como: fanart de series, videojuegos, comic, manga, anime y mi obra original.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(8,8,'a7',0,1,'Trabajos con xilografia, materiales gráficos, plasmando formas y estilos más naturales y organicos, además de plasmar mi caracter interno  y de lo que me rodea en ilustraciones variadas, tambien vendo yogurt congelado yo le llamo congurt.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(9,9,'a8',0,1,'Trauerkult, que significa "culto al luto", representa plenamente el concepto de mi obra, en la cual la muerte se manifiesta en todas sus formas y escenarios, a partir de minuciosos puntos, luces y sombras.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(10,10,'a9',0,1,'Enfocado en la ilustración y las técnicas graficas artesanales, realizo series de imágenes que muestran diversos aspectos del entorno de la cuarta region, desde la naturaleza hasta temas sociales, generando relatos en diversos soportes como papel, textil, cerámica y objetos editoriales.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(11,11,'aA',0,1,'Hola, soy Vale ilustra y me complace presentar mi trabajo como ilustradora , me inspiro principalmente en la moda coreana, japonesa  o contemporánea en general fusionando lo con un toque cute o kawaii. Utilizo principalmente el dibujo digital como metodología lo que me permite resaltar mejor los colores y detalles.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(12,12,'aB',0,1,'Hago una mezcla de fanarts, personajes propios e historias, explorando tanto lo tierno como lo oscuro. Mi arte refleja la dualidad de lo dulce y lo místico.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(13,13,'aC',0,1,'¡Hola! Soy Canela, ilustradora desde temprana edad con una pasión por el arte y la creatividad. En la actualidad, me concentro en comisiones y proyectos diversos, y también me encanta explorar la creación de contenido variado, como streams y mercancía. Mi estilo se caracteriza por ser tierno y colorido, pero me adapto a diferentes enfoques según tus necesidades :D!','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(14,14,'aD',0,1,'Grabados Aleph básicamente está enfocado en la linografía y todo lo que tenga que ver con grabado. Mi trabajo abarca todo el proceso desde diseño, carvado e impresión de una linografía. En cuanto a las ilustraciones en si, son todos diseños originales y su temática abarca distintos ámbitos: desde animales y flores hasta referencias a clásicos de la literatura.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(15,15,'aE',0,1,'¡Buenas! Soy IviChu.jpg, una chica que se expresa a través de ilustraciones vivas. Mi trabajo destaca personajes dinámicos y explora emociones, fantasía y relaciones, con un estilo único. dibujo capturando momentos que cuentas historias. ¡Acompáñame en este viaje artístico!','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(16,16,'aF',0,1,'Mi trabajo se basa en crear dibujos y pinturas con una temática a la que me gusta llamar "fantasía macabra", para esto uso conceptos que me permitan crear una atmósfera oscura, tomando un estilo influenciado por la ilustración de libros antiguos y películas de terror.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(17,17,'aG',0,1,'¡Hola! ¡Soy Kiryuu! Mi trabajo se caracteriza por la búsqueda de la expresividad y la interpretación, ya sea mediante el humor ligero, o, en contraste, en trabajos de temas más oscuros o nostálgicos. Siento mucha pasión por el storytelling, actualmente desarrollándome en el área de la animación y storyboard.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(18,18,'aH',0,1,'¡Hola! Soy Aderezo, ilustrador digital, Mi estilo se basa en el animé, pero con un toque personal. con mis obras busco plasmar escenas como si de fotos se tratasen, tratando generalmente que mis trabajos cuenten una historia, por muy pequeña que sea. Eso sería todo, ¡Espero les guste mi trabajo!','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(19,19,'aI',0,1,'¿Cómo sería el mundo si los gatos fueran los más evolucionados? Purr Creatures aborda esta pregunta a través de personajes que combinan la figura de la mujer y los felinos. Destacando distintos rasgos de sus personalidades e incorporando un toque de humor gráfico.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(20,20,'aJ',0,1,'Tachipin se enfoca en ilustraciones y proyectos artísticos basados en una estética retro-futurista-surrealista, con inspiración en la animación occidental y oriental, que tratan de apelar al sentimiento de nostalgia, tomando inspiraciones de movimientos estéticos relevantes para las generaciones millennial y Z, reinterpretando personajes ya existentes, y generando historias que reflejan el vacío y la complejidad de las emociones humanas.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(21,21,'aK',0,1,'Saturno, soy diseñadora gráfica e ilustradora autodidacta, me caracterizo por utilizar colores muy llamativos en mis ilustraciones y por tener stickers chistosos. También me dedico a crear diseños únicos en cerámica como llaveros, imanes, platos, espejos, ceniceros, figuras, porta velas, entre otros. Trato siempre de tener diseños nuevos y creativos.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(22,22,'aL',0,1,'Soy Constanza Toro, alias Fluchinick, ilustradora y estudiante de Diseño Digital. Mi trabajo destaca por la representación de animales antropomórficos usando colores saturados, tonos pasteles y destellos vibrantes, fusionando ternura, amor y comedia. Actualmente, exploró el universo Steampunk con mis propios personajes, también expresando mis gustos hacia las caricaturas manteniendo mi estilo.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(23,23,'aM',0,1,'Mi trabajo se enfoca principalmente al desarrollo de obras ligadas al fan-art de series, animes, películas, videojuegos y gran parte del mundo geek, en general cosas que me gustan y me llaman la atención. Por otra parte, realizo obras que tienen que ver con el surrealismo y con la exploración del sentir humano, siendo un trabajo personal pero a la vez, algo que pueda conectar de forma directa con el espectador.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(24,24,'aN',0,1,'Hola soy Khyaruu, Ilustradora freelancer amante de los conejitos, de todo lo rosita y kawaii. Mi especialidad es la ilustración digital en un estilo chibi, trabajando pedidos de ilustraciones personalizadas, emotes para redes sociales y ahora, finalmente merch!','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(25,25,'aO',0,1,'Mi nombre es Alexis Cepeda Esquivel alias Acekuros, me denomino como dibujante de la ciudad de La Serena. En mis obras trato de capturar momentos cotidianos como también destacar la biodiversidad de la región de Coquimbo, me esfuerzo en transmitir historias que conecten con el pasado y el presente, destacando la identidad cultural y el patrimonio natural en mi propio estilo.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(26,26,'aP',0,1,'La mayoría de mi arte solo son dibujos de algun personaje que creo para serie, juego o anime. Suelo poner creativo en mis dibujos y experimentar con cosas nuevas en mis ilustraciones ya sea luces, sombras o lineart','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(27,27,'aQ',0,1,'Soy chiimewe, ilustrador de La Serena que se dedica a hacer arte creado a partir de la imaginación e inspirado en lo tierno y lo colorido. Creando personajes y criaturas constantemente usando lo tradicional y lo digital al mismo tiempo.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(28,28,'aR',0,1,'Hola soy Yem, un ilustrador digital, principalmente de personajes originales, aunque también disfruto haciendo fanarts de vez en cuando. Mi objetivo es que mi arte alcance un mayor reconocimiento y conecte con más personas a través de lo que hago.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(29,29,'aS',0,1,'Hola me presento soy Skyderen mi trabajo consiste en ilustraciones que exploran la creatividad y la imaginación tratando de que la ilustración sea uno lleno de color, textura y emoción. Mi enfoque se centra en el estilo artístico del cartoon, anime, los comics y un poco el de los videojuegos.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(30,30,'aT',0,1,'Soy Ghostie, un ilustrador que crear fanarts de personajes de Marvel, series icónicas como Hannibal, The Walking Dead y Breaking Bad, así como también de músicos legendarios como The Beatles y Guns N'' Roses. Ofrezco prints, chapitas, stickers y llaveros de mis obras, compartiendo así mi arte con los demás.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(31,31,'aU',0,1,'Ilustradora naturalista, egresada de arquitectura. Enfoco mi trabajo en la naturaleza, arte y territorio a través de técnicas tradicionales como acuarela, gouache y lápices de colores. Autora del libro "Bitácora: ilustrando la flora en la ciudad" e ilustradora de diversas publicaciones sobre patrimonios, flora y fauna nativa y educación ambiental.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(32,32,'aV',0,1,'La ilustración es mi forma de expresar ternura. En mis ilustraciones fusiono mi mundo interno de fantasía con la naturaleza de mi realidad y generalmente creo composiciones que transmiten paz y calma.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(33,33,'aW',0,1,'Me dedico a hacer ilustraciones digitales de cosas que me llamen la atención así como también a hacer comisiones, generalmente ambas comparten temáticas como por ejemplo el medio ambiente, animales y lugares de la ciudad, también de vez en cuando busco plasmar sensaciones y pensamientos a través de viñetas y mas recientemente en animación. Cómo dibujante quiero lograr hacer trazos mas simples combinados con texturas y colores vibrantes que en conjunto resulten en algo atractivo ^^','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(34,34,'aX',0,1,'Soy ilustradora especializada en técnicas análogas, especialmente acuarela, lápices de color y técnicas mixtas. Los temas centrales de mi trabajo son la fantasía, el realismo mágico, la nostalgia y los cuentos de hadas.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(35,35,'aY',0,1,'Soy Diseñadora Gráfica e ilustradora. En mi trabajo me gusta representar, ya sea por medio de técnicas tradicionales o digitales, escenarios que resaltan elementos de la naturaleza y que estos interactúen a través de mundos oníricos con la imagen, a menudo femenina, que protagoniza la escena.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(36,36,'aZ',0,1,'Mi nombre es Daniela y en redes sociales soy Sakanita, tengo mi Tiendita llamada Sakana Papelería. Mis referentes son la naturaleza, los gatitos y halloween. Actualmente mi técnica es digital, dibujo con procreate y los productos de mi tienda van desde stickers a estuches estampados, todo realizado en mi taller.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(37,37,'b0',0,1,replace('Hola soy Pablo, dibujante bajo el nick "chilensis" con más de una década de incursionar en el mundo del arte.\nHe enfatizado en crear personajes y cómics originales en un estilo simple y movido, para así también traer una propuesta original a series y juegos populares a través de fanart.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(38,38,'b1',0,1,'Hola! Soy Alejandro Jorquera, más conocido como el ale ilustrador, Artista gráfico dedicado al diseño e Ilustración de autor, abordo temáticas de naturaleza con características antropomórficas, fusionando lo onírico y lo místico, la vida y la muerte. explorando el camino a través de técnicas de serigrafía, fotografía acuarela y el entintado.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(39,39,'b2',0,1,'Francisco Valdivia Profesor, artista visual sus técnicas preferidas son las acuarelas, gouache, acrílico, lápices de colores y técnica mixta. Sus temas a retratar más recurrentes son: paisaje, animales, flores y criaturas con elementos híbridos (quimeras) en su compasión. Además de darle un halo de mitología, fantasía y','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(40,40,'b3',0,1,'Ilustradora y Diseñadora. Autora del Manga "La Leyenda del Valle Negro", manga basado en la Leyenda de los Brujos de Salamanca de donde provengo y autora de "Pacita", cómic de humor para mujeres. Mis ilustraciones, mangas y comics están inspirados en mangakas como Junji Ito, Kaori Yuki y Tamayo Akiyama.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(41,41,'b4',0,1,'Futuro Comics es un sello editorial autogestionado de historietas de aventuras y ciencia ficción creado por el dibujante Diego Maya, nacido originalmente como fanzine a finales de los noventa. Desde hace un par de años, con la llegada del autor a la IV Región, se ha reinventado en un nuevo formato más profesional, que busca acercar la narrativa gráfica alpúblico lector, con un enfoque que busca encantar tanto a los fans veteranos del género, \r\ncomo a nuevas generaciones de comiqueros.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(42,42,'b5',0,1,'Nada me ha motivado más que utilizar las historietas como generadoras de ideas, reflexión y muchas veces hasta de denuncia, sí, porque si bien las historietas basan gran parte de su contenido en entretener, en infinidad de géneros, sin duda no está exenta también  de abrir y expandir la mente para mantenernos atentos e informados, ya que es un arte directo que no da mucho para la imaginación a quien nos lee.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(43,43,'b6',0,1,'Dibujante de comics, enfocado en el humor gráfico y la narrativa. Entre mi trabajo pueden encontrar viñetas semanales de humor gráfico, con personajes de Godzilla en situaciones del día a día, y comics con historias serializadas o auto concluyentes, que van desde lo personal a lo bizarro.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(44,44,'b7',0,1,'Mi nombre es Pía Ahumada y desde 2013 trabajo en Taller Editorial Me pego un tiro, me dedico principalmente a la encuadernación, reparación y publicación; en general me interesa cualquier labor que esté relacionada con libros como objeto o como bien cultural.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(45,45,'b8',0,1,'Soy Mami Sita, artesana serenense y me enfoco principalmente en el arte japonés del amigurumi. Realizo retratos de personajes, artistas y personas, diseñando y elaborando cada proyecto con dedicación, esperando que transmitan alegría, ayudando a conectar con recuerdos significativos.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(46,46,'b9',0,1,'Soy Pía, bordadora y collagista desde el año 2020. Comencé a bordar por el deseo que tenía de retratar a mi gatita tonks y hacer collages digitales como hobby, el 2021 decidí abrir @sratonks para mostrar mis bordados y experimentos varios, con el tiempo se transformó en mi trabajo y hoy bordo mascotas a pedido','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(47,47,'bA',0,1,'Alkimia.cl , un espacio para seres mágicos. Joyería artesanal hecha a mano con cristales. Amuletos intencionados que sacan a relucir tu belleza interior, te acompañan y protegen. Boutique de artículos brujiles para usar en el día a día.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(48,48,'bB',0,1,'KaO ArtWork es un espacio de creación que ha evolucionado a lo largo de 10 años. Hoy en día uno oficios y técnicas como joyería, artesanías, pintura y en este último tiempo tatuajes. Tras bambalinas, estoy yo Jessica de profesión Diseñadora, oficio Orfebre y autodidacta en dibujo y pintura y más.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(49,49,'bC',0,1,'Decordillera es un espacio donde creo cuadritos decorativos en madera inspirados en la naturaleza. Utilizando la técnica de corte láser transformo mis ilustraciones en paisajes tridimensionales, fusionando arte, diseño y precisión. Cada pieza está diseñada para aportar profundidad y vida a cualquier espacio, con un toque de naturaleza y color.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(50,50,'bD',0,1,replace('Ovallino. Psicólogo. Aficionado al animé y los cómics. Desde niño he buscado contar historias con dibujos.\n\nEntiendo el cómic como una herramienta que nos permite entretenernos y aprender. En los últimos años he publicado diversas historietas breves disponibles en mis redes sociales que abordan la fantasía infantil, aventuras educativas y problemáticas de salud mental. Además, realizo charlas y talleres de creación de cómics para niños y jóvenes en diversos establecimientos educacionales.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(51,51,'bE',0,1,'¡Hola, soy Pat!, una artista visual chileno que trabaja con técnicas mixtas, fusionando lo digital y lo tradicional, con el propósito de crear ilustraciones que exploran lo lúgubre, lo etéreo y lo nostálgico. Mi obra se inspira profundamente en la estética/cultura goth, las muñecas bjd (ball jointed dolls) y los animes de los 2000.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(52,52,'bF',0,1,'Hola soy ilustradora, titulada en diseño gráfico. Disfruto dibujar en tradicional jugando entre la fantasía y la realidad con un estilo infantil, siendo las acuarelas, los lápices de colores y mi creatividad el lenguaje que da vida a mis trabajos, donde plasmo momentos de tranquilidad, historias y varios personajes tocados por la magia.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(53,53,'bG',0,1,'Mi estilo visual se enfoca en los colores vibrantes, es fantasioso y fuertemente influenciado por elementos de cultura pop, anime y fantasía mágica.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(54,54,'bH',0,1,'Chris Olivares, también conocido como Remembranzas negras en rr.ss. es un ilustrador y pintor serense quien aborda con pasión tematicas como melancolía, la nostalgia, el paso del tiempo y los recuerdos que se filtran con el paso de este, a través un lenguaje emotivo pero esperanzador, su técnica de predilección es la acuarela pero tambien trabajando con otros con medios tales como el pastel, carboncillo y programas digitales, sus influencias siempre presentes son el arte clasico, lo religioso, el tenebrismo, la escultura y la figura femenina.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(55,55,'bI',0,1,'Soy Eve Maluenda, Ilustradora de profesion y escritora/poeta autodidacta, autora de Eco Austral y otras historias. n0tarts es mi proyecto de arte, donde mesclo ilustracion digital, pintura tradicional acrilica y mi poesia. Si logro transmitirte algo de lo que quiero expresar con mi trabajo sigueme 🫶','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(56,56,'bJ',0,1,'Soy Microbits y hago cosas en 3D. A veces salen personajes tiernos, a veces cosas más darks. No siempre sé bien qué estoy haciendo, pero me gusta el proceso. Me interesa jugar con emociones, lo raro y lo nostálgico, aunque no siempre tenga una idea clara al empezar. A veces solo quiero ver qué sale.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(57,57,'bK',0,1,'Soy Bekzar, artista regional que mediante el uso de cultura pop y humor, busca retratar personajes reconocibles y propios en situaciones divertidas y estilo pinup, intentando siempre sacar una sonrisa con ilustraciones atractivas y variadas con un enfoque en los colores y la armonía de fondos en la pieza completa','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(58,58,'bL',0,1,'Hola! Soy Arcanista, Ilustrador, Artista Conceptual y Streamer. Me especializo en arte digital de fantasía, donde exploro mundos mágicos estilizados con un toque colorido, expresivo y lleno de simbología. Mi trabajo fusiona lo espiritual y lo místico con influencias de la cultura pop, el anime y los videojuegos. Realizo comisiones personalizadas, portadas de libros, diseño de personajes, fanarts y arte para desarrollo visual de juegos','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(59,59,'bM',0,1,'Nació en Coquimbo y creció rodeado de perros hasta alcanzar la mayoría de edad. Sabe leer, escribir y dibujar. Es autor de Seiyam: sangre en la camanchaca. Del resto solo saben sus clientes.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(60,60,'bN',0,1,'¡Hola! Mi nombre es Javiera, Ilustradora y estudiante actualmente de Arquitectura. Mi trabajo se destaca por ilustrar armaduras y robots, además de ilustraciones detalladas y el uso de colores vibrantes. De manera profesional me dedico al diseño de personajes para clientes de todo el mundo. Tomando desde siempre inspiración en el dibujo japonés, sobre todo estilo kawaii/chibi y estilo de comic como los tomos de Transformers.  ☆','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(61,61,'bO',0,1,'Desarrollo ilustraciones en digital con estilo Anime, especializándome en Lineart, fanart y el Diseño de Personajes, con un enfoque particular en la fantasía. Mi trayectoria como artista autodidacta impulsa un constante perfeccionamiento técnico y narrativo','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(62,62,'bP',0,1,replace('Yatiediciones, es una editorial enfocada en la recopilación, sensibilización y difusión de los pueblos originarios a través de material didáctico, cuadernos de aprendizaje, poesía y narrativa ilustrada.\nLlevamos años como educadores tradicionales de lengua y cultura de los pueblos originarios y desde el 2014, nos hemos reunido bajo el nombre de Yatiediciones, para difundir nuestro trabajo en Chile y el mundo.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(63,63,'bQ',0,1,replace('Victoria Rubio, conocida como "Lesbilais", es chilena, migrante y autora de cómics como “Lesbilais” (de ahí su apodo) y que tiene una publicación recopilatoria en formato libro.\012Además cuenta con un segundo libro de cómic publicado, llamado “Loreto poco Hetero” y con un tercer libro realizado a modo de Antología.\012Ha viajado mostrando su trabajo en eventos de cómic, como “Viñetas en altura” en La Paz, Bolivia, “Lady’s Comic” en Sao Paulo, Brasil, “Festival de Artes Feministas”, en México, “Vamos las pibas” en Buenos Aires, Argentina y salones del cómics en Valencia y Barcelona. Ha participado de eventos dando charlas sobre cómic hecho por mujeres en diferentes instancias en Chile, Latinoamérica, España y Francia. Ha dado entrevistas para televisión, diarios en Latinoamérica y medios independientes sobre la importancia de ser lesbiana visible y creadora de historietas.\nComo artista de cómics, se le ha considerado como una artista integral, ya que se dedica al guión y al dibujo. Actualmente vive en España, donde ha potenciado su faceta como fanzinera, dedicándose a la autoedición de juegos de cartas y de libros de cómics.','\012',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(64,64,'bR',0,1,replace('¡Hola! Soy Myru Ann.\nMi trabajo se desarrolla principalmente en ilustración digital, aunque también disfruto explorando técnicas tradicionales como los lápices policromos y la pintura. Mi estilo se caracteriza por una estética suave, femenina y simbólica, donde a veces lo tierno combina con lo crudo.\nMe interesa especialmente lo emocional, abordado desde una mirada íntima y personal.\nTambién disfruto mucho hacer retratos por encargo, ya sean de mascotas, parejas o familias en especial en lienzos con óleo :-)','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(65,65,'bS',0,1,'Soy Nati y creo figuras de animalillos en arcilla, en pompones de lana, y otros experimentos. Mi inspiración nace de artistas del otro lado del mundo, entre ellos: Trikotri, Viktoria Volcheg y Hashimotomio, échenle un vistazo también! : )','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(66,66,'bT',0,1,'Nicole comenzó desarrollando la técnica del collage con prensado botánico de forma autodidacta, creando diversas obras que permiten la apreciación de la flora en su materialidad y estructura. Actualmente, trabaja la misma materia prima pero explorando la bisutería con resina, creando piezas únicas. Su principal inspiración son las flores y como éstas pueden extender su vida en el tiempo.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(67,67,'bU',0,1,'Hola, soy Nino, licenciada en Pedagogía en Educación Parvularia e ilustradora autodidacta. Me caracterizo por realizar ilustraciones con colores vibrantes, fanarts expresivos y por mi pasión por dibujar mapaches y gatitos. Desde temprana edad he sentido un profundo amor por explorar el arte y la creatividad. Me gusta expresar en mis ilustraciones una mezcla de lo absurdo, lo tierno y bizarro, dando vida a personajes y escenas que invitan a imaginar, reír o sentir. Hace un tiempo perdí mi cuenta principal de Instagram, pero por suerte logré recuperar "nino_nyart", donde sigo compartiendo todo lo que me inspira. Día a día trabajo para seguir mejorando la composición visual de mis obras y tratar de contar historias con ellas.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(68,68,'bV',0,1,replace('¡Hola! Soy Paper Pupy, diseñadora gráfica e ilustradora apasionada por la cultura kawaii de los 90-2000, y el journaling.\nMi trabajo se centra principalmente en crear papelería y accesorios que complementan este hobby, inspirando nostalgia y felicidad.\nMis ilustraciones, influenciadas por los animes de los 90, personajes de la cultura kawaii y tendencias de moda, fusionan lo nostálgico con un toque actual a través de formas ornamentales, románticas, y colores pasteles.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(69,69,'bW',0,1,replace('Ilustradora autodidacta de La Serena.\nDe 27 años, Mi estilo se rige por las espontaneidad y momentos de inspiración, me caracterizo mayoritariamente por dibujos digitales, tratando de abarcar diferentes estilo, formas y colores, creación de personajes y de estetica simple y saturado.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(70,70,'bX',0,1,'Mi nombre es Rocío, realizo encuadernación artesanal clásica, timbres de goma y miniaturas de cuadernos en aros y collares. Considero a mi tienda como un espacio de proteccion y homenaje a este oficio, a lo hecho a mano y a la expresión en papel.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(71,71,'bY',0,1,'Solid Ediciones es una editorial sin fines de lucro, que busca difundir el Cómic y a sus autores en la Cuarta Región.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(72,72,'bZ',0,1,replace('"Sueño de Pájaro" es un taller autogestionado donde experimento con cerámica principalmente. Me inspiro en la alfarería tradicional de los pueblos originarios de América (Abya Yala).\nCada pieza busca conectar lo antiguo con lo actual, el espacio interior con algunos elementos de la cultura popular.\n“en mi memoria habitan sonidos que intento recrear a través de estos instrumentos de caña y greda"','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(73,73,'c0',0,1,replace('¡Hola! Soy Tekaeme, diseñadora gráfica e ilustradora freelance. Mi trabajo se basa en ilustraciones digitales con un estilo tierno y adorable, fuertemente inspirado en el anime.\nBusco transmitir esa ternura a quienes ven mi arte, y que cada persona sienta alegría al tener una de mis obras.\nTrabajo principalmente con ilustraciones originales, pero también me encanta hacer fanarts de cantantes, animes, series y todo lo que me inspira.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(74,74,'c1',0,1,'Hola! Ruvale aquí. Soy estudiante de psicología y me dedico en mi tiempo libre como dibujante digital. Mi arte consiste por sobre todo de personajes originales y fanarts de mis gustos personales. También realizo videos de análisis en Youtube, integrando animaciones cortas hechas por mi e ilustraciones como portadas de los videos.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(75,75,'c2',0,1,replace('Ilustrador de comics y animador, nacido en Uruguay y viviendo en Chile actualmente. Soy un youtuber de reseñas de videojuegos y otras cosas en el mundo del arte.\nApasionado por lo que hago y muy feliz de compartir mis proyectos con el mundo. Ahora trabajando en mi comic llamado Power Pow.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(76,76,'c3',0,1,replace('Aquí Ilustravel! Diseñadora, Ilustradora y escritora diplomada en LIJ. Amante de la literatura y los gatos.\nMi trabajo busca contar historias inspirado en temas patrimoniales y de época. Me enfoco en personajes originales y la creación de mundos donde mezclo lo local con temáticas sobrenaturales más universales.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(77,77,'c4',0,1,'Intercultural arte es una marca con la que busco identidad local a través de la Ilustración y el oficio de la  serigrafía, retrato el patrimonio natural y cultural del territorio, tanto de la región, nacional y a nivel latinoamericano.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(78,78,'c5',0,1,replace('Soy ilustrador digital y Diseñador Gráfico de la cuenca del Elki.\nMi trabajo se orienta hacia la construcción de escenarios ominosos que integran elementos propios de la fantasía oscura y el surrealismo digital. Opto por una estética de contrastes marcados y formas fluidas que van construyendo parajes desolados y entidades solitarias que se mezclan con lo profundo.\nElijo mantenerme al margen de los elementos totalmente figurativos, ya que valoro que cada persona construya su propia interpretación desde lo que ve.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(79,79,'c6',0,1,replace('Ensimismada es un proyecto de confección y reinvención artesanal de moda y accesorios, nacido desde la introspección del hogar y el amor por lo cotidiano.\nTrabajamos con telas vintage y prendas reutilizadas para crear piezas únicas, cómodas y llenas de identidad.\nLejos de la cultura de lo descartable, cada prenda está hecha para durar y acompañar, como un objeto querido que guarda historia y alma.','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(80,80,'c7',0,1,replace('Hola, soy Prrr Miaow.\nLlevo casi un año adentrandome al mundo del pixel art, aunque dibujo ilustración digital desde hace tiempo.\nMis ilustraciónes son mayormente animales, naturaleza y un poco de fanart.\nTengo un estilo soft y tierno, me gusta causar ese "Awww" en las personas, que se lleven un producto mio y mi arte los acompañe','\n',char(10)),'2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(81,81,'c8',0,1,'Hola, soy Javo Siniestro: arquitecto, ilustrador y ceramista en proceso. Mi trabajo se basa principalmente en la cultura pop y en elementos del mundo geek. Me gusta usar colores vibrantes y un line art con carácter en mis composiciones. Suelo trabajar en ilustración digital y en acuarela tradicional','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(82,82,'c9',0,1,'Diseñadora y artista de la Región de Coquimbo, crea piezas únicas y originales, utilizando una variedad de materiales y técnicas que dan vida a obras cargadas de color, emoción y simbolismo. Su trabajo se nutre de la psicodelia, el arte intuitivo y un proceso creativo profundamente consciente, donde cada pieza responde a una intención y una historia propia.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(83,83,'cA',0,1,'Ilustradora que fusiona técnicas digitales y tradicionales, especialmente la acuarela. Su estilo combina el anime y el cartoon, creando ilustraciones vibrantes llenas de colores intensos y personajes expresivos, inspirados en la figura humana, la naturaleza, los animales y figuras coleccionables.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(84,84,'cC',0,1,'Gusto en conocerte, soy Nami! Creadora de contenido, ilustradora, diseñadora gráfica y textil especializada en peluches. Mi estilo se basa en un lineart grueso chocolate junto con paletas pasteles y saturadas que se asocian con los dulces y la magia. Mis peluches son creados por mis propias manos desde la idea en papel hasta la mano de obra en tela, entregando una identidad y propósito para quien los adopte y les de un bonito hogar.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(85,85,'cD',0,1,'Ilustrador, dibujante de cómics y editor en Cazar al Tiburón Editores, su trabajo se ha expuesto en galerías de arte, bibliotecas públicas y otros espacios culturales. En sus ilustraciones de @fabian_ilustrado, los personajes son el alma de escenas que exploran la introspección, la nostalgia y la vulnerabilidad humana. Entre lo real y lo imaginario, sus obras invitan a conectar con emociones universales a través de momentos cotidianos cargados de significado.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(86,86,'cE',0,1,'Escultora y Licenciada en artes plásticas de la Universidad de Chile, autora de cinco libros para la educación artística para niños en la Editorial Voluntad, Colombia, 1997; 1er lugar en Escultura en la V Bienal Internacional de Suba, Bogotá en 2005; profesora de artes para niños, jóvenes y adultos en colegios, centros culturales y municipalidades desde año 2000 a la fecha; exposiciones de escultura y pintura en Bogotá, Miami, Santiago, Puerto Montt, La Serena y Coquimbo.','2026-01-20 03:39:11','2026-01-20 03:39:11');
INSERT INTO catalogo_artista VALUES(87,87,'cB',0,1,'Ilustradora digital que destaca por su estilo anime semirealista. Disfruta crear fanarts, doodles sillies y personajes originales que reflejan sus emociones e intereses, siempre explorando nuevas técnicas para dar vida a sus ideas.','2026-01-20 03:39:11','2026-01-20 03:39:11');
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    correo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO agrupacion VALUES(1,'Ruvale y WasabiPNG',NULL,NULL,'2026-01-20 03:39:17','2026-01-20 03:39:17');
INSERT INTO agrupacion VALUES(2,'Colectivo 8 Ojos','Dos ilustradoras, ocho ojos y un mundo infinito de ideas. Cat_linaa_art y p0chi_kun dibujan desde lo que son: diferentes, intensas y creativas. No creen que todo deba verse igual. Les encanta que sus diferencias se noten y se complementen, creando ilustraciones que pueden ser delicadas, potentes, dulces o explosivas… pero siempre honestas y llenas de vida.','och8jos.studio@gmail.com','2026-01-20 03:39:17','2026-01-20 03:39:17');
INSERT INTO agrupacion VALUES(3,'Un Chincolito Me Lo Dijo',NULL,'elcorreodelchincol@gmail.com','2026-01-20 03:39:17','2026-01-20 03:39:17');
INSERT INTO agrupacion VALUES(4,'LaFresiaTrama','Agrupación de ilustradores formada por Alejandro Jorquera (El Ale) y Camila Pía Rojas Silva','lafresiatrama@gmail.com','2026-01-20 03:39:17','2026-01-20 03:39:17');
INSERT INTO agrupacion VALUES(6,'DragoNest Studio','Agrupación de ilustradores formada por Christian Herrera y Carlos Herrera',NULL,'2026-01-20 03:39:17','2026-01-20 03:39:17');
CREATE TABLE IF NOT EXISTS evento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organizacion_id INTEGER,
    nombre TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_organizacion FOREIGN KEY (
        organizacion_id
    ) REFERENCES organizacion (id) ON DELETE SET NULL
);
INSERT INTO evento VALUES(1,1,'Festival Frijol Mágico','frijol-magico','Frijol Mágico es un espacio que reúne a las y los Ilustradores de la Región de Coquimbo, generando distintas instancias que ayuden a potenciar su trabajo.','2026-01-20 03:38:52','2026-01-20 03:38:52');
INSERT INTO evento VALUES(2,1,'Ilustradores en Benders','ilustra-benders',NULL,'2026-01-20 03:38:52','2026-01-20 03:38:52');
CREATE TABLE IF NOT EXISTS evento_edicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_id INTEGER,
    nombre TEXT,
    numero_edicion TEXT NOT NULL,
    slug TEXT,
    poster_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_edicion_evento FOREIGN KEY (
        evento_id
    ) REFERENCES evento (id) ON DELETE SET NULL
);
INSERT INTO evento_edicion VALUES(1,1,NULL,'I','i','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-i.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(2,1,'Día del Libro','II','ii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-ii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(3,1,NULL,'III','iii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-iii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(4,1,'En Búsqueda del Secreto del Frijol','IV','iv','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-iv.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(5,1,'I Aniversario','V','v','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-v.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(6,1,'Descubriendo nuevas raíces','VI','vi','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-vi.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(7,1,'Recolectando Semillas','VII','vii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-vii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(8,1,'II Aniversario','VIII','viii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-viii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(9,1,'Frijoles con Riendas','IX','ix','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-ix.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(10,1,'III Aniversario','X','x','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-x.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(11,2,NULL,'1','1','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-1.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(12,2,'Season 2','2','2','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-2.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(13,2,'Season 3','3','3','https://cdn.frijolmagico.cl/festivales/ilustra-benders/afiche-3.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(14,1,'Vía Streaming','XI','xi','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xi.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(15,1,'','XII','xii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(16,1,'','XIII','xiii','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xiii.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(17,1,'','XIV','xiv','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xiv.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
INSERT INTO evento_edicion VALUES(18,1,'','XV','xv','https://cdn.frijolmagico.cl/festivales/frijol-magico/afiche-xv.webp','2026-01-20 03:38:55','2026-01-20 03:38:55');
CREATE TABLE IF NOT EXISTS evento_edicion_dia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    lugar_id INTEGER,
    fecha TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    modalidad TEXT NOT NULL DEFAULT 'presencial',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_evento_edicion_dia_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_evento_edicion_dia_lugar FOREIGN KEY (
        lugar_id
    ) REFERENCES lugar (id) ON DELETE SET NULL,
    CONSTRAINT uq_evento_edicion_dia UNIQUE (evento_edicion_id, fecha),
    CONSTRAINT chk_evento_edicion_dia_modalidad CHECK (
        modalidad IN ('presencial', 'online', 'hibrido')
    )
);
INSERT INTO evento_edicion_dia VALUES(1,1,1,'2017-02-25','14:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(2,2,2,'2017-04-22','12:00','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(3,3,2,'2017-08-19','11:30','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(4,4,1,'2017-12-16','12:30','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(5,5,2,'2018-02-23','12:00','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(6,5,2,'2018-02-24','12:00','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(7,6,2,'2018-08-10','12:00','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(8,6,2,'2018-08-11','12:00','20:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(9,7,2,'2018-12-22','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(10,8,2,'2019-03-01','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(11,8,2,'2019-03-02','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(12,9,2,'2019-08-16','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(13,9,2,'2019-08-17','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(14,10,2,'2020-02-28','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(15,10,2,'2020-02-29','12:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(16,11,3,'2016-02-18','15:00','21:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(17,12,3,'2016-08-15','14:20','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(18,13,3,'2016-10-31','14:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(20,14,6,'2021-04-16','18:00','21:00','online','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(21,14,6,'2021-04-17','17:30','20:30','online','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(22,14,6,'2021-04-18','17:30','21:00','online','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(23,15,2,'2022-04-09','12:00','21:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(24,16,4,'2024-05-18','10:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(25,17,4,'2024-10-19','10:00','20:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(26,18,5,'2025-10-03','10:30','18:30','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
INSERT INTO evento_edicion_dia VALUES(27,18,5,'2025-10-04','10:00','18:00','presencial','2026-01-20 03:38:59','2026-01-20 03:38:59');
CREATE TABLE IF NOT EXISTS evento_edicion_metrica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER,
    tipo TEXT NOT NULL,
    valor REAL,
    payload TEXT,
    fuente TEXT,
    fecha_registro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT,

    CONSTRAINT fk_metrica_evento_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE SET NULL
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
    evento_edicion_id INTEGER,
    tipo TEXT NOT NULL,
    payload TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    generado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_snapshot_evento_edicion FOREIGN KEY (
        evento_edicion_id
    ) REFERENCES evento_edicion (id) ON DELETE SET NULL,
    CONSTRAINT uq_snapshot UNIQUE (evento_edicion_id, tipo)
);
CREATE TABLE IF NOT EXISTS tipo_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO tipo_actividad VALUES(1,'taller','Actividad práctica con participación de asistentes','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO tipo_actividad VALUES(2,'charla','Presentación o conferencia','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO tipo_actividad VALUES(3,'musica','Presentación musical en vivo','2026-01-20 03:38:41','2026-01-20 03:38:41');
CREATE TABLE IF NOT EXISTS modo_ingreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO modo_ingreso VALUES(1,'seleccion','Artista seleccionado mediante convocatoria abierta','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO modo_ingreso VALUES(2,'invitacion','Artista invitado directamente por la organización','2026-01-20 03:38:41','2026-01-20 03:38:41');
INSERT INTO modo_ingreso VALUES(3,'suplencia','Artista agregado desde la lista de suplentes','2026-01-20 03:38:41','2026-01-20 03:38:41');
CREATE TABLE IF NOT EXISTS evento_edicion_participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activo',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_participante_evento_edicion FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_participante_estado CHECK (
        estado IN (
            'renuncia',
            'expulsado',
            'cancelado',
            'activo',
            'completado'
        )
    )
);
INSERT INTO evento_edicion_participante VALUES(1,1,31,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(2,1,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(3,1,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(4,1,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(5,1,44,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(6,1,71,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(7,1,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(8,1,106,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(9,1,107,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(10,1,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(11,1,116,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(12,1,122,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(13,1,133,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(14,1,136,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(15,1,143,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(16,1,147,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(17,1,156,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(18,1,169,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(19,1,178,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(20,1,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(21,1,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(22,1,255,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(23,1,278,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(24,1,280,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(25,1,281,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(26,1,282,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(27,1,283,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(28,1,284,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(29,1,285,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(30,1,286,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(31,1,287,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(32,1,288,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(33,1,289,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(34,1,290,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(35,1,291,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(36,2,4,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(37,2,31,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(38,2,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(39,2,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(40,2,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(41,2,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(42,2,107,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(43,2,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(44,2,117,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(45,2,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(46,2,122,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(47,2,127,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(48,2,136,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(49,2,143,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(50,2,145,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(51,2,147,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(52,2,148,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(53,2,155,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(54,2,156,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(55,2,162,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(56,2,164,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(57,2,169,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(58,2,176,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(59,2,178,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(60,2,183,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(61,2,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(62,2,191,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(63,2,192,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(64,2,196,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(65,2,206,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(66,2,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(67,2,240,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(68,2,254,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(69,2,255,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(70,2,272,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(71,3,10,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(72,3,31,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(73,3,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(74,3,35,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(75,3,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(76,3,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(77,3,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(78,3,90,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(79,3,91,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(80,3,95,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(81,3,104,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(82,3,105,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(83,3,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(84,3,116,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(85,3,117,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(86,3,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(87,3,122,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(88,3,123,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(89,3,125,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(90,3,133,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(91,3,136,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(92,3,139,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(93,3,140,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(94,3,145,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(95,3,155,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(96,3,157,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(97,3,158,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(98,3,160,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(99,3,162,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(100,3,167,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(101,3,168,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(102,3,169,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(103,3,171,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(104,3,172,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(105,3,173,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(106,3,181,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(107,3,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(108,3,186,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(109,3,195,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(110,3,201,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(111,3,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(112,3,205,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(113,3,208,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(114,3,209,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(115,3,212,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(116,3,213,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(117,3,225,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(118,3,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(119,3,239,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(120,3,254,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(121,4,7,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(122,4,10,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(123,4,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(124,4,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(125,4,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(126,4,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(127,4,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(128,4,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(129,4,91,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(130,4,103,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(131,4,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(132,4,122,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(133,4,125,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(134,4,132,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(135,4,139,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(136,4,141,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(137,4,142,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(138,4,151,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(139,4,153,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(140,4,156,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(141,4,157,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(142,4,158,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(143,4,160,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(144,4,164,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(145,4,168,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(146,4,170,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(147,4,173,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(148,4,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(149,4,188,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(150,4,194,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(151,4,195,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(152,4,198,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(153,4,201,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(154,4,205,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(155,4,213,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(156,4,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(157,4,254,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(158,4,255,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(159,4,273,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(160,4,277,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(161,4,278,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(162,5,4,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(163,5,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(164,5,7,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(165,5,20,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(166,5,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(167,5,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(168,5,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(169,5,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(170,5,39,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(171,5,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(172,5,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(173,5,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(174,5,91,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(175,5,101,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(176,5,111,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(177,5,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(178,5,116,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(179,5,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(180,5,122,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(181,5,136,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(182,5,137,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(183,5,138,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(184,5,143,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(185,5,144,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(186,5,146,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(187,5,150,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(188,5,155,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(189,5,157,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(190,5,158,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(191,5,160,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(192,5,162,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(193,5,166,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(194,5,182,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(195,5,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(196,5,189,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(197,5,193,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(198,5,194,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(199,5,198,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(200,5,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(201,5,205,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(202,5,226,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(203,5,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(204,5,249,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(205,5,255,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(206,5,257,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(207,5,263,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(208,5,271,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(209,5,274,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(210,5,276,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(211,6,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(212,6,7,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(213,6,10,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(214,6,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(215,6,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(216,6,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(217,6,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(218,6,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(219,6,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(220,6,88,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(221,6,89,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(222,6,94,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(223,6,98,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(224,6,102,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(225,6,109,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(226,6,111,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(227,6,115,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(228,6,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(229,6,119,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(230,6,124,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(231,6,125,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(232,6,137,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(233,6,141,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(234,6,144,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(235,6,145,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(236,6,148,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(237,6,152,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(238,6,157,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(239,6,173,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(240,6,181,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(241,6,190,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(242,6,194,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(243,6,197,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(244,6,227,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(245,6,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(246,6,252,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(247,6,256,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(248,6,258,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(249,6,271,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(250,6,275,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(251,7,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(252,7,7,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(253,7,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(254,7,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(255,7,38,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(256,7,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(257,7,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(258,7,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(259,7,68,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(260,7,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(261,7,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(262,7,88,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(263,7,92,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(264,7,93,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(265,7,102,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(266,7,104,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(267,7,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(268,7,115,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(269,7,120,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(270,7,129,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(271,7,133,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(272,7,136,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(273,7,144,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(274,7,145,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(275,7,148,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(276,7,153,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(277,7,155,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(278,7,165,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(279,7,179,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(280,7,182,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(281,7,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(282,7,185,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(283,7,189,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(284,7,194,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(285,7,197,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(286,7,200,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(287,7,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(288,7,232,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(289,7,271,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(290,8,1,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(291,8,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(292,8,9,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(293,8,17,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(294,8,20,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(295,8,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(296,8,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(297,8,37,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(298,8,38,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(299,8,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(300,8,48,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(301,8,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(302,8,68,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(303,8,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(304,8,88,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(305,8,92,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(306,8,94,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(307,8,99,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(308,8,102,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(309,8,112,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(310,8,114,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(311,8,115,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(312,8,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(313,8,121,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(314,8,129,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(315,8,134,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(316,8,137,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(317,8,145,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(318,8,148,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(319,8,149,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(320,8,154,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(321,8,158,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(322,8,161,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(323,8,174,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(324,8,177,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(325,8,179,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(326,8,182,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(327,8,190,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(328,8,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(329,8,213,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(330,8,228,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(331,8,234,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(332,8,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(333,8,238,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(334,8,241,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(335,8,252,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(336,8,253,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(337,8,254,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(338,8,258,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(339,8,260,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(340,8,262,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(341,8,264,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(342,8,265,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(343,8,267,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(344,8,270,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(345,8,274,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(346,9,1,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(347,9,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(348,9,17,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(349,9,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(350,9,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(351,9,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(352,9,35,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(353,9,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(354,9,45,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(355,9,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(356,9,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(357,9,69,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(358,9,88,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(359,9,92,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(360,9,94,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(361,9,98,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(362,9,99,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(363,9,104,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(364,9,108,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(365,9,110,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(366,9,111,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(367,9,113,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(368,9,115,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(369,9,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(370,9,126,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(371,9,128,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(372,9,129,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(373,9,131,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(374,9,139,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(375,9,144,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(376,9,148,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(377,9,149,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(378,9,158,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(379,9,160,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(380,9,163,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(381,9,175,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(382,9,187,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(383,9,190,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(384,9,197,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(385,9,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(386,9,204,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(387,9,207,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(388,9,213,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(389,9,233,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(390,9,236,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(391,9,251,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(392,9,254,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(393,9,261,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(394,9,265,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(395,9,268,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(396,9,269,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(397,9,271,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(398,10,1,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(399,10,2,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(400,10,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(401,10,13,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(402,10,15,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(403,10,17,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(404,10,25,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(405,10,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(406,10,33,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(407,10,34,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(408,10,38,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(409,10,43,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(410,10,48,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(411,10,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(412,10,69,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(413,10,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(414,10,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(415,10,88,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(416,10,92,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(417,10,95,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(418,10,96,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(419,10,97,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(420,10,99,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(421,10,100,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(422,10,108,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(423,10,110,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(424,10,115,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(425,10,117,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(426,10,118,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(427,10,130,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(428,10,135,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(429,10,139,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(430,10,155,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(431,10,156,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(432,10,159,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(433,10,160,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(434,10,166,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(435,10,175,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(436,10,180,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(437,10,182,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(438,10,184,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(439,10,199,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(440,10,202,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(441,10,203,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(442,10,210,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(443,10,211,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(444,10,224,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(445,10,229,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(446,10,230,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(447,10,231,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(448,10,235,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(449,10,237,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(450,10,242,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(451,10,243,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(452,10,244,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(453,10,245,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(454,10,246,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(455,10,247,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(456,10,248,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(457,10,250,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(458,10,259,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(459,10,266,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(460,10,275,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(461,18,1,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(462,18,2,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(463,18,3,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(464,18,4,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(465,18,6,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(466,18,9,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(467,18,12,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(468,18,13,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(469,18,15,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(470,18,16,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(471,18,22,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(472,18,23,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(473,18,28,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(474,18,29,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(475,18,30,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(476,18,32,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(477,18,35,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(478,18,40,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(479,18,41,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(480,18,46,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(481,18,49,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(482,18,50,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(483,18,51,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(484,18,52,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(485,18,53,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(486,18,54,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(487,18,55,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(488,18,56,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(489,18,57,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(490,18,59,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(491,18,60,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(492,18,61,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(493,18,62,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(494,18,63,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(495,18,64,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(496,18,65,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(497,18,66,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(498,18,67,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(499,18,68,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(500,18,69,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(501,18,70,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(502,18,71,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(503,18,72,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(504,18,73,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(505,18,74,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(506,18,75,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(507,18,76,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(508,18,77,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(509,18,79,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(510,18,80,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(511,18,81,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(512,18,82,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(513,18,83,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(514,18,84,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(515,18,85,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(516,18,87,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(517,18,119,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(518,18,161,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(519,18,164,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(520,18,292,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(521,18,293,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(522,18,294,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
INSERT INTO evento_edicion_participante VALUES(523,18,295,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 15:18:43');
CREATE TABLE IF NOT EXISTS participante_exposicion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    participante_id INTEGER,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 1,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exposicion_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_evento_edicion FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_postulacion FOREIGN KEY (postulacion_id) REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_participante FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE RESTRICT,
    CONSTRAINT fk_exposicion_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_exposicion_agrupacion FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_exposicion_modo_ingreso FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),

    CONSTRAINT uq_exposicion_artista_evento UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_exposicion_estado
        CHECK (estado IN ('seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'))
);
INSERT INTO participante_exposicion VALUES(1,1,8,NULL,290,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(2,1,9,NULL,346,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(3,1,10,NULL,398,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(4,2,10,NULL,399,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(5,6,5,NULL,163,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(6,6,6,NULL,211,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(7,6,7,NULL,251,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(8,6,8,NULL,291,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(9,6,9,NULL,347,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(10,6,10,NULL,400,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(11,7,4,NULL,121,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(12,7,5,NULL,164,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(13,7,6,NULL,212,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(14,7,7,NULL,252,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(15,9,8,NULL,292,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(16,10,3,NULL,71,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(17,10,4,NULL,122,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(18,10,6,NULL,213,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(19,13,10,NULL,401,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(20,17,8,NULL,293,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(21,17,9,NULL,348,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(22,17,10,NULL,403,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(23,20,5,NULL,165,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(24,20,8,NULL,294,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(25,31,1,NULL,1,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(26,31,2,NULL,37,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(27,31,3,NULL,72,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(28,32,1,NULL,2,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(29,32,2,NULL,38,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(30,32,5,NULL,166,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(31,32,6,NULL,214,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(32,32,7,NULL,253,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(33,32,8,NULL,295,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(34,32,9,NULL,349,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(35,32,10,NULL,405,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(36,33,1,NULL,3,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(37,33,2,NULL,39,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(38,33,3,NULL,73,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(39,33,4,NULL,123,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(40,33,5,NULL,167,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(41,33,6,NULL,215,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(42,33,9,NULL,350,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(43,33,10,NULL,406,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(44,34,4,NULL,124,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(45,34,5,NULL,168,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(46,34,6,NULL,216,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(47,34,7,NULL,254,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(48,34,8,NULL,296,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(49,34,9,NULL,351,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(50,34,10,NULL,407,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(51,35,3,NULL,74,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(52,35,9,NULL,352,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(53,37,1,NULL,4,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(54,37,2,NULL,40,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(55,37,3,NULL,75,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(56,37,4,NULL,125,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(57,37,5,NULL,169,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(58,37,8,NULL,297,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(59,39,5,NULL,170,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(60,43,4,NULL,126,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(61,43,6,NULL,217,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(62,43,7,NULL,256,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(63,43,8,NULL,299,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(64,43,9,NULL,353,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(65,43,10,NULL,409,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(66,52,3,NULL,76,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(67,52,4,NULL,127,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(68,52,5,NULL,171,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(69,52,7,NULL,257,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(70,52,9,NULL,355,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(71,64,6,NULL,218,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(72,64,7,NULL,258,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(73,64,8,NULL,301,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(74,64,9,NULL,356,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(75,64,10,NULL,411,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(76,68,7,NULL,259,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(77,68,8,NULL,302,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(78,69,9,NULL,357,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(79,69,10,NULL,412,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(80,71,1,NULL,6,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(81,80,4,NULL,128,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(82,80,5,NULL,172,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(83,80,6,NULL,219,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(84,80,7,NULL,260,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(85,80,10,NULL,413,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(86,81,1,NULL,7,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(87,81,2,NULL,41,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(88,81,3,NULL,77,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(89,81,5,NULL,173,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(90,81,7,NULL,261,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(91,81,8,NULL,303,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(92,81,10,NULL,414,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(93,45,9,NULL,354,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(94,48,8,NULL,300,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(95,48,10,NULL,410,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(96,88,6,NULL,220,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(97,88,7,NULL,262,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(98,88,8,NULL,304,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(99,88,9,NULL,358,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(100,88,10,NULL,415,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(101,89,6,NULL,221,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(102,90,3,NULL,78,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(103,91,3,NULL,79,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(104,91,4,NULL,129,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(105,91,5,NULL,174,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(106,92,7,NULL,263,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(107,92,8,NULL,305,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(108,92,9,NULL,359,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(109,92,10,NULL,416,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(110,93,7,NULL,264,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(111,94,6,NULL,222,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(112,94,8,NULL,306,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(113,94,9,NULL,360,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(114,95,3,NULL,80,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(115,95,10,NULL,417,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(116,96,10,NULL,418,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(117,97,10,NULL,419,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(118,98,6,NULL,223,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(119,98,9,NULL,361,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(120,99,8,NULL,307,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(121,99,9,NULL,362,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(122,99,10,NULL,420,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(123,100,10,NULL,421,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(124,101,5,NULL,175,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(125,102,6,NULL,224,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(126,102,7,NULL,265,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(127,102,8,NULL,308,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(128,103,4,NULL,130,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(129,104,3,NULL,81,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(130,104,7,NULL,266,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(131,104,9,NULL,363,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(132,105,3,NULL,82,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(133,106,1,NULL,8,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(134,107,1,NULL,9,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(135,107,2,NULL,42,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(136,108,9,NULL,364,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(137,108,10,NULL,422,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(138,109,6,NULL,225,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(139,110,9,NULL,365,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(140,110,10,NULL,423,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(141,111,5,NULL,176,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(142,111,6,NULL,226,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(143,111,9,NULL,366,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(144,112,8,NULL,309,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(145,113,9,NULL,367,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(146,114,1,NULL,10,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(147,114,2,NULL,43,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(148,114,3,NULL,83,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(149,114,4,NULL,131,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(150,114,5,NULL,177,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(151,114,7,NULL,267,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(152,114,8,NULL,310,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(153,115,6,NULL,227,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(154,115,7,NULL,268,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(155,115,8,NULL,311,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(156,115,9,NULL,368,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(157,115,10,NULL,424,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(158,116,1,NULL,11,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(159,116,3,NULL,84,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(160,116,5,NULL,178,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(161,117,2,NULL,44,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(162,117,3,NULL,85,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(163,117,10,NULL,425,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(164,118,2,NULL,45,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(165,118,3,NULL,86,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(166,118,5,NULL,179,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(167,118,6,NULL,228,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(168,118,8,NULL,312,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(169,118,9,NULL,369,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(170,118,10,NULL,426,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(171,119,6,NULL,229,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(172,120,7,NULL,269,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(173,121,8,NULL,313,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(174,122,1,NULL,12,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(175,122,2,NULL,46,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(176,122,3,NULL,87,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(177,122,4,NULL,132,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(178,122,5,NULL,180,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(179,123,3,NULL,88,1,6,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(180,124,6,NULL,230,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(181,125,3,NULL,89,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(182,125,4,NULL,133,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(183,125,6,NULL,231,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(184,126,9,NULL,370,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(185,127,2,NULL,47,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(186,128,9,NULL,371,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(187,129,7,NULL,270,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(188,129,8,NULL,314,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(189,129,9,NULL,372,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(190,130,10,NULL,427,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(191,131,9,NULL,373,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(192,132,4,NULL,134,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(193,133,1,NULL,13,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(194,133,3,NULL,90,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(195,133,7,NULL,271,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(196,134,8,NULL,315,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(197,135,10,NULL,428,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(198,136,1,NULL,14,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(199,136,2,NULL,48,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(200,136,3,NULL,91,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(201,136,5,NULL,181,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(202,136,7,NULL,272,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(203,137,5,NULL,182,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(204,137,6,NULL,232,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(205,137,8,NULL,316,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(206,138,5,NULL,183,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(207,139,3,NULL,92,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(208,139,4,NULL,135,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(209,139,9,NULL,374,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(210,139,10,NULL,429,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(211,140,3,NULL,93,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(212,141,4,NULL,136,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(213,141,6,NULL,233,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(214,142,4,NULL,137,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(215,143,1,NULL,15,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(216,143,2,NULL,49,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(217,143,5,NULL,184,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(218,144,5,NULL,185,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(219,144,6,NULL,234,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(220,144,7,NULL,273,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(221,144,9,NULL,375,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(222,145,2,NULL,50,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(223,145,3,NULL,94,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(224,145,6,NULL,235,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(225,145,7,NULL,274,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(226,145,8,NULL,317,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(227,146,5,NULL,186,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(228,147,1,NULL,16,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(229,147,2,NULL,51,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(230,148,2,NULL,52,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(231,148,6,NULL,236,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(232,148,7,NULL,275,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(233,148,8,NULL,318,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(234,148,9,NULL,376,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(235,149,8,NULL,319,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(236,149,9,NULL,377,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(237,150,5,NULL,187,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(238,151,4,NULL,138,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(239,152,6,NULL,237,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(240,153,4,NULL,139,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(241,153,7,NULL,276,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(242,154,8,NULL,320,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(243,155,2,NULL,53,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(244,155,3,NULL,95,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(245,155,5,NULL,188,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(246,155,7,NULL,277,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(247,155,10,NULL,430,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(248,156,1,NULL,17,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(249,156,2,NULL,54,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(250,156,4,NULL,140,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(251,156,10,NULL,431,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(252,157,3,NULL,96,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(253,157,4,NULL,141,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(254,157,5,NULL,189,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(255,157,6,NULL,238,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(256,158,5,NULL,190,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(257,159,10,NULL,432,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(258,160,3,NULL,98,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(259,160,4,NULL,143,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(260,160,5,NULL,191,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(261,160,9,NULL,379,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(262,160,10,NULL,433,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(263,161,8,NULL,322,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(264,162,2,NULL,55,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(265,162,3,NULL,99,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(266,162,5,NULL,192,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(267,163,9,NULL,380,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(268,164,2,NULL,56,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(269,164,4,NULL,144,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(270,165,7,NULL,278,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(271,166,5,NULL,193,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(272,166,10,NULL,434,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(273,167,3,NULL,100,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(274,168,3,NULL,101,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(275,168,4,NULL,145,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(276,169,1,NULL,18,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(277,169,2,NULL,57,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(278,169,3,NULL,102,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(279,170,4,NULL,146,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(280,171,3,NULL,103,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(281,172,3,NULL,104,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(282,173,3,NULL,105,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(283,173,4,NULL,147,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(284,173,6,NULL,239,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(285,174,8,NULL,323,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(286,175,9,NULL,381,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(287,175,10,NULL,435,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(288,176,2,NULL,58,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(289,177,8,NULL,324,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(290,178,1,NULL,19,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(291,178,2,NULL,59,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(292,179,7,NULL,279,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(293,179,8,NULL,325,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(294,180,10,NULL,436,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(295,181,3,NULL,106,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(296,181,6,NULL,240,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(297,182,5,NULL,194,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(298,182,7,NULL,280,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(299,182,8,NULL,326,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(300,182,10,NULL,437,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(301,183,2,NULL,60,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(302,184,1,NULL,20,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(303,184,2,NULL,61,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(304,184,3,NULL,107,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(305,184,4,NULL,148,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(306,184,5,NULL,195,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(307,184,7,NULL,281,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(308,184,10,NULL,438,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(309,185,7,NULL,282,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(310,186,3,NULL,108,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(311,187,9,NULL,382,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(312,188,4,NULL,149,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(313,189,5,NULL,196,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(314,189,7,NULL,283,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(315,190,6,NULL,241,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(316,190,8,NULL,327,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(317,190,9,NULL,383,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(318,191,2,NULL,62,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(319,192,2,NULL,63,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(320,193,5,NULL,197,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(321,194,4,NULL,150,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(322,194,5,NULL,198,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(323,194,6,NULL,242,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(324,194,7,NULL,284,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(325,195,3,NULL,109,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(326,195,4,NULL,151,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(327,196,2,NULL,64,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(328,197,6,NULL,243,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(329,197,7,NULL,285,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(330,197,9,NULL,384,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(331,198,4,NULL,152,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(332,198,5,NULL,199,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(333,199,10,NULL,439,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(334,200,7,NULL,286,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(335,201,3,NULL,110,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(336,201,4,NULL,153,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(337,202,3,NULL,111,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(338,202,5,NULL,200,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(339,202,7,NULL,287,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(340,202,8,NULL,328,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(341,202,9,NULL,385,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(342,202,10,NULL,440,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(343,203,10,NULL,441,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(344,204,9,NULL,386,4,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(345,205,3,NULL,112,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(346,205,4,NULL,154,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(347,205,5,NULL,201,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(348,206,2,NULL,65,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(349,207,9,NULL,387,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(350,208,3,NULL,113,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(351,209,3,NULL,114,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(352,210,10,NULL,442,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(353,211,10,NULL,443,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(355,213,3,NULL,116,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(356,213,4,NULL,155,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(357,213,8,NULL,329,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(358,213,9,NULL,388,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(359,158,3,NULL,97,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(360,158,4,NULL,142,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(361,158,8,NULL,321,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(362,158,9,NULL,378,1,3,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(363,249,5,NULL,204,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(364,274,5,NULL,209,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(366,252,6,NULL,246,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(368,232,7,NULL,288,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(369,253,8,NULL,336,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(370,234,8,NULL,331,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(371,236,8,NULL,332,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(373,233,9,NULL,389,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(374,251,9,NULL,391,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(375,250,10,NULL,457,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(379,236,1,NULL,21,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(380,236,2,NULL,66,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(381,236,3,NULL,118,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(382,236,4,NULL,156,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(383,236,5,NULL,203,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(384,236,6,NULL,245,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(385,236,9,NULL,390,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(386,252,8,NULL,335,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(387,274,8,NULL,345,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(388,230,10,NULL,446,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(389,231,10,NULL,447,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(390,235,10,NULL,448,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(391,237,10,NULL,449,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(392,242,10,NULL,450,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(393,243,10,NULL,451,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(394,244,10,NULL,452,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(395,245,10,NULL,453,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(396,246,10,NULL,454,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(397,247,10,NULL,455,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(398,248,10,NULL,456,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(399,259,10,NULL,458,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(400,266,10,NULL,459,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(401,238,8,NULL,333,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(402,241,8,NULL,334,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(403,260,8,NULL,339,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(404,262,8,NULL,340,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(405,264,8,NULL,341,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(406,267,8,NULL,343,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(407,270,8,NULL,344,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(408,261,9,NULL,393,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(409,268,9,NULL,395,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(410,269,9,NULL,396,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(411,257,5,NULL,206,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(412,263,5,NULL,207,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(413,276,5,NULL,210,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(414,256,6,NULL,247,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(415,273,4,NULL,159,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(416,277,4,NULL,160,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(417,278,4,NULL,161,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(418,239,3,NULL,119,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(419,240,2,NULL,67,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(420,272,2,NULL,70,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(421,254,2,NULL,68,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(422,254,3,NULL,120,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(423,254,4,NULL,157,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(424,254,8,NULL,337,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(425,254,9,NULL,392,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(426,255,1,NULL,22,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(427,255,2,NULL,69,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(428,255,4,NULL,158,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(429,255,5,NULL,205,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(430,258,6,NULL,248,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(431,258,8,NULL,338,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(432,265,8,NULL,342,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(433,265,9,NULL,394,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(434,271,5,NULL,208,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(435,271,6,NULL,249,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(436,271,7,NULL,289,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(437,271,9,NULL,397,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(438,275,6,NULL,250,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(439,275,10,NULL,460,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(440,15,10,NULL,402,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(441,25,10,NULL,404,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(442,38,7,NULL,255,1,4,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(443,38,8,NULL,298,1,4,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(444,38,10,NULL,408,1,4,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(445,212,3,NULL,115,1,6,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(446,280,1,NULL,24,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(447,281,1,NULL,25,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(448,282,1,NULL,26,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(449,283,1,NULL,27,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(450,284,1,NULL,28,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(451,285,1,NULL,29,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(452,4,2,NULL,36,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(453,4,5,NULL,162,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(454,1,18,NULL,461,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(455,2,18,NULL,462,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(456,3,18,NULL,463,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(457,4,18,NULL,464,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(458,6,18,NULL,465,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(459,9,18,NULL,466,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(460,12,18,NULL,467,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(461,13,18,NULL,468,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(462,15,18,NULL,469,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(463,16,18,NULL,470,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(464,22,18,NULL,471,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(465,23,18,NULL,472,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(466,28,18,NULL,473,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(467,29,18,NULL,474,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(468,30,18,NULL,475,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(469,32,18,NULL,476,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(470,35,18,NULL,477,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(471,51,18,NULL,483,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(472,52,18,NULL,484,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(473,53,18,NULL,485,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(474,54,18,NULL,486,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(475,55,18,NULL,487,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(476,56,18,NULL,488,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(477,57,18,NULL,489,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(478,60,18,NULL,491,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(479,61,18,NULL,492,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(480,64,18,NULL,495,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(481,67,18,NULL,498,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(482,68,18,NULL,499,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(483,69,18,NULL,500,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(484,73,18,NULL,504,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(485,74,18,NULL,505,1,1,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(486,75,18,NULL,506,1,1,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(487,76,18,NULL,507,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(488,77,18,NULL,508,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(489,80,18,NULL,510,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(490,81,18,NULL,511,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(491,83,18,NULL,513,1,2,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(492,87,18,NULL,516,1,2,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(493,119,18,NULL,517,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(494,164,18,NULL,519,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(495,293,18,NULL,521,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(496,294,18,NULL,522,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(497,295,18,NULL,523,1,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(498,46,18,NULL,480,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(499,49,18,NULL,481,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(500,65,18,NULL,496,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(501,66,18,NULL,497,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(502,70,18,NULL,501,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(503,72,18,NULL,503,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(504,79,18,NULL,509,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(505,82,18,NULL,512,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(506,84,18,NULL,514,3,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(507,40,18,NULL,478,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(508,41,18,NULL,479,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(509,50,18,NULL,482,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(510,59,18,NULL,490,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(511,62,18,NULL,493,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(512,63,18,NULL,494,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(513,71,18,NULL,502,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(514,85,18,NULL,515,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(515,161,18,NULL,518,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
INSERT INTO participante_exposicion VALUES(516,292,18,NULL,520,2,NULL,1,NULL,'completado',NULL,'2026-01-20 03:39:56','2026-01-20 03:39:56');
CREATE TABLE IF NOT EXISTS participante_actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL,
    postulacion_id INTEGER,
    participante_id INTEGER,
    tipo_actividad_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    modo_ingreso_id INTEGER NOT NULL DEFAULT 2,
    puntaje INTEGER,
    estado TEXT NOT NULL DEFAULT 'seleccionado',
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_artista
        FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_evento_edicion
        FOREIGN KEY (evento_edicion_id) REFERENCES evento_edicion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_postulacion
        FOREIGN KEY (postulacion_id) REFERENCES evento_edicion_postulacion (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_participante
        FOREIGN KEY (participante_id) REFERENCES evento_edicion_participante (id) ON DELETE RESTRICT,
    CONSTRAINT fk_actividad_tipo_actividad
        FOREIGN KEY (tipo_actividad_id) REFERENCES tipo_actividad (id),
    CONSTRAINT fk_actividad_agrupacion
        FOREIGN KEY (agrupacion_id) REFERENCES agrupacion (id),
    CONSTRAINT fk_actividad_modo_ingreso
        FOREIGN KEY (modo_ingreso_id) REFERENCES modo_ingreso (id),

    CONSTRAINT chk_actividad_estado
        CHECK (estado IN ('seleccionado', 'confirmado', 'desistido', 'cancelado', 'ausente', 'completado'))
);
INSERT INTO participante_actividad VALUES(1,226,5,NULL,202,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(2,227,6,NULL,244,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(3,228,8,NULL,330,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(4,224,10,NULL,444,2,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(5,229,10,NULL,445,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(6,225,3,NULL,117,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(7,169,1,NULL,18,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(8,278,1,NULL,23,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(9,286,1,NULL,30,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(10,44,1,NULL,5,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(11,184,1,NULL,20,1,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(12,287,1,NULL,31,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(13,288,1,NULL,32,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(14,289,1,NULL,33,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(15,290,1,NULL,34,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
INSERT INTO participante_actividad VALUES(16,291,1,NULL,35,3,NULL,2,NULL,'completado',NULL,'2026-01-20 03:40:00','2026-01-20 03:40:00');
CREATE TABLE IF NOT EXISTS actividad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    participante_actividad_id INTEGER UNIQUE NOT NULL,
    titulo TEXT,
    descripcion TEXT,
    duracion_minutos INTEGER,
    ubicacion TEXT,
    hora_inicio TEXT,
    cupos INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_actividad_participante_actividad  FOREIGN KEY (participante_actividad_id) REFERENCES participante_actividad (id) ON DELETE CASCADE,
    CONSTRAINT chk_actividad_duracion CHECK (duracion_minutos IS NULL OR duracion_minutos > 0)
);
INSERT INTO actividad VALUES(1,7,'Memes como expresión cultural y lenguaje visual','El taller abordará la memética desde una perspectiva artística, performática e ilustrativa. Analizará el discurso político inserto en las imágenes, los antecedentes históricos así como su relación con el movimiento Dada, y el shitposting como una manifestación del Culture Jamming. Al finalizar se realizará un ejercicio ilustrativo experimental relacionado con la temática del taller.',60,NULL,'15:00',12,'2026-01-20 03:40:21','2026-01-20 03:40:21');
INSERT INTO actividad VALUES(2,8,'Fanzine y exploración del estilo Visceral','El beneficiario conocerá diferentes maneras de confeccionar un fanzine de su autoría conociendo las herramientas básicas hasta aquellas con mayor complejidad. Durante el mismo taller se desarrollará un ejercicio de estilo para encontrar una identidad auténtica en el dibujo u otro medio de expresión gráfica según los intereses que se desarrollen por el asistente.',60,NULL,'16:00',12,'2026-01-20 03:40:21','2026-01-20 03:40:21');
INSERT INTO actividad VALUES(3,9,'Escritura Creativa','Taller de escritura creativa dirigido a jóvenes de entre 15 a 35 años con disposición a pasar un momento agradable.',60,NULL,'17:00',12,'2026-01-20 03:40:21','2026-01-20 03:40:21');
INSERT INTO actividad VALUES(4,10,'Encuadernación plegada, libros origami','Es un modo sencillo, llamativo y novedoso de publicar, hacer libros objeto con propuestas tanto visuales como literarias.',60,NULL,'18:00',12,'2026-01-20 03:40:21','2026-01-20 03:40:21');
INSERT INTO actividad VALUES(5,11,'Accesorios con porcelana en frío','Taller de accesorios de porcelana donde se podrá elegir el diseño (llavero, colgante, chapita). Dirigido a personas que quieren comenzar/conocer como trabajar con este material. Contenido: técnica para teñir y amasar la porcelana, cómo utilizar los distintos instrumentos para crear texturas, cómo reutilizar porcelana reseca, cómo moldear y pegar para crear figuras.',60,NULL,'19:00',12,'2026-01-20 03:40:21','2026-01-20 03:40:21');
CREATE TABLE IF NOT EXISTS evento_edicion_postulacion (
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
CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(255) NOT NULL PRIMARY KEY);
INSERT INTO schema_migrations VALUES('1766948368');
INSERT INTO schema_migrations VALUES('1766948369');
INSERT INTO schema_migrations VALUES('1766948370');
INSERT INTO schema_migrations VALUES('1766948371');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('disciplina',4);
INSERT INTO sqlite_sequence VALUES('artista_estado',5);
INSERT INTO sqlite_sequence VALUES('modo_ingreso',3);
INSERT INTO sqlite_sequence VALUES('tipo_actividad',3);
INSERT INTO sqlite_sequence VALUES('organizacion',1);
INSERT INTO sqlite_sequence VALUES('evento',2);
INSERT INTO sqlite_sequence VALUES('evento_edicion',18);
INSERT INTO sqlite_sequence VALUES('lugar',6);
INSERT INTO sqlite_sequence VALUES('evento_edicion_dia',27);
INSERT INTO sqlite_sequence VALUES('evento_edicion_metrica',30);
INSERT INTO sqlite_sequence VALUES('artista',295);
INSERT INTO sqlite_sequence VALUES('artista_imagen',87);
INSERT INTO sqlite_sequence VALUES('catalogo_artista',87);
INSERT INTO sqlite_sequence VALUES('artista_historial',41);
INSERT INTO sqlite_sequence VALUES('agrupacion',6);
INSERT INTO sqlite_sequence VALUES('evento_edicion_participante',523);
INSERT INTO sqlite_sequence VALUES('participante_exposicion',516);
INSERT INTO sqlite_sequence VALUES('participante_actividad',16);
INSERT INTO sqlite_sequence VALUES('actividad',5);
CREATE UNIQUE INDEX idx_artista_slug ON artista (slug);
CREATE UNIQUE INDEX idx_artista_correo_pseudonimo ON artista (
    correo, pseudonimo
)
WHERE correo IS NOT NULL;
CREATE INDEX idx_artista_estado ON artista (estado_id);
CREATE INDEX idx_artista_imagen_artista ON artista_imagen (
    artista_id
);
CREATE INDEX idx_artista_imagen_artista_tipo ON artista_imagen (
    artista_id, tipo
);
CREATE INDEX idx_artista_historial_artista ON artista_historial (
    artista_id
);
CREATE INDEX idx_artista_historial_pseudonimo
ON artista_historial (
    pseudonimo
);
CREATE INDEX idx_artista_historial_orden ON artista_historial (
    artista_id, orden
);
CREATE INDEX idx_catalogo_artista_orden ON catalogo_artista (
    orden
);
CREATE INDEX idx_catalogo_artista_activo ON catalogo_artista (
    activo
);
CREATE INDEX idx_catalogo_artista_destacado ON catalogo_artista (
    destacado
);
CREATE UNIQUE INDEX idx_evento_slug ON evento (slug);
CREATE UNIQUE INDEX idx_evento_edicion_numero ON evento_edicion (
    evento_id, numero_edicion
);
CREATE UNIQUE INDEX idx_evento_edicion_slug ON evento_edicion (
    evento_id, slug
);
CREATE INDEX idx_evento_edicion_evento ON evento_edicion (
    evento_id
);
CREATE INDEX idx_evento_edicion_dia_edicion ON evento_edicion_dia (
    evento_edicion_id
);
CREATE INDEX idx_evento_edicion_dia_fecha ON evento_edicion_dia (
    fecha
);
CREATE INDEX idx_evento_edicion_dia_lugar ON evento_edicion_dia (
    lugar_id
);
CREATE INDEX idx_evento_edicion_metrica_evento_edicion ON evento_edicion_metrica (
    evento_edicion_id
);
CREATE INDEX idx_evento_edicion_metrica_fecha ON evento_edicion_metrica (
    fecha_registro
);
CREATE INDEX idx_evento_edicion_snapshot_evento_edicion ON evento_edicion_snapshot (
    evento_edicion_id
);
CREATE INDEX idx_participante_evento_edicion ON evento_edicion_participante (evento_edicion_id);
CREATE INDEX idx_participante_artista ON evento_edicion_participante (artista_id);
CREATE INDEX idx_participante_estado ON evento_edicion_participante (estado);
CREATE INDEX idx_exposicion_artista ON participante_exposicion (artista_id);
CREATE INDEX idx_exposicion_evento_edicion ON participante_exposicion (evento_edicion_id);
CREATE INDEX idx_exposicion_postulacion ON participante_exposicion (postulacion_id);
CREATE INDEX idx_exposicion_participante ON participante_exposicion (participante_id);
CREATE INDEX idx_exposicion_estado ON participante_exposicion (estado);
CREATE INDEX idx_exposicion_disciplina ON participante_exposicion (disciplina_id);
CREATE INDEX idx_exposicion_agrupacion ON participante_exposicion (agrupacion_id);
CREATE INDEX idx_exposicion_modo_ingreso ON participante_exposicion (modo_ingreso_id);
CREATE INDEX idx_exposicion_puntaje ON participante_exposicion (puntaje DESC) WHERE puntaje IS NOT NULL;
CREATE INDEX idx_actividad_artista ON participante_actividad (artista_id);
CREATE INDEX idx_actividad_evento_edicion ON participante_actividad (evento_edicion_id);
CREATE INDEX idx_actividad_postulacion ON participante_actividad (postulacion_id);
CREATE INDEX idx_actividad_participante ON participante_actividad (participante_id);
CREATE INDEX idx_actividad_estado ON participante_actividad (estado);
CREATE INDEX idx_actividad_tipo_actividad ON participante_actividad (tipo_actividad_id);
CREATE INDEX idx_actividad_agrupacion ON participante_actividad (agrupacion_id);
CREATE INDEX idx_actividad_modo_ingreso ON participante_actividad (modo_ingreso_id);
CREATE INDEX idx_actividad_puntaje ON participante_actividad (puntaje DESC) WHERE puntaje IS NOT NULL;
CREATE INDEX idx_actividad_participante_actividad ON actividad (participante_actividad_id);
CREATE INDEX idx_postulacion_evento_edicion ON evento_edicion_postulacion (evento_edicion_id);
CREATE INDEX idx_postulacion_disciplina ON evento_edicion_postulacion (disciplina_id);
CREATE TRIGGER trg_organizacion_updated_at AFTER UPDATE ON organizacion FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE organizacion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_organizacion_equipo_updated_at AFTER UPDATE ON organizacion_equipo FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE organizacion_equipo SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_lugar_updated_at AFTER UPDATE ON lugar FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE lugar SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_disciplina_updated_at AFTER UPDATE ON disciplina FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE disciplina SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_artista_estado_updated_at AFTER UPDATE ON artista_estado FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE artista_estado SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_artista_updated_at AFTER UPDATE ON artista FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE artista SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_artista_imagen_updated_at AFTER UPDATE ON artista_imagen FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE artista_imagen SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_catalogo_artista_updated_at AFTER UPDATE ON catalogo_artista FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE catalogo_artista SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_agrupacion_updated_at AFTER UPDATE ON agrupacion FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE agrupacion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_evento_updated_at AFTER UPDATE ON evento FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE evento SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_evento_edicion_updated_at AFTER UPDATE ON evento_edicion FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE evento_edicion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_evento_edicion_dia_updated_at AFTER UPDATE ON evento_edicion_dia FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE evento_edicion_dia SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_evento_edicion_postulacion_updated_at AFTER UPDATE ON evento_edicion_postulacion FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN
UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = OLD.updated_at;
END;
CREATE TRIGGER trg_tipo_actividad_updated_at AFTER UPDATE ON tipo_actividad FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE tipo_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_modo_ingreso_updated_at AFTER UPDATE ON modo_ingreso FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE modo_ingreso SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_evento_edicion_participante_updated_at AFTER UPDATE ON evento_edicion_participante FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_participante_exposicion_updated_at AFTER UPDATE ON participante_exposicion FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE participante_exposicion SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_participante_actividad_updated_at AFTER UPDATE ON participante_actividad FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE participante_actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_actividad_updated_at AFTER UPDATE ON actividad FOR EACH ROW WHEN OLD.updated_at <> NEW.updated_at BEGIN
UPDATE actividad SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND updated_at = NEW.updated_at;
END;
CREATE TRIGGER trg_cascade_cancel_to_exposicion AFTER UPDATE ON evento_edicion_participante FOR EACH ROW WHEN NEW.estado = 'cancelado' AND OLD.estado <> 'cancelado' BEGIN
UPDATE participante_exposicion SET estado = 'cancelado', notas = COALESCE (notas || ' | ', '') || 'Cancelado por estado global: ' || datetime ('now') WHERE participante_id = NEW.id AND estado NOT IN ('cancelado', 'desistido', 'ausente', 'completado');
UPDATE participante_actividad SET estado = 'cancelado', notas = COALESCE (notas || ' | ', '') || 'Cancelado por estado global: ' || datetime ('now') WHERE participante_id = NEW.id AND estado NOT IN ('cancelado', 'desistido', 'ausente', 'completado');
END;
CREATE TRIGGER trg_prevent_vetado_exposicion BEFORE INSERT ON participante_exposicion FOR EACH ROW WHEN NEW.artista_id IS NOT NULL AND (NEW.estado IS NULL OR NEW.estado <> 'completado') AND (SELECT estado_id FROM artista WHERE id = NEW.artista_id) = 4 BEGIN
SELECT RAISE (ABORT, 'artist_vetado: artista.estado_id = 4');
END;
CREATE TRIGGER trg_prevent_vetado_actividad BEFORE INSERT ON participante_actividad FOR EACH ROW WHEN NEW.artista_id IS NOT NULL AND (NEW.estado IS NULL OR NEW.estado <> 'completado') AND (SELECT estado_id FROM artista WHERE id = NEW.artista_id) = 4 BEGIN
SELECT RAISE (ABORT, 'artist_vetado: artista.estado_id = 4');
END;
CREATE TRIGGER trg_cancel_all_on_veto
AFTER UPDATE OF estado_id ON artista
FOR EACH ROW
WHEN NEW.estado_id = 4 AND OLD.estado_id != 4
BEGIN
  -- Cancelar solo registros maestros 'activo' que tengan participaciones hijas activas
  UPDATE evento_edicion_participante
  SET estado = 'cancelado',
      updated_at = CURRENT_TIMESTAMP,
      notas = COALESCE(notas, '') || '\nAuto-canceled due to artista vetado (estado_id=4)'
  WHERE artista_id = NEW.id
    AND estado = 'activo'
    AND (
      EXISTS (
        SELECT 1 FROM participante_exposicion pe
        WHERE pe.participante_id = evento_edicion_participante.id
          AND pe.estado IN ('seleccionado', 'confirmado')
      )
      OR EXISTS (
        SELECT 1 FROM participante_actividad pa
        WHERE pa.participante_id = evento_edicion_participante.id
          AND pa.estado IN ('seleccionado', 'confirmado')
      )
    );
END;
COMMIT;
