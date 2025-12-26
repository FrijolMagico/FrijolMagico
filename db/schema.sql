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
CREATE TABLE IF NOT EXISTS artista (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT
, ciudad TEXT, descripcion TEXT, pais TEXT, created_at TEXT, updated_at TEXT, slug TEXT);
INSERT INTO artista VALUES(1,'Paula Rojas Videla','Anima Red','Animared.ilustracion@gmail.com','{"instagram":"https://Instagram.com/anima.red"}','La Serena',replace('Lic. en arquitectura, ilustradora y artista visual chilena.\nDesarrolla trabajos con temáticas relacionadas a la fantasía y la naturaleza, enfocándose en ilustrar y diseñar en torno a la creación de personajes originales y criaturas imaginarias, sus medios principales tradicionales artísticos son la acuarela, el grafito y los lápices de colores','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:52:28','anima-red');
INSERT INTO artista VALUES(2,'Vanesa Estefanie Vargas Leyton','Shobian','shobian.art@gmail.com','{"instagram":"https://www.instagram.com/shobian.art/"}','Coquimbo','Shobian, diseñadora gráfica de profesión e ilustradora autodidacta, se caracteriza por utilizar texturas análogas en la ilustración digital, aportando calidez a sus obras que retratan naturaleza y elementos de la vida cotidiana. Ha estado presente en diversos eventos de ilustración, destacando previas versiones del Festival Frijol Mágico y Festival ARC.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:28','shobian');
INSERT INTO artista VALUES(3,'Fran.Aerre','Fran.Aerre','fran.aerre@gmail.com','{"instagram":"https://www.instagram.com/fran_aerre/"}','Coquimbo','Artista regional que busca representar la expresividad de los animales, la belleza de la naturaleza y la cotidianidad de lo que la rodea, por medio de una pincelada segura pero dinámica. Sus técnicas predilectas son el óleo y el medio digital.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:29','fran-aerre');
INSERT INTO artista VALUES(4,'Josefa Aguilera','Skelly.Uwu','skelly.ilustra@gmail.com','{"instagram":"https://www.instagram.com/skelly.uwu/"}','La Serena','Hola! Soy Josefa Aguilera, Ilustradora y artista de videojuegos, tengo 27 años y dibujo con motivación desde los 14. Adoro crear personajes con trasfondos interesantes inspirados en la cultura Chilena y Asiática, siempre esperando generar un impacto a nivel emocional y espiritual, actualmente soy freelancer y estoy dibujando un manga "Si el río suena es porque piedras trae." 川石の音 (Kawaishi no oto) el cual está basado en las mencionadas culturas. He trabajado también para diversas compañías de videojuegos internacionales y participado en ferias de arte a lo largo del país. ¡Espero que disfrutes mucho mi trabajo!','Chile','2025-12-25 05:11:50','2025-12-26 04:52:30','skelly-uwu');
INSERT INTO artista VALUES(5,'P3Dro','P3Dro','p_rojas03@hotmail.com','{"instagram":"https://www.instagram.com/p3dro_rv.03?igsh=MWh2cnRzZHpmeDMzNg=="}','Coquimbo','Mi trabajo principalmente consiste en dibujos tradicionales coloreados con lápices de colores escolares. Abordo tópicos como el anime, videojuegos, series animadas y películas de horror. También realizo pequeños cuadros inspirados en la flora y monumentos típicos de la cuarta región de Coquimbo hechos con lápices acuarelables.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:31','p3dro');
INSERT INTO artista VALUES(6,'Ana Aurora Gutierrez Uribe','Catana','holacatana@gmail.com','{"instagram":"https://www.instagram.com/c_a_t_a_n_a/","facebook":"https://web.facebook.com/catanasworld/"}','La Serena','Mi arte mezcla elementos provenientes de una biografía personal, desde el paisaje regional y la cultura popular de la generación millenial. Mis creaciones reflejan la manera en que habito el territorio, me inspira el patrimonio natural y urbano, los espacios de convivencia y la riqueza de la cotidianeidad.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:31','catana');
INSERT INTO artista VALUES(7,'Sebastian Aguirre','Seba Endless','seba.endlesss@gmail.com','{"instagram":"https://www.instagram.com/seba.endless/","facebook":"https://web.facebook.com/Seba.Endless/"}','La Serena','¡Hola! Mi nombre es Seba Endless, diseñador gráfico e ilustrador, actualmente estudiando licenciatura en artes visuales. Mi trabajo se basa en ilustraciones y pinturas digitales de colores vibrantes y saturados, todos en diversas temáticas como: fanart de series, videojuegos, comic, manga, anime y mi obra original.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:32','seba-endless');
INSERT INTO artista VALUES(8,'Viliz_Vz','Viliz_Vz','vilizthementor21@gmail.com','{"instagram":"https://www.instagram.com/viliz_vz?igsh=aTF5dWFzMWl4azl6"}','Vicuña','Trabajos con xilografia, materiales gráficos, plasmando formas y estilos más naturales y organicos, además de plasmar mi caracter interno  y de lo que me rodea en ilustraciones variadas, tambien vendo yogurt congelado yo le llamo congurt.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:33','viliz-vz');
INSERT INTO artista VALUES(9,'Karime Simon Viñales','Karime Simon','avinagretta@gmail.com','{"instagram":"https://www.instagram.com/trauerkult_/?hl=es"}','La Serena','Trauerkult, que significa "culto al luto", representa plenamente el concepto de mi obra, en la cual la muerte se manifiesta en todas sus formas y escenarios, a partir de minuciosos puntos, luces y sombras.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:33','karime-simon');
INSERT INTO artista VALUES(10,'Ulises Lopez','Uliseslo','tallerelqui@gmail.com','{"instagram":"https://instagram.com/uliseslo","web":"http://fauna-impo.blogspot.com/"}','La Serena','Enfocado en la ilustración y las técnicas graficas artesanales, realizo series de imágenes que muestran diversos aspectos del entorno de la cuarta region, desde la naturaleza hasta temas sociales, generando relatos en diversos soportes como papel, textil, cerámica y objetos editoriales.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:34','uliseslo');
INSERT INTO artista VALUES(11,'Vale Ilustra','Vale Ilustra','valeilustra2@gmail.com','{"instagram":"https://www.instagram.com/vale_ilustra?igsh=a21rMmw0cGx5bDlh"}','La Serena','Hola, soy Vale ilustra y me complace presentar mi trabajo como ilustradora ,me inspiro principalmente en la moda coreana, japonesa  o contemporánea en general fusionando lo con un toque cute o kawaii. Utilizo principalmente el dibujo digital como metodología lo que me permite resaltar mejor los colores y detalles.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:35','vale-ilustra');
INSERT INTO artista VALUES(12,'Nyxandr','Nyxandr','Nyxandr.contacto@gmail.com','{"instagram":"https://www.instagram.com/nyxandr"}','La Serena','Hago una mezcla de fanarts, personajes propios e historias, explorando tanto lo tierno como lo oscuro. Mi arte refleja la dualidad de lo dulce y lo místico.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:35','nyxandr');
INSERT INTO artista VALUES(13,'Magdalena Antonia Pizarro Lopez','Canela','Canelaqq@gmail.com','{"instagram":"https://www.instagram.com/canela_qq1?igsh=MXdjbWRxOGRmaWZiYQ=="}','Coquimbo','¡Hola! Soy Canela, ilustradora desde temprana edad con una pasión por el arte y la creatividad. En la actualidad, me concentro en comisiones y proyectos diversos, y también me encanta explorar la creación de contenido variado, como streams y mercancía. Mi estilo se caracteriza por ser tierno y colorido, pero me adapto a diferentes enfoques según tus necesidades :D!','Chile','2025-12-25 05:11:50','2025-12-26 04:52:36','canela');
INSERT INTO artista VALUES(14,'Grabados Aleph','Grabados Aleph','angelbarra07@gmail.com','{"instagram":"https://www.instagram.com/grabados_aleph/"}','La Serena','Grabados Aleph básicamente está enfocado en la linografía y todo lo que tenga que ver con grabado. Mi trabajo abarca todo el proceso desde diseño, carvado e impresión de una linografía. En cuanto a las ilustraciones en si, son todos diseños originales y su temática abarca distintos ámbitos: desde animales y flores hasta referencias a clásicos de la literatura.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:37','grabados-aleph');
INSERT INTO artista VALUES(15,'Ivannia Belen Jacob García','Ivichu.Jpg','Ivabelen@gmail.com','{"instagram":"https://www.instagram.com/ivichu.jpg/"}','La Serena','¡Buenas! Soy IviChu.jpg, una chica que se expresa a través de ilustraciones vivas. Mi trabajo destaca personajes dinámicos y explora emociones, fantasía y relaciones, con un estilo único. dibujo capturando momentos que cuentas historias. ¡Acompáñame en este viaje artístico!','Chile','2025-12-25 05:11:50','2025-12-26 04:52:38','ivichu-jpg');
INSERT INTO artista VALUES(16,'Osamenta En El Jardin','Osamenta En El Jardin','valeria.suarez.diaz97@gmail.com','{"instagram":"https://www.instagram.com/osamentaseneljardin/"}','Vicuña','Mi trabajo se basa en crear dibujos y pinturas con una temática a la que me gusta llamar "fantasía macabra", para esto uso conceptos que me permitan crear una atmósfera oscura, tomando un estilo influenciado por la ilustración de libros antiguos y películas de terror.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:38','osamenta-en-el-jardin');
INSERT INTO artista VALUES(17,'Camila Rosa Malebrán Cabezas','Ckiryuu','madkiryuu@gmail.com','{"instagram":"https://www.instagram.com/ckiryuu","facebook":"https://www.facebook.com/Kiryuu00/"}','Coquimbo','¡Hola! ¡Soy Kiryuu! Mi trabajo se caracteriza por la búsqueda de la expresividad y la interpretación, ya sea mediante el humor ligero, o, en contraste, en trabajos de temas más oscuros o nostálgicos. Siento mucha pasión por el storytelling, actualmente desarrollándome en el área de la animación y storyboard.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:39','ckiryuu');
INSERT INTO artista VALUES(18,'Aderezo','Aderezo','addless7u7@gmail.com','{"instagram":"https://instagram.com/addless7u7"}','La Serena','¡Hola! Soy Aderezo, ilustrador digital, Mi estilo se basa en el animé, pero con un toque personal. con mis obras busco plasmar escenas como si de fotos se tratasen, tratando generalmente que mis trabajos cuenten una historia, por muy pequeña que sea. Eso sería todo, ¡Espero les guste mi trabajo!','Chile','2025-12-25 05:11:50','2025-12-26 04:52:40','aderezo');
INSERT INTO artista VALUES(19,'Purr Creatures','Purr Creatures','purrcreatures@gmail.com','{"instagram":"https://www.instagram.com/purrcreatures/"}','Coquimbo','¿Cómo sería el mundo si los gatos fueran los más evolucionados? Purr Creatures aborda esta pregunta a través de personajes que combinan la figura de la mujer y los felinos. Destacando distintos rasgos de sus personalidades e incorporando un toque de humor gráfico.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:40','purr-creatures');
INSERT INTO artista VALUES(20,'Anastassia Bou Copier','Tapichin','tachipinillustrations@gmail.com','{"web":"https://linktr.ee/Tachipinillustrations13","facebook":"https://web.facebook.com/Tachipin/"}','La Serena','Tachipin se enfoca en ilustraciones y proyectos artísticos basados en una estética retro-futurista-surrealista, con inspiración en la animación occidental y oriental, que tratan de apelar al sentimiento de nostalgia, tomando inspiraciones de movimientos estéticos relevantes para las generaciones millennial y Z, reinterpretando personajes ya existentes, y generando historias que reflejan el vacío y la complejidad de las emociones humanas.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:41','tapichin');
INSERT INTO artista VALUES(21,'Saturno','Saturno','saturnooarte@gmail.com','{"instagram":"https://www.instagram.com/sa_tu_rno/"}','Coquimbo','Saturno, soy diseñadora gráfica e ilustradora autodidacta, me caracterizo por utilizar colores muy llamativos en mis ilustraciones y por tener stickers chistosos. También me dedico a crear diseños únicos en cerámica como llaveros, imanes, platos, espejos, ceniceros, figuras, porta velas, entre otros. Trato siempre de tener diseños nuevos y creativos.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:42','saturno');
INSERT INTO artista VALUES(22,'Constanza Toro','Fluchinick','Fluchinick@gmail.com','{"instagram":"https://www.instagram.com/fluchinick/"}','La Serena','Soy Constanza Toro, alias Fluchinick, ilustradora y estudiante de Diseño Digital. Mi trabajo destaca por la representación de animales antropomórficos usando colores saturados, tonos pasteles y destellos vibrantes, fusionando ternura, amor y comedia. Actualmente, exploró el universo Steampunk con mis propios personajes, también expresando mis gustos hacia las caricaturas manteniendo mi estilo.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:43','fluchinick');
INSERT INTO artista VALUES(23,'Noezzal','Noezzal','noezzal@gmail.com','{"instagram":"https://www.instagram.com/noezzal"}','Coquimbo','Mi trabajo se enfoca principalmente al desarrollo de obras ligadas al fan-art de series, animes, películas, videojuegos y gran parte del mundo geek, en general cosas que me gustan y me llaman la atención. Por otra parte, realizo obras que tienen que ver con el surrealismo y con la exploración del sentir humano, siendo un trabajo personal pero a la vez, algo que pueda conectar de forma directa con el espectador.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:43','noezzal');
INSERT INTO artista VALUES(24,'Khyaruu','Khyaruu','khyaruustore@gmail.com','{"web":"https://khyaruu.carrd.co/"}','La Serena','Hola soy Khyaruu, Ilustradora freelancer amante de los conejitos, de todo lo rosita y kawaii. Mi especialidad es la ilustración digital en un estilo chibi, trabajando pedidos de ilustraciones personalizadas, emotes para redes sociales y ahora, finalmente merch!','Chile','2025-12-25 05:11:50','2025-12-26 04:52:44','khyaruu');
INSERT INTO artista VALUES(25,'Alexis Ivan Cepeda Esquivel','Acekuros','Acekuros@gmail.com','{"instagram":"https://Instagram.com/acekuros"}','La Serena','Mi nombre es Alexis Cepeda Esquivel alias Acekuros, me denomino como dibujante de la ciudad de La Serena. En mis obras trato de capturar momentos cotidianos como también destacar la biodiversidad de la región de Coquimbo, me esfuerzo en transmitir historias que conecten con el pasado y el presente, destacando la identidad cultural y el patrimonio natural en mi propio estilo.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:45','acekuros');
INSERT INTO artista VALUES(26,'Nomito','Nomito','Olivaresdafne1@gmail.com','{"instagram":"https://www.instagram.com/_n0mito.art_/"}','La Serena',replace('La mayoría de mi arte solo son dibujos de algun personaje que creo para serie, juego o anime.\nSuelo poner creativo en mis dibujos y experimentar con cosas nuevas en mis ilustraciones \nYa sea luces, sombras o lineart','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:52:45','nomito');
INSERT INTO artista VALUES(27,'Chiimewe','Chiimewe','chiimewe@gmail.com','{"instagram":"https://www.instagram.com/chiimewe?igsh=cG96N2txaWdseGtt"}','Coquimbo','Soy chiimewe, ilustrador de La Serena que se dedica a hacer arte creado a partir de la imaginación e inspirado en lo tierno y lo colorido. Creando personajes y criaturas constantemente usando lo tradicional y lo digital al mismo tiempo.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:46','chiimewe');
INSERT INTO artista VALUES(28,'Yem','Yem','j.n.t.c.200312@gmail.com','{"instagram":"https://www.instagram.com/yem.ito_art?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="}','La Serena','Hola soy Yem, un ilustrador digital, principalmente de personajes originales, aunque también disfruto haciendo fanarts de vez en cuando. Mi objetivo es que mi arte alcance un mayor reconocimiento y conecte con más personas a través de lo que hago.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:47','yem');
INSERT INTO artista VALUES(29,'Skyderen','Skyderen','marcelovergara4507@gmail.com','{"web":"https://linktr.ee/_skyderen"}','La Serena','Hola me presento soy Skyderen mi trabajo consiste en ilustraciones que exploran la creatividad y la imaginación tratando de que la ilustración sea uno lleno de color, textura y emoción. Mi enfoque se centra en el estilo artístico del cartoon, anime, los comics y un poco el de los videojuegos.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:48','skyderen');
INSERT INTO artista VALUES(30,'Ghostie','Ghostie','lcmr.brownstone@gmail.com','{"instagram":"https://www.instagram.com/lc_mr.brownstone?igsh=cjFmaHljbjhlczN4"}','La Serena','Soy Ghostie, un ilustrador que crear fanarts de personajes de Marvel, series icónicas como Hannibal, The Walking Dead y Breaking Bad, así como también de músicos legendarios como The Beatles y Guns N'' Roses. Ofrezco prints, chapitas, stickers y llaveros de mis obras, compartiendo así mi arte con los demás.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:48','ghostie');
INSERT INTO artista VALUES(31,'Camila Guamán','Camila Guaman','camilaguaman.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/camilaguaman.ilustracion","facebook":"https://web.facebook.com/chinchillacosmica/"}','La Serena','Ilustradora naturalista, egresada de arquitectura. Enfoco mi trabajo en la naturaleza, arte y territorio a través de técnicas tradicionales como acuarela, gouache y lápices de colores. Autora del libro "Bitácora: ilustrando la flora en la ciudad" e ilustradora de diversas publicaciones sobre patrimonios, flora y fauna nativa y educación ambiental.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:49','camila-guaman');
INSERT INTO artista VALUES(32,'Liset Retamal','Astro Glitter','astroglitter.studio@gmail.com','{"instagram":"https://www.instagram.com/astro.glitter/"}','La Serena','La ilustración es mi forma de expresar ternura. En mis ilustraciones fusiono mi mundo interno de fantasía con la naturaleza de mi realidad y generalmente creo composiciones que transmiten paz y calma.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:50','astro-glitter');
INSERT INTO artista VALUES(33,'Jorge Diaz Yueng','Niño Pan','elninopan99@gmail.com','{"instagram":"https://www.instagram.com/elninopan","facebook":"https://web.facebook.com/colectivoninopan/"}','La Serena',replace('Me dedico a hacer ilustraciones digitales de cosas que me llamen la atención así como también a hacer comisiones, generalmente ambas comparten temáticas como por ejemplo el medio ambiente, animales y lugares de la ciudad, también de vez en cuando busco plasmar sensaciones y pensamientos a través de viñetas y mas recientemente en animación.\nCómo dibujante quiero lograr hacer trazos mas simples combinados con texturas y colores vibrantes que en conjunto resulten en algo atractivo ^^','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:52:50','nino-pan');
INSERT INTO artista VALUES(34,'Camila Herrera','Camellia Liz','camihlatournerie@gmail.com','{"instagram":"https://www.instagram.com/camellia.liz","facebook":"https://web.facebook.com/camellializ/"}','Coquimbo','Soy ilustradora especializada en técnicas análogas, especialmente acuarela, lápices de color y técnicas mixtas. Los temas centrales de mi trabajo son la fantasía, el realismo mágico, la nostalgia y los cuentos de hadas.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:51','camellia-liz');
INSERT INTO artista VALUES(35,'Alejandra Avilés','Hanrra','hanrra.artwork@gmail.com','{"instagram":"https://www.instagram.com/hanrra.artwork/","facebook":"https://web.facebook.com/hanrraartwork/"}','Coquimbo','Soy Diseñadora Gráfica e ilustradora. En mi trabajo me gusta representar, ya sea por medio de técnicas tradicionales o digitales, escenarios que resaltan elementos de la naturaleza y que estos interactúen a través de mundos oníricos con la imagen, a menudo femenina, que protagoniza la escena.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:52','hanrra');
INSERT INTO artista VALUES(36,'Sakanita','Sakanita','sakanastationery@gmail.com','{"instagram":"https://instagram.com/_sakanita_/"}','Coquimbo','Mi nombre es Daniela y en redes sociales soy Sakanita, tengo mi Tiendita llamada Sakana Papelería. Mis referentes son la naturaleza, los gatitos y halloween. Actualmente mi técnica es digital, dibujo con procreate y los productos de mi tienda van desde stickers a estuches estampados, todo realizado en mi taller.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:52','sakanita');
INSERT INTO artista VALUES(37,'Pablo Araya','Chilensis','Chilensisboy@gmail.com','{"instagram":"https://www.instagram.com/chilensisboy/","facebook":"https://web.facebook.com/chilensisboy/"}','La Serena',replace('Hola soy Pablo, dibujante bajo el nick "chilensis" con más de una década de incursionar en el mundo del arte.\n\nHe enfatizado en crear personajes y cómics originales en un estilo simple y movido,para así también traer una propuesta original a series y juegos populares a través de fanart.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:52:53','chilensis');
INSERT INTO artista VALUES(38,'Alejandro Jorquera','El Ale','creativotrama@gmail.com','{"instagram":"https://www.instagram.com/elale_ilustrador/"}','La Serena','Hola! Soy Alejandro Jorquera, más conocido como el ale ilustrador, Artista gráfico dedicado al diseño e Ilustración de autor, abordo temáticas de naturaleza con características antropomórficas, fusionando lo onírico y lo místico, la vida y la muerte. explorando el camino a través de técnicas de serigrafía, fotografía acuarela y el entintado.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:54','el-ale');
INSERT INTO artista VALUES(39,'Francisco Valdivia Aguirre','Pancho Valdivia','HOMBREMEDIVAL@gmail.com','{"instagram":"https://www.instagram.com/pancho_valdivia/"}','La Serena','Francisco Valdivia Profesor, artista visual sus técnicas preferidas son las acuarelas, gouache, acrílico, lápices de colores y técnica mixta. Sus temas a retratar más recurrentes son: paisaje, animales, flores y criaturas con elementos híbridos (quimeras) en su compasión. Además de darle un halo de mitología, fantasía y','Chile','2025-12-25 05:11:50','2025-12-26 04:52:54','pancho-valdivia');
INSERT INTO artista VALUES(40,'Polet Komiksu','Polet Komiksu','poletcomics@gmail.com','{"instagram":"https://www.instagram.com/poletkomiksu?igsh=MXd1bHdsOTd6YWl4cg=="}','Coquimbo','Ilustradora y Diseñadora. Autora del Manga "La Leyenda del Valle Negro", manga basado en la Leyenda de los Brujos de Salamanca de donde provengo y autora de "Pacita", cómic de humor para mujeres. Mis ilustraciones, mangas y comics están inspirados en mangakas como Junji Ito, Kaori Yuki y Tamayo Akiyama.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:55','polet-komiksu');
INSERT INTO artista VALUES(41,'Diego Maya','Futuro Comics','contactodiegomaya@gmail.com','{"instagram":"http://instagram.com/futurocomics"}','La Serena',replace(replace('Futuro Comics es un sello editorial autogestionado de historietas de aventuras y ciencia\r\nficción creado por el dibujante Diego Maya, nacido originalmente como fanzine a finales de\r\nlos noventa. Desde hace un par de años, con la llegada del autor a la IV Región, se ha\r\nreinventado en un nuevo formato más profesional, que busca acercar la narrativa gráfica al\r\npúblico lector, con un enfoque que busca encantar tanto a los fans veteranos del género,\r\ncomo a nuevas generaciones de comiqueros.','\r',char(13)),'\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:52:56','futuro-comics');
INSERT INTO artista VALUES(42,'Carvajal Ilustraciones','Carvajal Ilustraciones','nacionautonoma@yahoo.es','{"instagram":"https://www.instagram.com/carvajalilustraciones/"}','Coquimbo','Nada me ha motivado más que utilizar las historietas como generadoras de ideas, reflexión y muchas veces hasta de denuncia, sí, porque si bien las historietas basan gran parte de su contenido en entretener, en infinidad de géneros, sin duda no está exenta también  de abrir y expandir la mente para mantenernos atentos e informados, ya que es un arte directo que no da mucho para la imaginación a quien nos lee.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:57','carvajal-ilustraciones');
INSERT INTO artista VALUES(43,'Rodan Castro Muñoz','Rotten Monkey','ro.felipe768@gmail.com','{"instagram":"https://instagram.com/rottenmonkey_inc/","facebook":"https://web.facebook.com/rottenmonkeyinc/"}','Coquimbo','Dibujante de comics, enfocado en el humor gráfico y la narrativa. Entre mi trabajo pueden encontrar viñetas semanales de humor gráfico, con personajes de Godzilla en situaciones del día a día, y comics con historias serializadas o auto concluyentes, que van desde lo personal a lo bizarro.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:57','rotten-monkey');
INSERT INTO artista VALUES(44,'Pía Ahumada','Me Pego Un Tiro','tallermepegountiro@gmail.com','{"instagram":"https://www.instagram.com/mepegountiro?igsh=NW40MW5udWl4OGM0"}','La Serena','Mi nombre es Pía Ahumada y desde 2013 trabajo en Taller Editorial Me pego un tiro, me dedico principalmente a la encuadernación, reparación y publicación; en general me interesa cualquier labor que esté relacionada con libros como objeto o como bien cultural.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:58','me-pego-un-tiro');
INSERT INTO artista VALUES(45,'Fernanda Pérez Pérez','Mami Sita','Mamisitamodeon@gmail.com','{"instagram":"https://Instagram.com/mamisitamodeon"}','La Serena','Soy Mami Sita, artesana serenense y me enfoco principalmente en el arte japonés del amigurumi. Realizo retratos de personajes, artistas y personas, diseñando y elaborando cada proyecto con dedicación, esperando que transmitan alegría, ayudando a conectar con recuerdos significativos.','Chile','2025-12-25 05:11:50','2025-12-26 04:52:59','mami-sita');
INSERT INTO artista VALUES(46,'Pía Fredes','Sra Tonks','nidoodepajaros@gmail.com','{"instagram":"https://www.instagram.com/sratonks/"}','La Serena','Soy Pía, bordadora y collagista desde el año 2020. Comencé a bordar por el deseo que tenía de retratar a mi gatita tonks y hacer collages digitales como hobby, el 2021 decidí abrir @sratonks para mostrar mis bordados y experimentos varios, con el tiempo se transformó en mi trabajo y hoy bordo mascotas a pedido','Chile','2025-12-25 05:11:50','2025-12-26 04:52:59','sra-tonks');
INSERT INTO artista VALUES(47,'Alkimia','Alkimia','Valentinasofiascalderon@gmail.com','{"instagram":"https://www.instagram.com/alkimia.cl?igsh=MW9vZDZhcWs2d3YxbQ=="}','Coquimbo','Alkimia.cl , un espacio para seres mágicos. Joyería artesanal hecha a mano con cristales. Amuletos intencionados que sacan a relucir tu belleza interior, te acompañan y protegen. Boutique de artículos brujiles para usar en el día a día.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:00','alkimia');
INSERT INTO artista VALUES(48,'Jessica Gutierrez Vega','Kao Artwork','Kathykiba@gmail.com','{"instagram":"https://www.instagram.com/kao.art.work/"}','Coquimbo','KaO ArtWork es un espacio de creación que ha evolucionado a lo largo de 10 años. Hoy en día uno oficios y técnicas como joyería, artesanías, pintura y en este último tiempo tatuajes. Tras bambalinas, estoy yo Jessica de profesión Diseñadora, oficio Orfebre y autodidacta en dibujo y pintura y más.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:01','kao-artwork');
INSERT INTO artista VALUES(49,'De Cordillera','De Cordillera','decordillerachile@gmail.com','{"instagram":"https://www.instagram.com/decordillera"}','Coquimbo','Decordillera es un espacio donde creo cuadritos decorativos en madera inspirados en la naturaleza. Utilizando la técnica de corte láser transformo mis ilustraciones en paisajes tridimensionales, fusionando arte, diseño y precisión. Cada pieza está diseñada para aportar profundidad y vida a cualquier espacio, con un toque de naturaleza y color.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:01','de-cordillera');
INSERT INTO artista VALUES(50,'Bolbarán Cómics','Bolbarán Cómics','jose.bolbaran.r@gmail.com','{"instagram":"https://www.instagram.com/jose.bolbaran.r/"}','Ovalle',replace('Ovallino. Psicólogo. Aficionado al animé y los cómics. Desde niño he buscado contar historias con dibujos.\n\nEntiendo el cómic como una herramienta que nos permite entretenernos y aprender. En los últimos años he publicado diversas historietas breves disponibles en mis redes sociales que abordan la fantasía infantil, aventuras educativas y problemáticas de salud mental. Además, realizo charlas y talleres de creación de cómics para niños y jóvenes en diversos establecimientos educacionales.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:02','bolbaran-comics');
INSERT INTO artista VALUES(51,'Pat_trashoart','Pat_trashoart','benjaminurrutiaramos@gmail.com','{"instagram":"https://www.instagram.com/pat_trashoart?igsh=MTZ2b3Q1bDdod2MxeQ=="}','La Serena','¡Hola, soy Pat!, una artista visual chileno que trabaja con técnicas mixtas, fusionando lo digital y lo tradicional, con el propósito de crear ilustraciones que exploran lo lúgubre, lo etéreo y lo nostálgico. Mi obra se inspira profundamente en la estética/cultura goth, las muñecas bjd (ball jointed dolls) y los animes de los 2000.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:03','pat-trashoart');
INSERT INTO artista VALUES(52,'Valeria Venegas Fernández','Blanquis','blanquis.ilustracion@gmail.com','{"instagram":"https://www.instagram.com/blanquis.ilus/","facebook":"https://www.facebook.com/blanquis.ilus/"}','Coquimbo','Hola soy ilustradora, titulada en diseño gráfico. Disfruto dibujar en tradicional jugando entre la fantasía y la realidad con un estilo infantil, siendo las acuarelas, los lápices de colores y mi creatividad el lenguaje que da vida a mis trabajos, donde plasmo momentos de tranquilidad, historias y varios personajes tocados por la magia.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:04','blanquis');
INSERT INTO artista VALUES(53,'Kmilu','Kmilu','camila.inostroza.liebsch@gmail.com','{"instagram":"https://www.instagram.com/kmiluup?igsh=Ym1vbGx3Y3R1ZXNu"}','La Serena','Mi estilo visual se enfoca en los colores vibrantes, es fantasioso y fuertemente influenciado por elementos de cultura pop, anime y fantasía mágica.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:04','kmilu');
INSERT INTO artista VALUES(54,'Chris Olivares','Remebranzas Negras','floresolivarescc@gmail.com','{"instagram":"https://www.instagram.com/remembranzas_negras/"}','La Serena','Chris Olivares, también conocido como Remembranzas negras en rr.ss. es un ilustrador y pintor serense quien aborda con pasión tematicas como melancolía, la nostalgia, el paso del tiempo y los recuerdos que se filtran con el paso de este, a través un lenguaje emotivo pero esperanzador, su técnica de predilección es la acuarela pero tambien trabajando con otros con medios tales como el pastel, carboncillo y programas digitales, sus influencias siempre presentes son el arte clasico, lo religioso, el tenebrismo, la escultura y la figura femenina.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:05','remebranzas-negras');
INSERT INTO artista VALUES(55,'Eve Maluenda','N0tarts','epmg990@gmail.com','{"instagram":"https://www.instagram.com/n0tarts"}','La Serena','Soy Eve Maluenda, Ilustradora de profesion y escritora/poeta autodidacta, autora de Eco Austral y otras historias. n0tarts es mi proyecto de arte, donde mesclo ilustracion digital, pintura tradicional acrilica y mi poesia. Si logro transmitirte algo de lo que quiero expresar con mi trabajo sigueme 🫶','Chile','2025-12-25 05:11:50','2025-12-26 04:53:06','n0tarts');
INSERT INTO artista VALUES(56,'Microbits','Microbits','contacto@fabianvallejos.cl','{"instagram":"https://www.instagram.com/maikurobitto/"}','La Serena','Soy Microbits y hago cosas en 3D. A veces salen personajes tiernos, a veces cosas más darks. No siempre sé bien qué estoy haciendo, pero me gusta el proceso. Me interesa jugar con emociones, lo raro y lo nostálgico, aunque no siempre tenga una idea clara al empezar. A veces solo quiero ver qué sale.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:06','microbits');
INSERT INTO artista VALUES(57,'Bekzar','Bekzar','felipe.becar@mayor.cl','{"instagram":"https://www.instagram.com/bekzar.art/"}','Coquimbo','Soy Bekzar, artista regional que mediante el uso de cultura pop y humor, busca retratar personajes reconocibles y propios en situaciones divertidas y estilo pinup, intentando siempre sacar una sonrisa con ilustraciones atractivas y variadas con un enfoque en los colores y la armonía de fondos en la pieza completa','Chile','2025-12-25 05:11:50','2025-12-26 04:53:07','bekzar');
INSERT INTO artista VALUES(58,'Arcanista draws','Arcanista draws','arcanistadraws@gmail.com','{"instagram":"https://instagram.com/arcanistadraws"}','Ovalle','Hola! Soy Arcanista, Ilustrador, Artista Conceptual y Streamer. Me especializo en arte digital de fantasía, donde exploro mundos mágicos estilizados con un toque colorido, expresivo y lleno de simbología. Mi trabajo fusiona lo espiritual y lo místico con influencias de la cultura pop, el anime y los videojuegos. Realizo comisiones personalizadas, portadas de libros, diseño de personajes, fanarts y arte para desarrollo visual de juegos','Chile','2025-12-25 05:11:50','2025-12-26 04:53:08','arcanista-draws');
INSERT INTO artista VALUES(59,'Francisco Llimy','Francisco Llimy','francisco.llimy@gmail.com','{"instagram":"https://www.instagram.com/francisco.llimy/"}','La Serena','Nació en Coquimbo y creció rodeado de perros hasta alcanzar la mayoría de edad. Sabe leer, escribir y dibujar. Es autor de Seiyam: sangre en la camanchaca. Del resto solo saben sus clientes.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:08','francisco-llimy');
INSERT INTO artista VALUES(60,'JaviiIlustrations','JaviiIlustrations','javieraramirez351@gmail.com','{"instagram":"https://www.instagram.com/javiiilustrations_?igsh=c2p5bnd4bDNkeDdi"}','La Serena','¡Hola! Mi nombre es Javiera, Ilustradora y estudiante actualmente de Arquitectura. Mi trabajo se destaca por ilustrar armaduras y robots, además de ilustraciones detalladas y el uso de colores vibrantes. De manera profesional me dedico al diseño de personajes para clientes de todo el mundo. Tomando desde siempre inspiración en el dibujo japonés, sobre todo estilo kawaii/chibi y estilo de comic como los tomos de Transformers.  ☆','Chile','2025-12-25 05:11:50','2025-12-26 04:53:09','javiiilustrations');
INSERT INTO artista VALUES(61,'Ilustración khasumii','Ilustración khasumii','daniela18042@gmail.com','{"instagram":"https://www.instagram.com/_khasumii_/"}','La Serena','Desarrollo ilustraciones en digital con estilo Anime, especializándome en Lineart, fanart y el Diseño de Personajes, con un enfoque particular en la fantasía. Mi trayectoria como artista autodidacta impulsa un constante perfeccionamiento técnico y narrativo','Chile','2025-12-25 05:11:50','2025-12-26 04:53:10','ilustracion-khasumii');
INSERT INTO artista VALUES(62,'Yatiediciones','Yatiediciones','layatiediciones@gmail.com','{"instagram":"https://www.instagram.com/editorial_yatiediciones"}','Coquimbo',replace('Yatiediciones, es una editorial enfocada en la recopilación, sensibilización y difusión de los pueblos originarios a través de material didáctico, cuadernos de aprendizaje, poesía y narrativa ilustrada. \nLlevamos años como educadores tradicionales de lengua y cultura de los pueblos originarios y desde el 2014, nos hemos reunido bajo el nombre de Yatiediciones, para difundir nuestro trabajo en Chile y el mundo.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:10','yatiediciones');
INSERT INTO artista VALUES(63,'Victoria Rubio','Lesbilais','vicky.rubio@gmail.com','{"instagram":"https://www.instagram.com/lesbilais/"}','Crevillent',replace('Victoria Rubio, conocida como "Lesbilais", es chilena, migrante y autora de cómics como “Lesbilais” (de ahí su apodo) y que tiene una publicación recopilatoria en formato libro. Además cuenta con un segundo libro de cómic publicado, llamado “Loreto poco Hetero” y con un tercer libro realizado a modo de Antología.\nHa viajado mostrando su trabajo en eventos de cómic, como “Viñetas en altura” en La Paz, Bolivia, “Lady’s Comic” en Sao Paulo, Brasil, “Festival de Artes Feministas”, en México, “Vamos las pibas” en Buenos Aires, Argentina y salones del cómics en Valencia y Barcelona. Ha participado de eventos dando charlas sobre cómic hecho por mujeres en diferentes instancias en Chile, Latinoamérica, España y Francia. Ha dado entrevistas para televisión, diarios en Latinoamérica y medios independientes sobre la importancia de ser lesbiana visible y creadora de historietas.\nComo artista de cómics, se le ha considerado como una artista integral, ya que se dedica al guión y al dibujo. Actualmente vive en España, donde ha potenciado su faceta como fanzinera, dedicándose a la autoedición de juegos de cartas y de libros de cómics.','\n',char(10)),'España','2025-12-25 05:11:50','2025-12-26 04:53:11','lesbilais');
INSERT INTO artista VALUES(64,'Maira Alday Villalobos','Myru Ann','myruann@gmail.com','{"instagram":"https://www.instagram.com/myru.ann","facebook":"https://web.facebook.com/myruann/"}','La Serena',replace('¡Hola! Soy Myru Ann.\nMi trabajo se desarrolla principalmente en ilustración digital, aunque también disfruto explorando técnicas tradicionales como los lápices policromos y la pintura. Mi estilo se caracteriza por una estética suave, femenina y simbólica, donde a veces lo tierno combina con lo crudo.\nMe interesa especialmente lo emocional, abordado desde una mirada íntima y personal.\nTambién disfruto mucho hacer retratos por encargo, ya sean de mascotas, parejas o familias en especial en lienzos con óleo :-)','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:12','myru-ann');
INSERT INTO artista VALUES(65,'Pininati','Pininati','nati.macaya@gmail.com','{"instagram":"https://www.instagram.com/pininati/"}','La Serena','Soy Nati y creo figuras de animalillos en arcilla, en pompones de lana, y otros experimentos. Mi inspiración nace de artistas del otro lado del mundo, entre ellos: Trikotri, Viktoria Volcheg y Hashimotomio, échenle un vistazo también! : )','Chile','2025-12-25 05:11:50','2025-12-26 04:53:12','pininati');
INSERT INTO artista VALUES(66,'Flowerspower','Flowerspower','nramirezrivera1@gmail.com','{"instagram":"https://www.instagram.com/el_flowers_power?igsh=MTdpOW12cWtsNXR2bw=="}','Coquimbo','Nicole comenzó desarrollando la técnica del collage con prensado botánico de forma autodidacta, creando diversas obras que permiten la apreciación de la flora en su materialidad y estructura. Actualmente, trabaja la misma materia prima pero explorando la bisutería con resina, creando piezas únicas. Su principal inspiración son las flores y como éstas pueden extender su vida en el tiempo.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:13','flowerspower');
INSERT INTO artista VALUES(67,'Minino_nyart','Minino_nyart','ninoskhalohmayer@gmail.com','{"instagram":"https://www.instagram.com/minino_nyart?igsh=MWM2N3Mybm55ZjRhdA=="}','Coquimbo','Hola, soy Nino, licenciada en Pedagogía en Educación Parvularia e ilustradora autodidacta. Me caracterizo por realizar ilustraciones con colores vibrantes, fanarts expresivos y por mi pasión por dibujar mapaches y gatitos. Desde temprana edad he sentido un profundo amor por explorar el arte y la creatividad. Me gusta expresar en mis ilustraciones una mezcla de lo absurdo, lo tierno y bizarro, dando vida a personajes y escenas que invitan a imaginar, reír o sentir. Hace un tiempo perdí mi cuenta principal de Instagram, pero por suerte logré recuperar "nino_nyart", donde sigo compartiendo todo lo que me inspira. Día a día trabajo para seguir mejorando la composición visual de mis obras y tratar de contar historias con ellas.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:14','minino-nyart');
INSERT INTO artista VALUES(68,'Claudia Lazo Gajardo','Paper pupy','claudialazo.gajardo@gmail.com','{"instagram":"https://www.instagram.com/paperpupy"}','La Serena',replace('¡Hola! Soy Paper Pupy, diseñadora gráfica e ilustradora apasionada por la cultura kawaii de los 90-2000, y el journaling. Mi trabajo se centra principalmente en crear papelería y accesorios que complementan este hobby, inspirando nostalgia y felicidad. \n\nMis ilustraciones, influenciadas por los animes de los 90, personajes de la cultura kawaii y tendencias de moda, fusionan lo nostálgico con un toque actual a través de formas ornamentales, románticas, y colores pasteles.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:14','paper-pupy');
INSERT INTO artista VALUES(69,'Javiera Génesis Gonzalez Trujillo','Peliitos','pelitos.pelitos123@gmail.com','{"instagram":"https://www.instagram.com/_peliitos_"}','La Serena',replace('Ilustradora autodidacta de La Serena\nDe 27 años, Mi estilo se rige por las espontaneidad y momentos de inspiración, me caracterizo mayoritariamente por dibujos digitales, tratando de abarcar diferentes estilo, formas y colores, creación de personajes y de estetica simple y saturado.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:15','peliitos');
INSERT INTO artista VALUES(70,'Planea papeleria','Planea papeleria','rocio.medina.h@gmail.com','{"instagram":"https://www.instagram.com/planeapapeleria/"}','La Serena','Mi nombre es Rocío, realizo encuadernación artesanal clásica, timbres de goma y miniaturas de cuadernos en aros y collares. Considero a mi tienda como un espacio de proteccion y homenaje a este oficio,a lo hecho a mano y a la expresión en papel.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:16','planea-papeleria');
INSERT INTO artista VALUES(71,'Marcelo Tapia','Solid Ediciones','disenorgb@gmail.com','{"instagram":"https://www.instagram.com/solidediciones/","facebook":"https://web.facebook.com/solidediciones"}','La Serena','Solid Ediciones es una editorial sin fines de lucro, que busca difundir el Cómic y a sus autores en la Cuarta Región.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:17','solid-ediciones');
INSERT INTO artista VALUES(72,'Sueño de Pajaro','Sueño de Pajaro','suenodepajaro@gmail.com','{"instagram":"https://www.instagram.com/suenodepajaro/"}','Vicuña',replace('"Sueño de Pájaro" es un taller autogestionado donde experimento con cerámica principalmente. Me inspiro en la alfarería tradicional de los pueblos originarios de América (Abya Yala).\n\nCada pieza busca conectar lo antiguo con lo actual, el espacio interior con algunos elementos de la cultura popular.\n\n“en mi memoria habitan sonidos que intento recrear a través de estos instrumentos de caña y greda"','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:17','sueno-de-pajaro');
INSERT INTO artista VALUES(73,'Tekaeme','Tekaeme','tekaemeilustraciones@gmail.com','{"instagram":"https://www.instagram.com/tekaeme____/"}','Coquimbo',replace('¡Hola! Soy Tekaeme, diseñadora gráfica e ilustradora freelance. Mi trabajo se basa en ilustraciones digitales con un estilo tierno y adorable, fuertemente inspirado en el anime.\nBusco transmitir esa ternura a quienes ven mi arte, y que cada persona sienta alegría al tener una de mis obras.\nTrabajo principalmente con ilustraciones originales, pero también me encanta hacer fanarts de cantantes, animes, series y todo lo que me inspira.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:18','tekaeme');
INSERT INTO artista VALUES(74,'Ruvale','Ruvale','ruvale123@gmail.com','{"instagram":"https://www.instagram.com/ruruvale/"}','La Serena','Hola! Ruvale aquí. Soy estudiante de psicología y me dedico en mi tiempo libre como dibujante digital. Mi arte consiste por sobre todo de personajes originales y fanarts de mis gustos personales. También realizo videos de análisis en Youtube, integrando animaciones cortas hechas por mi e ilustraciones como portadas de los videos.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:19','ruvale');
INSERT INTO artista VALUES(75,'WasabiPNG','WasabiPNG','powerpowmail@gmail.com','{"instagram":"https://www.instagram.com/sgt_wasabi/"}','La Serena',replace('Ilustrador de comics y animador, nacido en Uruguay y viviendo en Chile actualmente. Soy un youtuber de reseñas de videojuegos y otras cosas en el mundo del arte.\nApasionado por lo que hago y muy feliz de compartir mis proyectos con el mundo. Ahora trabajando en mi comic llamado Power Pow.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:19','wasabipng');
INSERT INTO artista VALUES(76,'Ilustravel','Ilustravel','holavelgato@gmail.com','{"instagram":"https://www.instagram.com/bel.ilustravel/"}','La Serena',replace('Aquí Ilustravel! Diseñadora, Ilustradora y escritora diplomada en LIJ. Amante de la literatura y los gatos.\nMi trabajo busca contar historias inspirado en temas patrimoniales y de época. Me enfoco en personajes originales y la creación de mundos donde mezclo lo local con temáticas sobrenaturales más universales.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:20','ilustravel');
INSERT INTO artista VALUES(77,'Intercultural Arte','Intercultural Arte','josecifuentes983@gmail.com','{"instagram":"https://www.instagram.com/intercultural_arte_/"}','La Serena','Intercultural arte es una marca con la que busco identidad local a través de la Ilustración y el oficio de la  serigrafía, retrato el patrimonio natural y cultural del territorio, tanto de la región, nacional y a nivel latinoamericano.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:21','intercultural-arte');
INSERT INTO artista VALUES(78,'Tierramarga','Tierramarga','c.diazt92@gmail.com','{"instagram":"https://www.instagram.com/_tierramarga/"}','La Serena',replace('Soy ilustrador digital y Diseñador Gráfico de la cuenca del Elki.\nMi trabajo se orienta hacia la construcción de escenarios ominosos que integran elementos propios de la fantasía oscura y el surrealismo digital. Opto por una estética de contrastes marcados y formas fluidas que van construyendo parajes desolados y entidades solitarias que se mezclan con lo profundo.\nElijo mantenerme al margen de los elementos totalmente figurativos, ya que valoro que cada persona construya su propia interpretación desde lo que ve.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:22','tierramarga');
INSERT INTO artista VALUES(79,'Ensimismada','Ensimismada','ensimismada00@gmail.com','{"instagram":"https://www.instagram.com/ensimismada.cl/"}','La Serena',replace('Ensimismada es un proyecto de confección y reinvención artesanal de moda y accesorios, nacido desde la introspección del hogar y el amor por lo cotidiano. Trabajamos con telas vintage y prendas reutilizadas para crear piezas únicas, cómodas y llenas de identidad.\n\nLejos de la cultura de lo descartable, cada prenda está hecha para durar y acompañar, como un objeto querido que guarda historia y alma.','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:22','ensimismada');
INSERT INTO artista VALUES(80,'Karen Valenzuela','Prrr Miaow','karenvalen.diseno@gmail.com','{"instagram":"https://www.instagram.com/prrr.miaow?igsh=MTlxdDE4cDZ2aGx1cA==","facebook":"https://web.facebook.com/Prrr-Miaow-179920085887390/"}','La Serena',replace('Hola, soy Prrr Miaow\nLlevo casi un año adentrandome al mundo del pixel art, aunque dibujo ilustración digital desde hace tiempo.\nMis ilustraciónes son mayormente animales, naturaleza y un poco de fanart.\nTengo un estilo soft y tierno, me gusta causar ese "Awww" en las personas, que se lleven un producto mio y mi arte los acompañe','\n',char(10)),'Chile','2025-12-25 05:11:50','2025-12-26 04:53:23','prrr-miaow');
INSERT INTO artista VALUES(81,'Javier Carvajal Ramirez','Javo_Siniestro','javosiniestre@gmail.com','{"instagram":"https://www.instagram.com/javo_siniestro/","facebook":"https://web.facebook.com/siniestre/"}','La Serena','Hola, soy Javo Siniestro: arquitecto, ilustrador y ceramista en proceso. Mi trabajo se basa principalmente en la cultura pop y en elementos del mundo geek. Me gusta usar colores vibrantes y un line art con carácter en mis composiciones. Suelo trabajar en ilustración digital y en acuarela tradicional','Chile','2025-12-25 05:11:50','2025-12-26 04:53:24','javo-siniestro');
INSERT INTO artista VALUES(82,'Coticocodrila','Coticocodrila','Holacoticocodrila@gmail.com','{"instagram":"https://www.instagram.com/coticocodrila/"}','La Serena','Diseñadora y artista de la Región de Coquimbo, crea piezas únicas y originales, utilizando una variedad de materiales y técnicas que dan vida a obras cargadas de color, emoción y simbolismo. Su trabajo se nutre de la psicodelia, el arte intuitivo y un proceso creativo profundamente consciente, donde cada pieza responde a una intención y una historia propia.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:24','coticocodrila');
INSERT INTO artista VALUES(83,'Cat_linaa_art','Cat_linaa_art','och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/cat_linaa_art/"}','La Serena','Ilustradora que fusiona técnicas digitales y tradicionales, especialmente la acuarela. Su estilo combina el anime y el cartoon, creando ilustraciones vibrantes llenas de colores intensos y personajes expresivos, inspirados en la figura humana, la naturaleza, los animales y figuras coleccionables.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:25','cat-linaa-art');
INSERT INTO artista VALUES(84,'Namine Anami','Namine Anami','namineanami@gmail.com','{"instagram":"https://www.instagram.com/namineanami/"}','La Serena','Gusto en conocerte, soy Nami! Creadora de contenido, ilustradora, diseñadora gráfica y textil especializada en peluches. Mi estilo se basa en un lineart grueso chocolate junto con paletas pasteles y saturadas que se asocian con los dulces y la magia. Mis peluches son creados por mis propias manos desde la idea en papel hasta la mano de obra en tela, entregando una identidad y propósito para quien los adopte y les de un bonito hogar.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:26','namine-anami');
INSERT INTO artista VALUES(85,'Cazar al tiburon','Cazar al tiburon','f.zambranoaviles@gmail.com','{"instagram":"https://www.instagram.com/cazaraltiburon.cl/"}','La Serena','Ilustrador, dibujante de cómics y editor en Cazar al Tiburón Editores, su trabajo se ha expuesto en galerías de arte, bibliotecas públicas y otros espacios culturales. En sus ilustraciones de @fabian_ilustrado, los personajes son el alma de escenas que exploran la introspección, la nostalgia y la vulnerabilidad humana. Entre lo real y lo imaginario, sus obras invitan a conectar con emociones universales a través de momentos cotidianos cargados de significado.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:27','cazar-al-tiburon');
INSERT INTO artista VALUES(86,'Tati San Martin','Tati San Martin','tatimartin333@gmail.com','{"instagram":"https://www.instagram.com/tatimartin_artista/"}','La Serena','Escultora y Licenciada en artes plásticas de la Universidad de Chile, autora de cinco libros para la educación artística para niños en la Editorial Voluntad, Colombia, 1997; 1er lugar en Escultura en la V Bienal Internacional de Suba, Bogotá en 2005; profesora de artes para niños, jóvenes y adultos en colegios, centros culturales y municipalidades desde año 2000 a la fecha; exposiciones de escultura y pintura en Bogotá, Miami, Santiago, Puerto Montt, La Serena y Coquimbo.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:28','tati-san-martin');
INSERT INTO artista VALUES(87,'p0chi_kun','p0chi_kun','och8jos.studio@gmail.com','{"instagram":"https://www.instagram.com/p0chi_kun/"}','La Serena','Ilustradora digital que destaca por su estilo anime semirealista. Disfruta crear fanarts, doodles sillies y personajes originales que reflejan sus emociones e intereses, siempre explorando nuevas técnicas para dar vida a sus ideas.','Chile','2025-12-25 05:11:50','2025-12-26 04:53:26','p0chi-kun');
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
CREATE TABLE IF NOT EXISTS evento_edicion_postulacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    pseudonimo TEXT,
    correo TEXT,
    rrss TEXT,
    disciplina_id INTEGER NOT NULL,
    dossier_url TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_postulacion_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_postulacion_disciplina FOREIGN KEY (disciplina_id)
    REFERENCES disciplina (id)
);
CREATE TABLE IF NOT EXISTS agrupacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT
, correo TEXT, created_at TEXT, updated_at TEXT);
INSERT INTO agrupacion VALUES(1,'Ruvale y WasabiPNG',NULL,NULL,'2025-12-25 05:11:50','2025-12-25 05:11:50');
INSERT INTO agrupacion VALUES(2,'Colectivo 8 Ojos','Dos ilustradoras, ocho ojos y un mundo infinito de ideas. Cat_linaa_art y p0chi_kun dibujan desde lo que son: diferentes, intensas y creativas. No creen que todo deba verse igual. Les encanta que sus diferencias se noten y se complementen, creando ilustraciones que pueden ser delicadas, potentes, dulces o explosivas… pero siempre honestas y llenas de vida.','och8jos.studio@gmail.com','2025-12-25 05:11:50','2025-12-25 05:11:50');
CREATE TABLE IF NOT EXISTS agrupacion_miembro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agrupacion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    evento_edicion_id INTEGER NOT NULL, created_at TEXT, updated_at TEXT,
    CONSTRAINT fk_agrupacion_miembro_agrupacion FOREIGN KEY (agrupacion_id)
    REFERENCES agrupacion (id) ON DELETE CASCADE,
    CONSTRAINT fk_agrupacion_miembro_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT fk_agrupacion_miembro_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT uq_agrupacion_miembro UNIQUE (artista_id, evento_edicion_id)
);
CREATE TABLE IF NOT EXISTS evento_edicion_participante (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_id INTEGER NOT NULL,
    disciplina_id INTEGER NOT NULL,
    agrupacion_id INTEGER,
    estado TEXT NOT NULL,
    notas TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_participante_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_artista FOREIGN KEY (artista_id)
    REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT fk_participante_disciplina FOREIGN KEY (disciplina_id)
    REFERENCES disciplina (id),
    CONSTRAINT fk_participante_agrupacion FOREIGN KEY (agrupacion_id)
    REFERENCES agrupacion (id),
    CONSTRAINT uq_participante UNIQUE (artista_id, evento_edicion_id),
    CONSTRAINT chk_evento_edicion_participante_estado CHECK (
        estado IN ('postulado', 'seleccionado', 'confirmado', 'rechazado', 'cancelado')
    )
);
INSERT INTO evento_edicion_participante VALUES(1,8,1,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(2,9,1,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(3,10,1,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(4,10,2,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(5,5,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(6,6,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(7,7,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(8,8,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(9,9,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(10,10,6,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(11,4,7,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(12,5,7,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(13,6,7,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(14,7,7,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(15,8,9,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(16,3,10,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(17,4,10,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(18,6,10,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(19,10,13,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(20,8,17,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(21,9,17,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(22,10,17,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(23,5,20,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(24,8,20,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(25,1,31,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(26,2,31,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(27,3,31,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(28,1,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(29,2,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(30,5,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(31,6,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(32,7,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(33,8,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(34,9,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(35,10,32,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(36,1,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(37,2,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(38,3,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:55','2025-12-25 19:41:55');
INSERT INTO evento_edicion_participante VALUES(39,4,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(40,5,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(41,6,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(42,9,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(43,10,33,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(44,4,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(45,5,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(46,6,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(47,7,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(48,8,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(49,9,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(50,10,34,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(51,3,35,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(52,9,35,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(53,1,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(54,2,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(55,3,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(56,4,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(57,5,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(58,8,37,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(59,5,39,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(60,4,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(61,6,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(62,7,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(63,8,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(64,9,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(65,10,43,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(66,3,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(67,4,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(68,5,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(69,7,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(70,9,52,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(71,6,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(72,7,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(73,8,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(74,9,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(75,10,64,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(76,7,68,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(77,8,68,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(78,9,69,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(79,10,69,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(80,1,71,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(81,4,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(82,5,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(83,6,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(84,7,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(85,10,80,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(86,1,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(87,2,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(88,3,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(89,5,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(90,7,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(91,8,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:56','2025-12-25 19:41:56');
INSERT INTO evento_edicion_participante VALUES(92,10,81,1,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(93,9,45,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(94,8,48,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
INSERT INTO evento_edicion_participante VALUES(95,10,48,3,NULL,'confirmado',NULL,'2025-12-25 19:41:57','2025-12-25 19:41:57');
CREATE TABLE IF NOT EXISTS artista_invitado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    correo TEXT,
    rrss TEXT
, created_at TEXT, updated_at TEXT);
INSERT INTO artista_invitado VALUES(1,'Gabriel Garvo',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(2,'Takamo',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(3,'Satin',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(4,'CaroCelis',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(5,'Sephko',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(6,'Papafritologia',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(7,'Juanca Cortes',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(8,'Nico Gonzales',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(9,'Rayaismo',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(10,'Pablo Delcielo',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(11,'Godersi',NULL,NULL,'2025-12-25 19:14:19','2025-12-25 19:14:19');
INSERT INTO artista_invitado VALUES(12,'Emisario de Greda',NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista_invitado VALUES(13,'Fakuta',NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista_invitado VALUES(14,'A Veces Amanda',NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista_invitado VALUES(15,'El Comodo Silencio de los que Hablan Poco',NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
INSERT INTO artista_invitado VALUES(16,'Los Animales Tambien Se Suicidan',NULL,NULL,'2025-12-25 19:14:20','2025-12-25 19:14:20');
CREATE TABLE IF NOT EXISTS evento_edicion_invitado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento_edicion_id INTEGER NOT NULL,
    artista_invitado_id INTEGER NOT NULL,
    rol TEXT NOT NULL,
    notas TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invitado_evento_edicion FOREIGN KEY (evento_edicion_id)
    REFERENCES evento_edicion (id) ON DELETE CASCADE,
    CONSTRAINT fk_invitado_artista FOREIGN KEY (artista_invitado_id)
    REFERENCES artista_invitado (id) ON DELETE CASCADE,
    CONSTRAINT chk_evento_edicion_invitado_rol CHECK (LENGTH(TRIM(rol)) > 0)
);
INSERT INTO evento_edicion_invitado VALUES(1,5,1,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(2,5,2,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(3,5,13,'musico',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(4,6,3,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(5,6,14,'musico',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(6,7,4,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(7,8,5,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(8,8,6,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(9,8,7,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(10,8,15,'musico',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(11,9,8,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(12,9,9,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(13,10,10,'ilustrador',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(14,10,11,'charlista',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(15,10,16,'musico',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
INSERT INTO evento_edicion_invitado VALUES(16,3,12,'musico',NULL,'2025-12-25 19:14:36','2025-12-25 19:14:36');
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
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_catalogo_artista FOREIGN KEY (artista_id)
        REFERENCES artista (id) ON DELETE CASCADE,
    CONSTRAINT chk_catalogo_artista_destacado CHECK (destacado IN (0, 1)),
    CONSTRAINT chk_catalogo_artista_activo CHECK (activo IN (0, 1))
);
INSERT INTO catalogo_artista VALUES(1,1,'a0',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(2,2,'a1',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(3,3,'a2',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(4,4,'a3',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(5,5,'a4',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(6,6,'a5',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(7,7,'a6',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(8,8,'a7',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(9,9,'a8',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(10,10,'a9',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(11,11,'aA',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(12,12,'aB',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(13,13,'aC',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(14,14,'aD',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(15,15,'aE',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(16,16,'aF',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(17,17,'aG',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(18,18,'aH',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(19,19,'aI',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(20,20,'aJ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(21,21,'aK',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(22,22,'aL',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(23,23,'aM',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(24,24,'aN',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(25,25,'aO',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(26,26,'aP',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(27,27,'aQ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(28,28,'aR',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(29,29,'aS',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(30,30,'aT',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(31,31,'aU',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(32,32,'aV',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(33,33,'aW',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(34,34,'aX',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(35,35,'aY',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(36,36,'aZ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(37,37,'b0',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(38,38,'b1',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(39,39,'b2',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(40,40,'b3',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(41,41,'b4',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(42,42,'b5',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(43,43,'b6',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(44,44,'b7',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(45,45,'b8',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(46,46,'b9',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(47,47,'bA',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(48,48,'bB',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(49,49,'bC',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(50,50,'bD',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(51,51,'bE',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(52,52,'bF',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(53,53,'bG',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(54,54,'bH',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(55,55,'bI',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(56,56,'bJ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(57,57,'bK',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(58,58,'bL',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(59,59,'bM',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(60,60,'bN',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(61,61,'bO',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(62,62,'bP',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(63,63,'bQ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(64,64,'bR',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(65,65,'bS',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(66,66,'bT',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(67,67,'bU',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(68,68,'bV',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(69,69,'bW',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(70,70,'bX',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(71,71,'bY',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(72,72,'bZ',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(73,73,'c0',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(74,74,'c1',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(75,75,'c2',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(76,76,'c3',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(77,77,'c4',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(78,78,'c5',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(79,79,'c6',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(80,80,'c7',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(81,81,'c8',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(82,82,'c9',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(83,83,'cA',0,1,'2025-12-26 20:07:29','2025-12-26 20:07:29');
INSERT INTO catalogo_artista VALUES(84,84,'cC',0,1,'2025-12-26 20:07:29','2025-12-26 20:08:10');
INSERT INTO catalogo_artista VALUES(85,85,'cD',0,1,'2025-12-26 20:07:29','2025-12-26 20:08:10');
INSERT INTO catalogo_artista VALUES(86,86,'cE',0,1,'2025-12-26 20:07:29','2025-12-26 20:08:10');
INSERT INTO catalogo_artista VALUES(87,87,'cB',0,1,'2025-12-26 20:07:29','2025-12-26 20:08:10');
CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(255) NOT NULL PRIMARY KEY);
INSERT INTO schema_migrations VALUES('20251226000001');
INSERT INTO schema_migrations VALUES('20251226000002');
INSERT INTO schema_migrations VALUES('20251226000003');
INSERT INTO schema_migrations VALUES('20251226000004');
INSERT INTO schema_migrations VALUES('20251226000005');
CREATE TABLE IF NOT EXISTS artista_historial (id INTEGER PRIMARY KEY AUTOINCREMENT, artista_id INTEGER NOT NULL, pseudonimo TEXT, correo TEXT, rrss TEXT, ciudad TEXT, pais TEXT, orden INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, notas TEXT, CONSTRAINT fk_artista_historial_artista FOREIGN KEY (artista_id) REFERENCES artista (id) ON DELETE CASCADE, CONSTRAINT uq_artista_historial_orden UNIQUE (artista_id, orden), CONSTRAINT chk_artista_historial_orden CHECK (orden > 0), CONSTRAINT chk_artista_historial_has_data CHECK (pseudonimo IS NOT NULL OR correo IS NOT NULL OR rrss IS NOT NULL OR ciudad IS NOT NULL OR pais IS NOT NULL));
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('disciplina',4);
INSERT INTO sqlite_sequence VALUES('artista',87);
INSERT INTO sqlite_sequence VALUES('agrupacion',2);
INSERT INTO sqlite_sequence VALUES('organizacion',1);
INSERT INTO sqlite_sequence VALUES('evento',2);
INSERT INTO sqlite_sequence VALUES('evento_edicion',13);
INSERT INTO sqlite_sequence VALUES('evento_edicion_dia',18);
INSERT INTO sqlite_sequence VALUES('evento_edicion_metrica',30);
INSERT INTO sqlite_sequence VALUES('artista_invitado',16);
INSERT INTO sqlite_sequence VALUES('evento_edicion_invitado',16);
INSERT INTO sqlite_sequence VALUES('evento_edicion_participante',95);
INSERT INTO sqlite_sequence VALUES('artista_imagen',87);
INSERT INTO sqlite_sequence VALUES('lugar',3);
INSERT INTO sqlite_sequence VALUES('catalogo_artista',87);
CREATE INDEX idx_participante_evento_edicion
ON evento_edicion_participante (evento_edicion_id);
CREATE INDEX idx_participante_artista
ON evento_edicion_participante (artista_id);
CREATE INDEX idx_participante_estado
ON evento_edicion_participante (estado);
CREATE INDEX idx_agrupacion_miembro_evento_edicion
ON agrupacion_miembro (evento_edicion_id);
CREATE INDEX idx_agrupacion_miembro_agrupacion
ON agrupacion_miembro (agrupacion_id);
CREATE INDEX idx_evento_edicion_invitado_evento_edicion
ON evento_edicion_invitado (evento_edicion_id);
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
CREATE TRIGGER trg_evento_edicion_invitado_updated_at
AFTER UPDATE ON evento_edicion_invitado
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_invitado SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_evento_edicion_participante_updated_at
AFTER UPDATE ON evento_edicion_participante
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_participante SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_evento_edicion_postulacion_updated_at
AFTER UPDATE ON evento_edicion_postulacion
FOR EACH ROW
BEGIN
    UPDATE evento_edicion_postulacion SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
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
CREATE TRIGGER trg_artista_updated_at
AFTER UPDATE ON artista
FOR EACH ROW
BEGIN
    UPDATE artista SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_artista_created_at
AFTER INSERT ON artista
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
CREATE TRIGGER trg_artista_invitado_updated_at
AFTER UPDATE ON artista_invitado
FOR EACH ROW
BEGIN
    UPDATE artista_invitado SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_artista_invitado_created_at
AFTER INSERT ON artista_invitado
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE artista_invitado SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
CREATE TRIGGER trg_agrupacion_miembro_updated_at
AFTER UPDATE ON agrupacion_miembro
FOR EACH ROW
BEGIN
    UPDATE agrupacion_miembro SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
CREATE TRIGGER trg_agrupacion_miembro_created_at
AFTER INSERT ON agrupacion_miembro
FOR EACH ROW
WHEN NEW.created_at IS NULL
BEGIN
    UPDATE agrupacion_miembro SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
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
CREATE UNIQUE INDEX idx_artista_slug ON artista(slug);
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
COMMIT;
