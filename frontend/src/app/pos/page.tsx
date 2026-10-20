"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Pill,
    ShoppingCart,
    ArrowLeft,
    Plus,
    Minus,
    Trash2,
    CreditCard,
    Banknote,
    CheckCircle,
    XCircle,
    PackageOpen,
    FileText,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

interface Producto {
    ProductoID: number;
    Nombre: string;
    PrecioVenta: number;
    LoteID: number | null;
    Categoria: string;
    RequiereReceta: boolean;
    StockTotal: number;
    StockVencido?: number;
}

interface ItemCarrito {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    lote_id: number | null;
    categoria: string;
    requiere_receta: boolean;
    stock_maximo: number;
}

type MensajeEstado = { tipo: "exito" | "error"; texto: string } | null;

const CATEGORIA_COLORS: Record<string, { bg: string; color: string }> = {
    "Analgésico": { bg: "rgba(14,165,233,0.1)", color: "#0369A1" },
    "Analgésicos": { bg: "rgba(14,165,233,0.1)", color: "#0369A1" },
    "Antibiótico": { bg: "rgba(5,150,105,0.1)", color: "#065F46" },
    "Antibióticos": { bg: "rgba(5,150,105,0.1)", color: "#065F46" },
    "Controlado": { bg: "rgba(220,38,38,0.1)", color: "#991B1B" },
    "Psicotrópicos": { bg: "rgba(220,38,38,0.1)", color: "#991B1B" },
    "Suplemento": { bg: "rgba(217,119,6,0.1)", color: "#92400E" },
    "Vitaminas": { bg: "rgba(217,119,6,0.1)", color: "#92400E" },
};

const METODOS_PAGO = [
    { value: "Efectivo", label: "Efectivo", icon: Banknote },
    { value: "Tarjeta", label: "Tarjeta", icon: CreditCard },
];

