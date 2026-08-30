from datetime import datetime
from database import Base
# pyrefly: ignore [missing-import]
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    Numeric,
    String,
)
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import relationship

# 1. ROLES
class Rol(Base):
    __tablename__ = "Roles"

    RolID = Column(Integer, primary_key=True, index=True)
    NombreRol = Column(String(50), unique=True, nullable=False)
    Descripcion = Column(String(200), nullable=True)

    usuarios = relationship("Usuario", back_populates="rol")

# 2. USUARIOS
class Usuario(Base):
    __tablename__ = "Usuarios"

    UsuarioID = Column(Integer, primary_key=True, index=True)
    NombreUsuario = Column(String(50), unique=True, nullable=False)
    ContrasenaHash = Column(LargeBinary(length=256), nullable=False)
    RolID = Column(Integer, ForeignKey("Roles.RolID"), nullable=False)
    Activo = Column(Boolean, default=True, nullable=False)
    FechaCreacion = Column(DateTime, default=datetime.now, nullable=False)
    UltimoAcceso = Column(DateTime, nullable=True)

    rol = relationship("Rol", back_populates="usuarios")

# 3. PROVEEDORES
class Proveedor(Base):
    __tablename__ = "Proveedores"

    ProveedorID = Column(Integer, primary_key=True, index=True)
    NombreEmpresa = Column(String(100), nullable=False)
    Contacto = Column(String(80), nullable=True)
    Telefono = Column(String(20), nullable=True)
    Correo = Column(String(100), nullable=True)
    Direccion = Column(String(150), nullable=True)

    productos = relationship("Producto", back_populates="proveedor")

# 4. CATEGORIAS
class Categoria(Base):
    __tablename__ = "CategoriasProducto"

    CategoriaID = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(60), unique=True, nullable=False)
    RequiereReceta = Column(Boolean, default=False, nullable=False)

    productos = relationship("Producto", back_populates="categoria")

# 5. PRODUCTOS
class Producto(Base):
    __tablename__ = "Productos"

    ProductoID = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(120), nullable=False)
    CategoriaID = Column(Integer, ForeignKey("CategoriasProducto.CategoriaID"), nullable=False)
    ProveedorID = Column(Integer, ForeignKey("Proveedores.ProveedorID"), nullable=False)
    PrecioCompra = Column(Numeric(10, 2), nullable=False)
    PrecioVenta = Column(Numeric(10, 2), nullable=False)
    StockMinimo = Column(Integer, default=10, nullable=False)
    EsControlado = Column(Boolean, default=False, nullable=False)
    UnidadMedida = Column(String(20), default="Unidad", nullable=False)
    Activo = Column(Boolean, default=True, nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    proveedor = relationship("Proveedor", back_populates="productos")
    lotes = relationship("Lote", back_populates="producto")

# 6. LOTES
class Lote(Base):
    __tablename__ = "Lotes"

    LoteID = Column(Integer, primary_key=True, index=True)
    ProductoID = Column(Integer, ForeignKey("Productos.ProductoID"), nullable=False)
    NumeroLote = Column(String(40), nullable=False)
    FechaFabricacion = Column(Date, nullable=False)
    FechaVencimiento = Column(Date, nullable=False)
    CantidadInicial = Column(Integer, nullable=False)
    CantidadActual = Column(Integer, nullable=False)
    FechaIngreso = Column(DateTime, default=datetime.now, nullable=False)

    producto = relationship("Producto", back_populates="lotes")

# 7. VENTAS
class Venta(Base):
    __tablename__ = "Ventas"

    VentaID = Column(Integer, primary_key=True, index=True)
    UsuarioID = Column(Integer, ForeignKey("Usuarios.UsuarioID"), nullable=False)
    FechaVenta = Column(DateTime, default=datetime.now, nullable=False)
    Total = Column(Numeric(10, 2), default=0, nullable=False)
    MetodoPago = Column(String(20), nullable=False)

    usuario = relationship("Usuario")
    detalles = relationship("DetalleVenta", back_populates="venta")

# 8. DETALLE VENTAS
class DetalleVenta(Base):
    __tablename__ = "DetalleVentas"

    DetalleVentaID = Column(Integer, primary_key=True, index=True)
    VentaID = Column(Integer, ForeignKey("Ventas.VentaID"), nullable=False)
    ProductoID = Column(Integer, ForeignKey("Productos.ProductoID"), nullable=False)
    LoteID = Column(Integer, ForeignKey("Lotes.LoteID"), nullable=False)
    Cantidad = Column(Integer, nullable=False)
    PrecioUnitario = Column(Numeric(10, 2), nullable=False)

    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto")
    lote = relationship("Lote")

# 9. EMPLEADOS
class Empleado(Base):
    __tablename__ = "Empleados"

    EmpleadoID = Column(Integer, primary_key=True, index=True)
    UsuarioID = Column(Integer, ForeignKey("Usuarios.UsuarioID"), unique=True, nullable=False)
    Nombre = Column(String(80), nullable=False)
    Apellido = Column(String(80), nullable=False)
    Cedula = Column(String(20), unique=True, nullable=False)
    Puesto = Column(String(60), nullable=False)
    FechaContratacion = Column(Date, nullable=False)
    SalarioBase = Column(Numeric(10, 2), nullable=False)
    Activo = Column(Boolean, default=True, nullable=False)

    usuario = relationship("Usuario")

# 10. GASTOS OPERATIVOS
class GastoOperativo(Base):
    __tablename__ = "GastosOperativos"

    GastoID = Column(Integer, primary_key=True, index=True)
    Concepto = Column(String(150), nullable=False)
    Monto = Column(Numeric(10, 2), nullable=False)
    Categoria = Column(String(50), nullable=False)
    FechaGasto = Column(Date, nullable=False)
    RegistradoPor = Column(Integer, ForeignKey("Usuarios.UsuarioID"), nullable=False)

    usuario = relationship("Usuario")