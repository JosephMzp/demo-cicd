-- Se ejecuta UNA sola vez: la primera vez que Postgres arranca con el volumen vacío.
-- La base de datos en sí NO se crea aquí: la crea la imagen oficial a partir de la
-- variable de entorno POSTGRES_DB. Este script corre ya conectado a esa base.

CREATE TABLE IF NOT EXISTS mensajes (
    id       SERIAL       PRIMARY KEY,
    nombre   VARCHAR(60)  NOT NULL CHECK (char_length(trim(nombre))  > 0),
    mensaje  VARCHAR(280) NOT NULL CHECK (char_length(trim(mensaje)) > 0),
    fecha    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- La API siempre lista del más reciente al más antiguo.
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes (fecha DESC);
