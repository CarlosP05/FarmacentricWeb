import hashlib
from datetime import date
from typing import List, Optional

from database import get_db
# pyrefly: ignore [missing-import]
from fastapi import Depends, FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from models import (
    Categoria,
    DetalleVenta,
    Empleado,
    GastoOperativo,
    Lote,
    Producto,
    Proveedor,
    Rol,
    Usuario,
    Venta,
)
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from sqlalchemy import text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import func

app = FastAPI(title="Farmacentric API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODELOS PYDANTIC (Esquemas de Entrada)
# ==========================================

class LoginRequest(BaseModel):
    nombre_usuario: str
    contrasena: str

class ItemVenta(BaseModel):
    lote_id: int
    cantidad: int

class NuevaVentaRequest(BaseModel):
    usuario_id: int
    metodo_pago: str
    detalles: List[ItemVenta]

class NuevoIngresoRequest(BaseModel):
    producto_id: int
    numero_lote: str
    fecha_fabricacion: date
    fecha_vencimiento: date
    cantidad: int

class NuevoEmpleadoRequest(BaseModel):
    usuario_id: int
    nombre: str
    apellido: str
    cedula: str
    puesto: str
    fecha_contratacion: date
    salario_base: float

class GastoCreate(BaseModel):
    concepto: str
    monto: float
    categoria: str
    fecha_gasto: date
    registrado_por: int


# ==========================================
# RUTAS BÁSICAS Y PRUEBAS
# ==========================================

@app.get("/")
def read_root():
    return {"mensaje": "API de FarmacentricApp funcionando desde cero"}

@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        resultado = db.execute(text("SELECT @@VERSION")).scalar()
        return {"estado": "¡Conexión exitosa!", "version_sql": resultado}
    except Exception as e:
        return {"estado": "Error al conectar", "detalle": str(e)}


# ==========================================
# RUTAS DE USUARIOS Y AUTENTICACIÓN
# ==========================================

@app.get("/usuarios")
def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios_db = db.query(Usuario).all()
    lista_usuarios = []
    for u in usuarios_db:
        lista_usuarios.append({
            "UsuarioID": u.UsuarioID,
            "NombreUsuario": u.NombreUsuario,
            "Rol": u.rol.NombreRol,
            "Activo": u.Activo
        })
    return lista_usuarios

@app.post("/login")
def iniciar_sesion(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.NombreUsuario == datos.nombre_usuario).first()

    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if not usuario_db.Activo:
        raise HTTPException(status_code=403, detail="El usuario está inactivo")

    contrasena_ingresada_hash = hashlib.sha256(datos.contrasena.encode("utf-8")).digest()

    if contrasena_ingresada_hash == usuario_db.ContrasenaHash:
        return {
            "exito": True,
            "mensaje": f"Bienvenido a Farmacentric, {usuario_db.NombreUsuario}",
            "usuario": {
                "id": usuario_db.UsuarioID,
                "nombre_usuario": usuario_db.NombreUsuario,
                "rol": usuario_db.rol.NombreRol
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

# ==========================================
# RUTAS DE CATÁLOGO (CATEGORÍAS Y PROVEEDORES)
# ==========================================

class NuevoProductoRequest(BaseModel):
    nombre: str
    categoria_id: int
    proveedor_id: int
    precio_compra: float
    precio_venta: float
    stock_minimo: int
    es_controlado: bool
    unidad_medida: str

@app.get("/categorias")
def obtener_categorias(db: Session = Depends(get_db)):
    categorias_db = db.query(Categoria).all()
    return [{"CategoriaID": c.CategoriaID, "Nombre": c.Nombre} for c in categorias_db]

@app.get("/proveedores")
def obtener_proveedores(db: Session = Depends(get_db)):
    proveedores_db = db.query(Proveedor).all()
    return [{"ProveedorID": p.ProveedorID, "NombreEmpresa": p.NombreEmpresa} for p in proveedores_db]

@app.post("/productos-catalogo")
def crear_nuevo_producto(datos: NuevoProductoRequest, db: Session = Depends(get_db)):
    nuevo_producto = Producto(
        Nombre=datos.nombre,
        CategoriaID=datos.categoria_id,
        ProveedorID=datos.proveedor_id,
        PrecioCompra=datos.precio_compra,
        PrecioVenta=datos.precio_venta,
        StockMinimo=datos.stock_minimo,
        EsControlado=datos.es_controlado,
        UnidadMedida=datos.unidad_medida,
        Activo=True
    )
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    
    return {
        "exito": True, 
        "mensaje": f"Producto '{datos.nombre}' agregado al catálogo exitosamente."
    }

# ==========================================
# RUTAS DE PRODUCTOS E INVENTARIO
# ==========================================

@app.get("/productos")
def obtener_productos(db: Session = Depends(get_db)):
    productos_db = db.query(Producto).all()
    lista_productos = []
    for p in productos_db:
        lista_productos.append({
            "ProductoID": p.ProductoID,
            "Nombre": p.Nombre,
            "Categoria": p.categoria.Nombre,
            "RequiereReceta": p.categoria.RequiereReceta,
            "Proveedor": p.proveedor.NombreEmpresa,
            "PrecioVenta": float(p.PrecioVenta),
            "StockMinimo": p.StockMinimo,
            "EsControlado": p.EsControlado,
            "Activo": p.Activo
        })
    return lista_productos

@app.get("/inventario")
def obtener_inventario_real(db: Session = Depends(get_db)):
    lotes_db = db.query(Lote).all()
    lista_inventario = []
    for lote in lotes_db:
        stock_critico = lote.CantidadActual <= lote.producto.StockMinimo
        lista_inventario.append({
            "LoteID": lote.LoteID,
            "Producto": lote.producto.Nombre,
            "NumeroLote": lote.NumeroLote,
            "FechaVencimiento": lote.FechaVencimiento,
            "CantidadActual": lote.CantidadActual,
            "StockMinimo": lote.producto.StockMinimo,
            "EsControlado": lote.producto.EsControlado,
            "AlertaStock": stock_critico
        })
    return lista_inventario

@app.post("/ingresos")
def registrar_ingreso_lote(datos: NuevoIngresoRequest, db: Session = Depends(get_db)):
    producto_db = db.query(Producto).filter(Producto.ProductoID == datos.producto_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="El Producto especificado no existe en el catálogo")

    nuevo_lote = Lote(
        ProductoID=datos.producto_id,
        NumeroLote=datos.numero_lote,
        FechaFabricacion=datos.fecha_fabricacion,
        FechaVencimiento=datos.fecha_vencimiento,
        CantidadInicial=datos.cantidad,
        CantidadActual=datos.cantidad
    )
    db.add(nuevo_lote)
    db.commit()
    db.refresh(nuevo_lote)

    return {
        "exito": True,
        "mensaje": f"Se ingresaron {datos.cantidad} unidades de '{producto_db.Nombre}' al inventario exitosamente.",
        "lote_generado_id": nuevo_lote.LoteID
    }


# ==========================================
# RUTAS DE VENTAS (POS)
# ==========================================

@app.post("/ventas")
def registrar_venta(datos: NuevaVentaRequest, db: Session = Depends(get_db)):
    nueva_venta = Venta(
        UsuarioID=datos.usuario_id,
        MetodoPago=datos.metodo_pago,
        Total=0
    )
    db.add(nueva_venta)
    db.flush()

    total_venta = 0
    for item in datos.detalles:
        lote_db = db.query(Lote).filter(Lote.LoteID == item.lote_id).first()
        if not lote_db:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"El Lote {item.lote_id} no existe")

        if lote_db.CantidadActual < item.cantidad:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {lote_db.producto.Nombre}. Solo hay {lote_db.CantidadActual} disponibles.")

        lote_db.CantidadActual -= item.cantidad
        precio = lote_db.producto.PrecioVenta
        subtotal = precio * item.cantidad
        total_venta += subtotal

        nuevo_detalle = DetalleVenta(
            VentaID=nueva_venta.VentaID,
            ProductoID=lote_db.ProductoID,
            LoteID=lote_db.LoteID,
            Cantidad=item.cantidad,
            PrecioUnitario=precio
        )
        db.add(nuevo_detalle)

    nueva_venta.Total = total_venta
    db.commit()

    return {
        "exito": True,
        "mensaje": "Venta registrada con éxito",
        "venta_id": nueva_venta.VentaID,
        "total_cobrado": float(total_venta)
    }


# ==========================================
# RUTAS DE RECURSOS HUMANOS
# ==========================================

@app.get("/empleados")
def obtener_empleados(db: Session = Depends(get_db)):
    empleados_db = db.query(Empleado).all()
    lista_empleados = []
    for emp in empleados_db:
        lista_empleados.append({
            "EmpleadoID": emp.EmpleadoID,
            "Nombre": emp.Nombre,
            "Apellido": emp.Apellido,
            "NombreCompleto": f"{emp.Nombre} {emp.Apellido}",
            "Cedula": emp.Cedula,
            "Puesto": emp.Puesto,
            "SalarioBase": float(emp.SalarioBase),
            "FechaContratacion": emp.FechaContratacion,
            "Activo": emp.Activo,
            "UsuarioSistema": emp.usuario.NombreUsuario if emp.usuario else "Sin acceso"
        })
    return lista_empleados

@app.post("/empleados")
def registrar_empleado(datos: NuevoEmpleadoRequest, db: Session = Depends(get_db)):
    if db.query(Empleado).filter(Empleado.Cedula == datos.cedula).first():
        raise HTTPException(status_code=400, detail="Ya existe un empleado con esta cédula")

    nuevo_empleado = Empleado(
        UsuarioID=datos.usuario_id,
        Nombre=datos.nombre,
        Apellido=datos.apellido,
        Cedula=datos.cedula,
        Puesto=datos.puesto,
        FechaContratacion=datos.fecha_contratacion,
        SalarioBase=datos.salario_base,
        Activo=True
    )
    db.add(nuevo_empleado)
    db.commit()

    return {"exito": True, "mensaje": "Empleado registrado correctamente en la planilla."}


# ==========================================
# RUTAS DE FINANZAS Y GASTOS
# ==========================================

@app.get("/gastos")
def obtener_gastos(db: Session = Depends(get_db)):
    gastos_db = db.query(GastoOperativo).order_by(GastoOperativo.FechaGasto.desc()).all()
    lista_gastos = []
    for g in gastos_db:
        lista_gastos.append({
            "GastoID": g.GastoID,
            "Concepto": g.Concepto,
            "Monto": float(g.Monto),
            "Categoria": g.Categoria,
            "FechaGasto": str(g.FechaGasto),
            "RegistradoPor": g.RegistradoPor
        })
    return lista_gastos

@app.post("/gastos")
def registrar_gasto(gasto: GastoCreate, db: Session = Depends(get_db)):
    nuevo_gasto = GastoOperativo(
        Concepto=gasto.concepto,
        Monto=gasto.monto,
        Categoria=gasto.categoria,
        FechaGasto=gasto.fecha_gasto,
        RegistradoPor=gasto.registrado_por
    )
    db.add(nuevo_gasto)
    db.commit()
    return {"exito": True, "mensaje": "Gasto registrado exitosamente en contabilidad."}

# ==========================================
# RUTAS DE REPORTES GERENCIALES (SOLO ADMIN)
# ==========================================
@app.get("/reportes/estado-resultados")
def estado_de_resultados(db: Session = Depends(get_db)):
    # 1. Total de Ingresos (Suma de todas las ventas)
    ingresos = db.query(func.sum(Venta.Total)).scalar() or 0
    
    # 2. Costo de Ventas (Cantidad vendida * Precio de Compra original)
    costo_ventas = db.query(
        func.sum(DetalleVenta.Cantidad * Producto.PrecioCompra)
    ).join(Producto, DetalleVenta.ProductoID == Producto.ProductoID).scalar() or 0
    
    # 3. Gastos Operativos (Caja chica, nómina, servicios)
    gastos_operativos = db.query(func.sum(GastoOperativo.Monto)).scalar() or 0
    
    # Cálculos financieros
    ganancia_bruta = ingresos - costo_ventas
    ganancia_neta = ganancia_bruta - gastos_operativos
    
    return {
        "ingresos": float(ingresos),
        "costo_ventas": float(costo_ventas),
        "ganancia_bruta": float(ganancia_bruta),
        "gastos_operativos": float(gastos_operativos),
        "ganancia_neta": float(ganancia_neta)
    }