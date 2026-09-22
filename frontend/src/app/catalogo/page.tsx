"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Tag,
    ArrowLeft,
    Plus,
    RefreshCw,
    XCircle,
    CheckCircle,
    Beaker,
    FlaskConical,
    Truck,
    ShieldAlert,
    PackageSearch,
} from "lucide-react";

interface Producto {
    ProductoID: number;
    Nombre: string;
    Categoria: string;
    Proveedor: string;
    PrecioVenta: number;
    StockMinimo: number;
    EsControlado: boolean;
}

interface Categoria {
    CategoriaID: number;
    Nombre: string;
}

interface Proveedor {
    ProveedorID: number;
    NombreEmpresa: string;
}

type MensajeEstado = { tipo: "exito" | "error"; texto: string } | null;

const UNIDADES = ["Unidad", "Caja", "Frasco", "Blíster"];

export default function CatalogoPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [cargandoForm, setCargandoForm] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState<MensajeEstado>(null);

    const [nombre, setNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [proveedorId, setProveedorId] = useState("");
    const [precioCompra, setPrecioCompra] = useState("");
    const [precioVenta, setPrecioVenta] = useState("");
    const [stockMinimo, setStockMinimo] = useState("10");
    const [esControlado, setEsControlado] = useState(false);
    const [unidadMedida, setUnidadMedida] = useState("Unidad");

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resProd, resCat, resProv] = await Promise.all([
                fetch("http://127.0.0.1:8000/productos"),
                fetch("http://127.0.0.1:8000/categorias"),
                fetch("http://127.0.0.1:8000/proveedores"),
            ]);
            if (resProd.ok) setProductos(await resProd.json());
            if (resCat.ok) setCategorias(await resCat.json());
            if (resProv.ok) setProveedores(await resProv.json());
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) { router.push("/login"); return; }
        const user = JSON.parse(stored);
        if (user.rol !== "Administrador" && user.rol !== "Cajero/Farmacéutico") {
            router.push("/dashboard"); return;
        }
        cargarDatos();
    }, [router]);

    const resetForm = () => {
        setNombre(""); setCategoriaId(""); setProveedorId("");
        setPrecioCompra(""); setPrecioVenta(""); setStockMinimo("10");
        setEsControlado(false); setUnidadMedida("Unidad");
    };

    const guardarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaId || !proveedorId) {
            setMensaje({ tipo: "error", texto: "Debe seleccionar una categoría y un proveedor." });
            return;
        }
        setCargandoForm(true);
        setMensaje(null);

        try {
            const res = await fetch("http://127.0.0.1:8000/productos-catalogo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    categoria_id: parseInt(categoriaId),
                    proveedor_id: parseInt(proveedorId),
                    precio_compra: parseFloat(precioCompra),
                    precio_venta: parseFloat(precioVenta),
                    stock_minimo: parseInt(stockMinimo),
                    es_controlado: esControlado,
                    unidad_medida: unidadMedida,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje || "Producto agregado al catálogo." });
                setMostrarModal(false);
                resetForm();
                cargarDatos();
            } else {
                setMensaje({ tipo: "error", texto: data.detail || "No se pudo guardar el producto." });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoForm(false);
        }
    };

    const totalProductos = productos.length;
    const controlados = productos.filter((p) => p.EsControlado).length;

    const inputStyle: React.CSSProperties = {
        border: "1.5px solid var(--border)",
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
        borderRadius: "10px",
        padding: "10px 12px",
        fontSize: "13px",
        outline: "none",
        width: "100%",
        transition: "border-color 0.15s, box-shadow 0.15s",
    };
    const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "var(--accent)";
        e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "var(--border)";
        e.target.style.boxShadow = "none";
    };

    return (
        <div className="min-h-screen flex flex-col">

            {/* ── Modal nuevo producto ── */}
            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(11,36,71,0.55)", backdropFilter: "blur(4px)" }}>
                    <div className="w-full max-w-2xl rounded-2xl p-6 animate-slide-down"
                        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-xl)" }}>

                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(14,165,233,0.1)" }}>
                                    <Tag size={18} color="var(--accent)" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Agregar al Catálogo
                                    </h2>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nuevo medicamento o producto</p>
                                </div>
                            </div>
                            <button onClick={() => { setMostrarModal(false); resetForm(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                                style={{ color: "var(--text-muted)", backgroundColor: "var(--background)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}>
                                <XCircle size={16} />
                            </button>
                        </div>

                        <form onSubmit={guardarProducto} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Nombre del Producto
                                </label>
                                <input type="text" required placeholder="Ej. Paracetamol 500mg"
                                    value={nombre} onChange={(e) => setNombre(e.target.value)}
                                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Categoría
                                    </label>
                                    <select required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                                        <option value="">Seleccione...</option>
                                        {categorias.map((c) => (
                                            <option key={c.CategoriaID} value={c.CategoriaID}>{c.Nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Proveedor
                                    </label>
                                    <select required value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                                        <option value="">Seleccione...</option>
                                        {proveedores.map((p) => (
                                            <option key={p.ProveedorID} value={p.ProveedorID}>{p.NombreEmpresa}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Precio Compra
                                    </label>
                                    <input type="number" step="0.01" required placeholder="0.00"
                                        value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Precio Venta
                                    </label>
                                    <input type="number" step="0.01" required placeholder="0.00"
                                        value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Stock Mín.
                                    </label>
                                    <input type="number" required value={stockMinimo}
                                        onChange={(e) => setStockMinimo(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Unidad
                                    </label>
                                    <select value={unidadMedida} onChange={(e) => setUnidadMedida(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                                        {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Checkbox controlado */}
                            <div className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ backgroundColor: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
                                <input type="checkbox" id="controlado" checked={esControlado}
                                    onChange={(e) => setEsControlado(e.target.checked)}
                                    className="w-4 h-4 rounded" style={{ accentColor: "#DC2626" }} />
                                <label htmlFor="controlado" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                                    style={{ color: "#991B1B" }}>
                                    <Beaker size={14} />
                                    Medicamento controlado / Requiere receta médica
                                </label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button"
                                    onClick={() => { setMostrarModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
                                    style={{ backgroundColor: "var(--background)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={cargandoForm}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                                    style={{
                                        backgroundColor: "var(--accent)",
                                        boxShadow: "0 4px 12px rgba(14,165,233,0.3)",
                                        cursor: cargandoForm ? "not-allowed" : "pointer",
                                    }}>
                                    {cargandoForm ? (
                                        <>
                                            <svg className="animate-spin-fast" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        <><Plus size={14} />Guardar Producto</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="px-6 py-3 shadow-md flex items-center justify-between" style={{ backgroundColor: "var(--primary)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(14,165,233,0.7)" }}>
                        <Tag size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Catálogo de Productos</p>
                        <p className="text-blue-300 text-xs mt-0.5">Medicamentos, precios y categorías</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={cargarDatos}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}>
                        <RefreshCw size={12} />Actualizar
                    </button>
                    <button onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}>
                        <ArrowLeft size={13} />Panel
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-6 py-6 flex flex-col gap-5">

                {/* Mensaje */}
                {mensaje && (
                    <div className="px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-slide-down"
                        style={{
                            backgroundColor: mensaje.tipo === "exito" ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
                            border: `1px solid ${mensaje.tipo === "exito" ? "rgba(5,150,105,0.25)" : "rgba(220,38,38,0.25)"}`,
                            color: mensaje.tipo === "exito" ? "#065F46" : "#991B1B",
                        }}>
                        {mensaje.tipo === "exito"
                            ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                            : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Productos", value: totalProductos, icon: PackageSearch, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
                        { label: "Controlados", value: controlados, icon: ShieldAlert, color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
                        { label: "Proveedores", value: proveedores.length, icon: Truck, color: "#059669", bg: "rgba(5,150,105,0.08)" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div>
                                <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabla */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>

                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                Productos Registrados
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {totalProductos} producto{totalProductos !== 1 ? "s" : ""} en el catálogo
                            </p>
                        </div>
                        <button onClick={() => setMostrarModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 active:scale-95"
                            style={{ backgroundColor: "var(--accent)", boxShadow: "0 3px 10px rgba(14,165,233,0.25)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-dark)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent)")}>
                            <Plus size={13} />Nuevo Producto
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(240,244,248,0.6)" }}>
                                    {["Producto", "Categoría", "Proveedor", "Precio Venta", "Controlado"].map((col) => (
                                        <th key={col} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="animate-spin-fast" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                                </svg>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Cargando catálogo...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : productos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: "rgba(14,165,233,0.08)" }}>
                                                    <PackageSearch size={22} color="var(--accent)" />
                                                </div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Catálogo vacío</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Agregue el primer producto</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map((prod, idx) => (
                                        <tr key={prod.ProductoID}
                                            className="transition-colors duration-150"
                                            style={{ borderBottom: idx < productos.length - 1 ? "1px solid var(--border)" : "none" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(240,244,248,0.6)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: "rgba(14,165,233,0.08)" }}>
                                                        <FlaskConical size={13} color="var(--accent)" />
                                                    </div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{prod.Nombre}</p>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{ backgroundColor: "rgba(14,165,233,0.08)", color: "#0369A1" }}>
                                                    {prod.Categoria}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Truck size={12} color="var(--text-muted)" />
                                                    <span className="text-sm truncate max-w-[180px]" style={{ color: "var(--text-muted)" }}>
                                                        {prod.Proveedor}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm font-bold" style={{ color: "var(--success)" }}>
                                                    C$ {prod.PrecioVenta.toFixed(2)}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                {prod.EsControlado ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                        style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
                                                        <Beaker size={10} />Sí
                                                    </span>
                                                ) : (
                                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}