export default function POSPage() {
    const router = useRouter();
    const [usuarioId, setUsuarioId] = useState<number>(0);
    const [productosCatalog, setProductosCatalog] = useState<Producto[]>([]);
    const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [cargando, setCargando] = useState(false);
    const [metodoPago, setMetodoPago] = useState("Efectivo");
    const [mensaje, setMensaje] = useState<MensajeEstado>(null);
    const [recetaPendiente, setRecetaPendiente] = useState<Producto | null>(null);

    const cargarProductosPOS = async () => {
        setCargandoCatalogo(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/productos");
            if (res.ok) {
                setProductosCatalog(await res.json());
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo cargar el catálogo desde el servidor." });
        } finally {
            setCargandoCatalogo(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) { router.push("/login"); return; }
        const user = JSON.parse(stored);
        setUsuarioId(user.id || user.usuario_id || user.UsuarioID || 3);
        cargarProductosPOS();
    }, [router]);

    const confirmarYAgregar = (producto: Producto) => {
        setMensaje(null);
        if (producto.StockTotal <= 0) {
            setMensaje({ tipo: "error", texto: `No hay unidades disponibles de ${producto.Nombre} en bodega.` });
            return;
        }

        setCarrito((prev) => {
            const existe = prev.find((i) => i.producto_id === producto.ProductoID);
            if (existe) {
                if (existe.cantidad + 1 > producto.StockTotal) {
                    setMensaje({ tipo: "error", texto: `Solo existen ${producto.StockTotal} unidades disponibles de ${producto.Nombre}.` });
                    return prev;
                }
                return prev.map((i) =>
                    i.producto_id === producto.ProductoID ? { ...i, cantidad: i.cantidad + 1 } : i
                );
            }
            return [
                ...prev,
                {
                    producto_id: producto.ProductoID,
                    nombre: producto.Nombre,
                    precio: producto.PrecioVenta,
                    cantidad: 1,
                    lote_id: producto.LoteID,
                    categoria: producto.Categoria,
                    requiere_receta: producto.RequiereReceta,
                    stock_maximo: producto.StockTotal,
                },
            ];
        });
    };

    const handleClickProducto = (producto: Producto) => {
        if (producto.StockTotal <= 0) {
            setMensaje({ tipo: "error", texto: `El producto ${producto.Nombre} está agotado.` });
            return;
        }
        const yaEnCarrito = carrito.find((i) => i.producto_id === producto.ProductoID);
        if (producto.RequiereReceta && !yaEnCarrito) {
            setRecetaPendiente(producto);
        } else {
            confirmarYAgregar(producto);
        }
    };

    const cambiarCantidad = (producto_id: number, delta: number) => {
        setCarrito((prev) =>
            prev
                .map((i) => {
                    if (i.producto_id === producto_id) {
                        const nuevaCant = i.cantidad + delta;
                        if (nuevaCant > i.stock_maximo) {
                            setMensaje({ tipo: "error", texto: `Stock máximo alcanzado (${i.stock_maximo} uds).` });
                            return i;
                        }
                        return { ...i, cantidad: nuevaCant };
                    }
                    return i;
                })
                .filter((i) => i.cantidad > 0)
        );
    };

    const eliminarItem = (producto_id: number) => {
        setCarrito((prev) => prev.filter((i) => i.producto_id !== producto_id));
    };

    const limpiarCarrito = () => setCarrito([]);

    const calcularTotal = () =>
        carrito.reduce((t, i) => t + i.precio * i.cantidad, 0);

    const cobrarVenta = async () => {
        if (carrito.length === 0) return;
        setCargando(true);
        setMensaje(null);

        try {
            const res = await fetch("http://127.0.0.1:8000/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuarioId,
                    metodo_pago: metodoPago,
                    detalles: carrito.map((i) => ({
                        producto_id: i.producto_id,
                        cantidad: i.cantidad,
                        lote_id: i.lote_id,
                    })),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje({ tipo: "exito", texto: `Venta #${data.venta_id} registrada · Total: C$ ${data.total_cobrado?.toFixed(2)}` });
                setCarrito([]);
                cargarProductosPOS(); // Actualiza el stock en pantalla inmediatamente
            } else {
                setMensaje({ tipo: "error", texto: typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail) });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor. Verifique el backend." });
        } finally {
            setCargando(false);
        }
    };

    const totalItems = carrito.reduce((t, i) => t + i.cantidad, 0);
    const itemsConReceta = carrito.filter((i) => i.requiere_receta).length;

    return (
        <div className="min-h-screen flex flex-col">

            {/* ── Modal de confirmación de receta ── */}
            {recetaPendiente && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(11,36,71,0.55)", backdropFilter: "blur(4px)" }}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6 animate-slide-down"
                        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-xl)" }}
                    >
                        <div className="flex justify-center mb-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: "rgba(217,119,6,0.1)" }}
                            >
                                <FileText size={28} color="#D97706" />
                            </div>
                        </div>

                        <h3 className="text-center font-semibold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                            Requiere Receta Médica
                        </h3>
                        <p className="text-center text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                            <strong style={{ color: "var(--text-primary)" }}>{recetaPendiente.Nombre}</strong>
                        </p>
                        <p className="text-center text-xs leading-relaxed mb-6" style={{ color: "var(--text-muted)" }}>
                            Este medicamento está sujeto a control de prescripción médica.
                            ¿Confirma que el cliente presenta una receta válida y vigente?
                        </p>

                        <div
                            className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-5 text-xs"
                            style={{
                                backgroundColor: "rgba(217,119,6,0.08)",
                                border: "1px solid rgba(217,119,6,0.2)",
                                color: "#92400E",
                            }}
                        >
                            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                            <span>La dispensación sin receta válida puede constituir una infracción sanitaria.</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setRecetaPendiente(null)}
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
                                onClick={() => {
                                    confirmarYAgregar(recetaPendiente);
                                    setRecetaPendiente(null);
                                }}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95"
                                style={{
                                    backgroundColor: "#D97706",
                                    boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                                }}
                            >
                                Receta presentada ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="px-6 py-3 shadow-md flex items-center justify-between" style={{ backgroundColor: "var(--primary)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                        <ShoppingCart size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Punto de Venta</p>
                        <p className="text-blue-300 text-xs mt-0.5">Terminal POS · Farmacentric</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={cargarProductosPOS}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                        <RefreshCw size={12} />
                        Actualizar Stock
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                        <ArrowLeft size={13} />
                        Panel
                    </button>
                </div>
            </div>

            {/* ── Mensaje de estado ── */}
            {mensaje && (
                <div
                    className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-slide-down"
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

            {/* ── Cuerpo principal ── */}
            <div className="flex flex-1 gap-5 p-5 overflow-hidden">

                {/* ── Catálogo de productos ── */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                                Catálogo de Productos
                            </h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                Haga clic para agregar al ticket (Stock sincronizado en tiempo real)
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                                style={{ backgroundColor: "rgba(217,119,6,0.1)", color: "#92400E" }}
                            >
                                <FileText size={10} />
                                Con receta
                            </span>
                            <span
                                className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{ backgroundColor: "rgba(14,165,233,0.1)", color: "#0369A1" }}
                            >
                                {productosCatalog.length} productos
                            </span>
                        </div>
                    </div>

                    {cargandoCatalogo ? (
                        <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                            Sincronizando productos y existencias...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                            {productosCatalog.map((prod) => {
                                const catColor = CATEGORIA_COLORS[prod.Categoria] ?? { bg: "rgba(100,116,139,0.1)", color: "#475569" };
                                const enCarrito = carrito.find((i) => i.producto_id === prod.ProductoID);
                                const agotado = prod.StockTotal <= 0;

                                return (
                                    <button
                                        key={prod.ProductoID}
                                        onClick={() => handleClickProducto(prod)}
                                        disabled={agotado}
                                        className="text-left rounded-2xl p-5 transition-all duration-200 active:scale-[0.97] relative"
                                        style={{
                                            backgroundColor: "var(--surface)",
                                            border: `1.5px solid ${enCarrito ? "var(--accent)" : "var(--border)"}`,
                                            boxShadow: enCarrito ? "0 0 0 3px rgba(14,165,233,0.1)" : "var(--shadow-sm)",
                                            opacity: agotado ? 0.55 : 1,
                                            cursor: agotado ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {prod.RequiereReceta && (
                                            <div
                                                className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                                                style={{ backgroundColor: "rgba(217,119,6,0.12)", color: "#B45309" }}
                                            >
                                                <FileText size={9} />
                                                Receta
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: catColor.bg }}
                                            >
                                                <Pill size={18} color={catColor.color} />
                                            </div>
                                            {enCarrito && (
                                                <span
                                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: "var(--accent)", color: "white" }}
                                                >
                                                    ×{enCarrito.cantidad}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="font-semibold text-sm leading-snug mb-1" style={{ color: "var(--text-primary)" }}>
                                            {prod.Nombre}
                                        </h3>

                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                                style={{ backgroundColor: catColor.bg, color: catColor.color }}
                                            >
                                                {prod.Categoria}
                                            </span>
                                            <span
                                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: agotado ? "rgba(220,38,38,0.1)" : "rgba(5,150,105,0.1)",
                                                    color: agotado ? "#DC2626" : "#065F46",
                                                }}
                                            >
                                                {agotado && (prod.StockVencido ?? 0) > 0
                                                    ? `Bloqueado (${prod.StockVencido} vencidos)`
                                                    : agotado
                                                        ? "Agotado (0)"
                                                        : `Stock vigente: ${prod.StockTotal}`}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-lg font-bold" style={{ color: "var(--success)" }}>
                                            C$ {prod.PrecioVenta.toFixed(2)}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Panel del ticket ── */}
                <div
                    className="w-80 xl:w-96 flex flex-col rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
                >
                    <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={15} color="var(--text-muted)" />
                            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Ticket de Venta</span>
                        </div>
                        {carrito.length > 0 && (
                            <button
                                onClick={limpiarCarrito}
                                className="text-xs flex items-center gap-1 transition-colors duration-150"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Trash2 size={11} />
                                Limpiar
                            </button>
                        )}
                    </div>

                    {itemsConReceta > 0 && (
                        <div
                            className="mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2 text-xs animate-slide-down"
                            style={{
                                backgroundColor: "rgba(217,119,6,0.08)",
                                border: "1px solid rgba(217,119,6,0.2)",
                                color: "#92400E",
                            }}
                        >
                            <AlertTriangle size={13} className="flex-shrink-0" />
                            <span>
                                {itemsConReceta === 1
                                    ? "1 medicamento requiere receta médica"
                                    : `${itemsConReceta} medicamentos requieren receta médica`}
                            </span>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                        {carrito.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                                    style={{ backgroundColor: "rgba(100,116,139,0.08)" }}
                                >
                                    <PackageOpen size={24} color="var(--text-muted)" />
                                </div>
                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Carrito vacío</p>
                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Seleccione productos del catálogo</p>
                            </div>
                        ) : (
                            carrito.map((item) => (
                                <div
                                    key={item.producto_id}
                                    className="flex items-center gap-3 rounded-xl p-3"
                                    style={{
                                        backgroundColor: "var(--background)",
                                        border: `1px solid ${item.requiere_receta ? "rgba(217,119,6,0.25)" : "var(--border)"}`,
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: CATEGORIA_COLORS[item.categoria]?.bg ?? "rgba(100,116,139,0.1)" }}
                                    >
                                        <Pill size={14} color={CATEGORIA_COLORS[item.categoria]?.color ?? "#475569"} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{item.nombre}</p>
                                            {item.requiere_receta && (
                                                <FileText size={10} color="#D97706" className="flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>C$ {item.precio.toFixed(2)} c/u</p>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => cambiarCantidad(item.producto_id, -1)}
                                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 active:scale-90"
                                            style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}
                                        >
                                            <Minus size={10} />
                                        </button>
                                        <span className="w-6 text-center text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                            {item.cantidad}
                                        </span>
                                        <button
                                            onClick={() => cambiarCantidad(item.producto_id, 1)}
                                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 active:scale-90"
                                            style={{ backgroundColor: "var(--border)", color: "var(--text-muted)" }}
                                        >
                                            <Plus size={10} />
                                        </button>
                                        <button
                                            onClick={() => eliminarItem(item.producto_id)}
                                            className="w-6 h-6 rounded-md flex items-center justify-center ml-1 transition-all duration-150 active:scale-90"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            <Trash2 size={11} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Total a cobrar</p>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                                C$ {calcularTotal().toFixed(2)}
                            </p>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {METODOS_PAGO.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setMetodoPago(value)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                                    style={{
                                        backgroundColor: metodoPago === value ? "var(--primary)" : "var(--background)",
                                        color: metodoPago === value ? "white" : "var(--text-muted)",
                                        border: `1.5px solid ${metodoPago === value ? "var(--primary)" : "var(--border)"}`,
                                    }}
                                >
                                    <Icon size={13} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={cobrarVenta}
                            disabled={cargando || carrito.length === 0}
                            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
                            style={{
                                backgroundColor: carrito.length === 0 ? "#94A3B8" : "var(--accent)",
                                boxShadow: carrito.length === 0 ? "none" : "0 4px 14px rgba(14,165,233,0.35)",
                                cursor: carrito.length === 0 || cargando ? "not-allowed" : "pointer",
                            }}
                        >
                            {cargando ? (
                                <>Procesando...</>
                            ) : (
                                <>
                                    <CreditCard size={15} />
                                    Cobrar C$ {calcularTotal().toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}