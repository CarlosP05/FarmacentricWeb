# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.declarative import declarative_base

# Aquí configuramos la cadena de conexión a tu SQL Server
# Formato: mssql+pyodbc://USUARIO:CONTRASEÑA@SERVIDOR/BASE_DE_DATOS?driver=...

# Ejemplo usando Autenticación de Windows (Sin contraseña):
SERVER = "CARLOS_PALMA\MSSQLSERVER1" # O el nombre de tu instancia, ej: "localhost\\SQLEXPRESS"
DATABASE = "FarmacentricDB" # Cambia esto por el nombre exacto de tu BD
DRIVER = "ODBC Driver 17 for SQL Server"

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc://@{SERVER}/{DATABASE}?driver={DRIVER}&Trusted_Connection=yes"

# Crear el motor de conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear la sesión para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para nuestros modelos (tablas)
Base = declarative_base()

# Dependencia para inyectar la sesión en nuestras rutas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()