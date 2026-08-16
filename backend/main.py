import hashlib
from datetime import date
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy import text
from pydantic import BaseModel
from typing import List
from typing import Optional

from database import get_db  # Importamos la conexión que creaste
from models import Usuario, Rol, Producto, Lote, Venta, DetalleVenta, Empleado

app = FastAPI(title="Farmacentric API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"mensaje": "API de FarmacentricApp funcionando desde cero"}

# NUEVA RUTA: Prueba de base de datos
@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Ejecutamos un comando básico de SQL Server para pedir su versión
        resultado = db.execute(text("SELECT @@VERSION")).scalar()
        return {
            "estado": "¡Conexión exitosa!", 
            "version_sql": resultado
        }
    except Exception as e:
        return {
            "estado": "Error al conectar", 
            "detalle": str(e)
        }

@app.get("/usuarios")
def obtener_usuarios(db: Session = Depends(get_db)):
    # db.query(Usuario).all() es el equivalente en Python a "SELECT * FROM Usuarios"
    usuarios_db = db.query(Usuario).all()
    
    lista_usuarios = []
    for u in usuarios_db:
        lista_usuarios.append({
            "UsuarioID": u.UsuarioID,
            "NombreUsuario": u.NombreUsuario,
            "Rol": u.rol.NombreRol, # Gracias a la relación, podemos traer el nombre del rol directamente!
            "Activo": u.Activo
        })
        
    return lista_usuarios

class LoginRequest(BaseModel):
    nombre_usuario: str
    contrasena: str

class ItemVenta(BaseModel):
    lote_id: int
    cantidad: int

class NuevaVentaRequest(BaseModel):
    usuario_id: int  # Quién está cobrando
    metodo_pago: str # 'Efectivo', 'Tarjeta' o 'Transferencia'
    detalles: List[ItemVenta] # Lista de productos a vender

class NuevoIngresoRequest(BaseModel):
    producto_id: int
    numero_lote: str
    fecha_fabricacion: date
    fecha_vencimiento: date
    cantidad: int

class NuevoEmpleadoRequest(BaseModel):
    usuario_id: Optional[int] = None 
    nombres: str
    apellidos: str
    cedula: str
    telefono: str
    cargo: str
    fecha_contratacion: date
    salario: float

# ==========================================
# NUEVA RUTA: Inicio de Sesión (Login)
# ==========================================
@app.post("/login")
def iniciar_sesion(datos: LoginRequest, db: Session = Depends(get_db)):
    # 1. Buscar si el usuario existe en la base de datos
    usuario_db = db.query(Usuario).filter(Usuario.NombreUsuario == datos.nombre_usuario).first()
    
    if not usuario_db:
        # Si no existe, devolvemos un error 404
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if not usuario_db.Activo:
        # Si está desactivado, no le dejamos entrar
        raise HTTPException(status_code=403, detail="El usuario está inactivo")

    # 2. Encriptar la contraseña que nos mandó el frontend en SHA-256
    contrasena_ingresada_hash = hashlib.sha256(datos.contrasena.encode('utf-8')).digest()
    
    # 3. Comparar con la que está en la base de datos
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
        # Si no coincide, devolvemos un error 401 (No autorizado)
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

# ==========================================
# NUEVA RUTA: Obtener Productos con Categorías
# ==========================================
@app.get("/productos")
def obtener_productos(db: Session = Depends(get_db)):
    productos_db = db.query(Producto).all()
    
    lista_productos = []
    for p in productos_db:
        lista_productos.append({
            "ProductoID": p.ProductoID,
            "Nombre": p.Nombre,
            "Categoria": p.categoria.Nombre,           # Extrae el nombre de la categoría
            "RequiereReceta": p.categoria.RequiereReceta, # Extrae si requiere receta
            "Proveedor": p.proveedor.NombreEmpresa,    # Extrae el nombre del proveedor
            "PrecioVenta": float(p.PrecioVenta),       # Convertimos Numeric a float para JSON
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
        # Verificamos si la cantidad actual es menor o igual al stock mínimo que pide el producto
        stock_critico = lote.CantidadActual <= lote.producto.StockMinimo
        
        lista_inventario.append({
            "LoteID": lote.LoteID,
            "Producto": lote.producto.Nombre,
            "NumeroLote": lote.NumeroLote,
            "FechaVencimiento": lote.FechaVencimiento,
            "CantidadActual": lote.CantidadActual,
            "StockMinimo": lote.producto.StockMinimo,
            "EsControlado": lote.producto.EsControlado,
            "AlertaStock": stock_critico # Será True si hay que alertar al farmacéutico
        })
        
    return lista_inventario

# ==========================================
# RUTAS DE VENTAS (POS)
# ==========================================
@app.post("/ventas")
def registrar_venta(datos: NuevaVentaRequest, db: Session = Depends(get_db)):
    # 1. Creamos la venta en cero
    nueva_venta = Venta(
        UsuarioID=datos.usuario_id,
        MetodoPago=datos.metodo_pago,
        Total=0 # Lo calcularemos ahora
    )
    db.add(nueva_venta)
    db.flush() # Guardamos temporalmente para que SQL Server nos genere el VentaID
    
    total_venta = 0
    
    # 2. Recorremos cada producto que nos enviaron
    for item in datos.detalles:
        # Buscamos el lote en la base de datos
        lote_db = db.query(Lote).filter(Lote.LoteID == item.lote_id).first()
        
        if not lote_db:
            db.rollback() # Cancelamos todo si hay error
            raise HTTPException(status_code=404, detail=f"El Lote {item.lote_id} no existe")
            
        if lote_db.CantidadActual < item.cantidad:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {lote_db.producto.Nombre}. Solo hay {lote_db.CantidadActual} disponibles.")
            
        # Descontamos del inventario
        lote_db.CantidadActual -= item.cantidad
        
        # Calculamos subtotales
        precio = lote_db.producto.PrecioVenta
        subtotal = precio * item.cantidad
        total_venta += subtotal
        
        # Creamos el detalle de la venta
        nuevo_detalle = DetalleVenta(
            VentaID=nueva_venta.VentaID,
            ProductoID=lote_db.ProductoID,
            LoteID=lote_db.LoteID,
            Cantidad=item.cantidad,
            PrecioUnitario=precio
        )
        db.add(nuevo_detalle)
        
    # 3. Actualizamos el total real de la venta y confirmamos a la base de datos
    nueva_venta.Total = total_venta
    db.commit()
    
    return {
        "exito": True, 
        "mensaje": "Venta registrada con éxito",
        "venta_id": nueva_venta.VentaID,
        "total_cobrado": total_venta
    }

# ==========================================
# RUTAS DE COMPRAS E INGRESOS
# ==========================================
@app.post("/ingresos")
def registrar_ingreso_lote(datos: NuevoIngresoRequest, db: Session = Depends(get_db)):
    # 1. Verificamos que el producto que intentan ingresar realmente exista en el catálogo
    producto_db = db.query(Producto).filter(Producto.ProductoID == datos.producto_id).first()
    
    if not producto_db:
        raise HTTPException(status_code=404, detail="El Producto especificado no existe en el catálogo")
        
    # 2. Creamos el nuevo lote
    nuevo_lote = Lote(
        ProductoID=datos.producto_id,
        NumeroLote=datos.numero_lote,
        FechaFabricacion=datos.fecha_fabricacion,
        FechaVencimiento=datos.fecha_vencimiento,
        CantidadInicial=datos.cantidad,
        CantidadActual=datos.cantidad # Como acaba de llegar, la cantidad actual es igual a la inicial
    )
    
    # 3. Lo guardamos en la base de datos
    db.add(nuevo_lote)
    db.commit()
    db.refresh(nuevo_lote) # Recargamos para obtener el LoteID que SQL Server le asignó
    
    return {
        "exito": True,
        "mensaje": f"Se ingresaron {datos.cantidad} unidades de '{producto_db.Nombre}' al inventario exitosamente.",
        "lote_generado_id": nuevo_lote.LoteID
    }

# ==========================================
# ESQUEMA PARA RRHH
# ==========================================
class NuevoEmpleadoRequest(BaseModel):
    usuario_id: int 
    nombre: str
    apellido: str
    cedula: str
    puesto: str
    fecha_contratacion: date
    salario_base: float

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