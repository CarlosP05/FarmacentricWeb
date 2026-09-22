"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Package,
    ArrowLeft,
    Plus,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    FlaskConical,
    CalendarClock,
    Boxes,
    ShieldAlert,
} from "lucide-react";

interface LoteInventario {
    LoteID: number;
    Producto: string;
    NumeroLote: string;
    FechaVencimiento: string;
    CantidadActual: number;
    StockMinimo: number;
    EsControlado: boolean;
    AlertaStock: boolean;
}

interface ProductoCatalogo {
    ProductoID: number;
    Nombre: string;
}

type MensajeEstado = { tipo: "exito" | "error"; texto: string } | null;

const productosCatalog: ProductoCatalogo[] = [
    { ProductoID: 1, Nombre: "Paracetamol 500mg" },
    { ProductoID: 2, Nombre: "Amoxicilina 500mg" },
    { ProductoID: 3, Nombre: "Diazepam 10mg" },
    { ProductoID: 4, Nombre: "Vitamina C 1000mg" },
];

function diasParaVencer(fechaStr: string): number {
    const hoy = new Date();
    const venc = new Date(fechaStr);
    return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function formatFecha(fechaStr: string): string {
    return new Date(fechaStr).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

export default function InventarioPage() {
    const router = useRouter();
    const [inventario, setInventario] = useState<LoteInventario[]>([]);
    const [cargandoTabla, setCargandoTabla] = useState(true);
    const [cargandoForm, setCargandoForm] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState<MensajeEstado>(null);

    const [productoId, setProductoId] = useState(1);
    const [numeroLote, setNumeroLote] = useState("");
    const [fechaFabricacion, setFechaFabricacion] = useState("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [cantidad, setCantidad] = useState<number | "">("");

    const cargarInventario = async () => {
        setCargandoTabla(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/inventario");
            if (res.ok) setInventario(await res.json());
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoTabla(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) { router.push("/login"); return; }
        cargarInventario();
    }, [router]);

    const resetForm = () => {
        setNumeroLote("");
        setFechaFabricacion("");
        setFechaVencimiento("");
        setCantidad("");
        setProductoId(1);
    };

    const registrarIngreso = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargandoForm(true);
        setMensaje(null);

        try {
            const res = await fetch("http://127.0.0.1:8000/ingresos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    producto_id: productoId,
                    numero_lote: numeroLote,
                    fecha_fabricacion: fechaFabricacion,
                    fecha_vencimiento: fechaVencimiento,
                    cantidad: Number(cantidad),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje });
                setMostrarModal(false);
                resetForm();
                cargarInventario();
            } else {
                setMensaje({ tipo: "error", texto: typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail) });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoForm(false);
        }
    };

    // Stats
    const totalLotes = inventario.length;
    const alertasStock = inventario.filter((i) => i.AlertaStock).length;
    const porVencer = inventario.filter((i) => diasParaVencer(i.FechaVencimiento) <= 30 && diasParaVencer(i.FechaVencimiento) > 0).length;
    const controlados = inventario.filter((i) => i.EsControlado).length;

    const inputStyle = {
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

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "var(--accent)";
        e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";
    };
    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "var(--border)";
        e.target.style.boxShadow = "none";
    };

    return (
        <div className="min-h-screen flex flex-col">

            {/* ── Modal ingreso de lote ── */}
            {mostrarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(11,36,71,0.55)", backdropFilter: "blur(4px)" }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl p-6 animate-slide-down"
                        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-xl)" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(5,150,105,0.1)" }}
                                >
                                    <Package size={18} color="var(--success)" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Registrar Ingreso de Lote
                                    </h2>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ingreso de proveedor</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setMostrarModal(false); resetForm(); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150"
                                style={{ color: "var(--text-muted)", backgroundColor: "var(--background)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
                            >
                                <XCircle size={16} />
                            </button>
                        </div>

                        <form onSubmit={registrarIngreso} className="space-y-4">
                            {/* Producto */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Producto
                                </label>
                                <select
                                    value={productoId}
                                    onChange={(e) => setProductoId(Number(e.target.value))}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                >
                                    {productosCatalog.map((p) => (
                                        <option key={p.ProductoID} value={p.ProductoID}>{p.Nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Número de lote */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Número de Lote
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. LOTE-2026-001"
                                    value={numeroLote}
                                    onChange={(e) => setNumeroLote(e.target.value)}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>

                            {/* Fechas */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Fabricación
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={fechaFabricacion}
                                        onChange={(e) => setFechaFabricacion(e.target.value)}
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Vencimiento
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={fechaVencimiento}
                                        onChange={(e) => setFechaVencimiento(e.target.value)}
                                        style={inputStyle}
                                        onFocus={handleInputFocus}
                                        onBlur={handleInputBlur}
                                    />
                                </div>
                            </div>

                            {/* Cantidad */}
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Cantidad de Unidades
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    placeholder="0"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value === "" ? "" : Number(e.target.value))}
                                    style={inputStyle}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setMostrarModal(false); resetForm(); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
                                    style={{
                                        backgroundColor: "var(--background)",
                                        color: "var(--text-muted)",
                                        border: "1.5px solid var(--border)",
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={cargandoForm}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-95"
                                    style={{
                                        backgroundColor: "var(--success)",
                                        boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
                                        cursor: cargandoForm ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {cargandoForm ? (
                                        <>
                                            <svg className="animate-spin-fast" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={14} />
                                            Guardar Lote
                                        </>
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(5,150,105,0.9)" }}>
                        <Package size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Inventario</p>
                        <p className="text-blue-300 text-xs mt-0.5">Control de lotes y existencias</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={cargarInventario}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                    >
                        <RefreshCw size={12} />
                        Actualizar
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                    >
                        <ArrowLeft size={13} />
                        Panel
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-6 py-6 flex flex-col gap-5">

                {/* ── Mensaje de estado ── */}
                {mensaje && (
                    <div
                        className="px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-slide-down"
                        style={{
                            backgroundColor: mensaje.tipo === "exito" ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)",
                            border: `1px solid ${mensaje.tipo === "exito" ? "rgba(5,150,105,0.25)" : "rgba(220,38,38,0.25)"}`,
                            color: mensaje.tipo === "exito" ? "#065F46" : "#991B1B",
                        }}
                    >
                        {mensaje.tipo === "exito"
                            ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                            : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Lotes", value: totalLotes, icon: Boxes, color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
                        { label: "Alertas Stock", value: alertasStock, icon: AlertTriangle, color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
                        { label: "Por Vencer (30d)", value: porVencer, icon: CalendarClock, color: "#D97706", bg: "rgba(217,119,6,0.08)" },
                        { label: "Controlados", value: controlados, icon: ShieldAlert, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div
                            key={label}
                            className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
                        >
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

                {/* ── Tabla ── */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
                >
                    {/* Cabecera de la tabla */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: "1px solid var(--border)" }}
                    >
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                Registro de Lotes
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {totalLotes} lote{totalLotes !== 1 ? "s" : ""} en bodega
                            </p>
                        </div>
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 active:scale-95"
                            style={{
                                backgroundColor: "var(--success)",
                                boxShadow: "0 3px 10px rgba(5,150,105,0.25)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#047857")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--success)")}
                        >
                            <Plus size={13} />
                            Ingresar Lote
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(240,244,248,0.6)" }}>
                                    {["Producto", "N.º Lote", "Vencimiento", "Stock Actual", "Estado"].map((col) => (
                                        <th
                                            key={col}
                                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cargandoTabla ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="animate-spin-fast" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                                </svg>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Cargando inventario...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : inventario.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(100,116,139,0.08)" }}>
                                                    <Boxes size={22} color="var(--text-muted)" />
                                                </div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Sin lotes registrados</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ingrese el primer lote de proveedor</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    inventario.map((item, idx) => {
                                        const dias = diasParaVencer(item.FechaVencimiento);
                                        const venceProximo = dias <= 30 && dias > 0;
                                        const vencido = dias <= 0;

                                        return (
                                            <tr
                                                key={item.LoteID}
                                                className="transition-colors duration-150"
                                                style={{
                                                    borderBottom: idx < inventario.length - 1 ? "1px solid var(--border)" : "none",
                                                    backgroundColor: item.AlertaStock ? "rgba(220,38,38,0.02)" : "transparent",
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(240,244,248,0.6)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.AlertaStock ? "rgba(220,38,38,0.02)" : "transparent")}
                                            >
                                                {/* Producto */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: "rgba(14,165,233,0.08)" }}
                                                        >
                                                            <FlaskConical size={13} color="#0369A1" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.Producto}</p>
                                                            {item.EsControlado && (
                                                                <span className="text-[10px] font-semibold" style={{ color: "#7C3AED" }}>● Controlado</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Lote */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className="text-xs font-mono px-2 py-1 rounded-lg"
                                                        style={{ backgroundColor: "rgba(100,116,139,0.08)", color: "var(--text-muted)" }}
                                                    >
                                                        {item.NumeroLote}
                                                    </span>
                                                </td>

                                                {/* Vencimiento */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className="text-sm"
                                                            style={{
                                                                color: vencido ? "#DC2626" : venceProximo ? "#D97706" : "var(--text-muted)",
                                                                fontWeight: vencido || venceProximo ? 600 : 400,
                                                            }}
                                                        >
                                                            {formatFecha(item.FechaVencimiento)}
                                                        </span>
                                                        {vencido && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
                                                                VENCIDO
                                                            </span>
                                                        )}
                                                        {venceProximo && !vencido && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(217,119,6,0.1)", color: "#D97706" }}>
                                                                {dias}d
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Stock actual */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="text-sm font-bold"
                                                            style={{ color: item.AlertaStock ? "#DC2626" : "var(--success)" }}
                                                        >
                                                            {item.CantidadActual}
                                                        </span>
                                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                            / mín. {item.StockMinimo}
                                                        </span>
                                                    </div>
                                                    {/* Barra de progreso */}
                                                    <div className="mt-1 h-1 rounded-full w-20 overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${Math.min(100, (item.CantidadActual / Math.max(item.StockMinimo * 2, item.CantidadActual)) * 100)}%`,
                                                                backgroundColor: item.AlertaStock ? "#DC2626" : "var(--success)",
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                {/* Estado */}
                                                <td className="px-5 py-4">
                                                    {item.AlertaStock ? (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                            style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}
                                                        >
                                                            <AlertTriangle size={10} />
                                                            Stock Crítico
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                            style={{ backgroundColor: "rgba(5,150,105,0.1)", color: "#065F46" }}
                                                        >
                                                            <CheckCircle size={10} />
                                                            Óptimo
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}