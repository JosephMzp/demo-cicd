-- Dos mensajes para que el libro de visitas no arranque vacío.
INSERT INTO mensajes (nombre, mensaje) VALUES
    ('Docente IF-1116', 'Si lees esto, tu base de datos se inicializó bien.'),
    ('Postgres',        'Estos datos viven en un volumen: sobreviven a docker compose down.');
