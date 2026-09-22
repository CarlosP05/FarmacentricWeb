"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    DollarSign,
    ArrowLeft,
    Plus,
    RefreshCw,
    XCircle,
    CheckCircle,
    TrendingDown,
    Receipt,
    Tag,
    CalendarDays,
} from "lucide-react";

interface Gasto {
    GastoID: number;
    Concepto: string;
    Monto: number;
    Categoria: string;
    FechaGasto: string;
    RegistradoPor: number;
}

type MensajeEstado = { tipo: "exito" | "error"; texto: string } | null;

const CATEGORIAS = [
    "Servicios Básicos",
    "Nómina / Salarios",
    "Insumos Locales",
    "Mantenimiento",
    "Otros",
];

const CATEGORIA_COLORS: Record<string, { bg: string; color: string }> = {
    "Servicios Básicos": { bg: "rgba(14,165,233,0.1)", color: "#0369A1" },
    "Nómina / Salarios": { bg: "rgba(124,58,237,0.1)", color: "#5B21B6" },
    "Insumos Locales": { bg: "rgba(5,150,105,0.1)", color: "#065F46" },
    "Mantenimiento": { bg: "rgba(217,119,6,0.1)", color: "#92400E" },
    "Otros": { bg: "rgba(100,116,139,0.1)", color: "#475569" },
};

function formatFecha(fechaStr: string) {
    if (!fechaStr) return "—";
    return new Date(fechaStr).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

export default function FinanzasPage() {
    const router = useRouter();
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [cargandoTabla, setCargandoTabla] = useState(true);
    const [cargandoForm, setCargandoForm] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState<MensajeEstado>(null);
    const [usuarioId, setUsuarioId] = useState(0);

    const [concepto, setConcepto] = useState("");
    const [monto, setMonto] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [fecha, setFecha] = useState("");

    const cargarGastos = async () => {
        setCargandoTabla(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/gastos");
            if (res.ok) setGastos(await res.json());
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoTabla(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) { router.push("/login"); return; }
        const user = JSON.parse(stored);
        if (user.rol !== "Administrador" && user.rol !== "Contador/RRHH") {
            router.push("/dashboard"); return;
        }
        setUsuarioId(user.id || user.usuario_id || user.UsuarioID || 2);
        cargarGastos();
    }, [router]);

    const resetForm = () => {
        setConcepto(""); setMonto(""); setCategoria(CATEGORIAS[0]); setFecha("");
    };

    const registrarGasto = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargandoForm(true);
        setMensaje(null);

        try {
            const res = await fetch("http://127.0.0.1:8000/gastos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    concepto,
                    monto: parseFloat(monto),
                    categoria,
                    fecha_gasto: fecha,
                    registrado_por: usuarioId,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje || "Gasto registrado en contabilidad." });
                setMostrarModal(false);
                resetForm();
                cargarGastos();
            } else {
                setMensaje({ tipo: "error", texto: data.detail || "No se pudo registrar el gasto." });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoForm(false);
        }
    };

    const totalGastos = gastos.reduce((t, g) => t + g.Monto, 0);
    const totalEstesMes = gastos.filter((g) => {
        const d = new Date(g.FechaGasto);
        const hoy = new Date();
        return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
    }).reduce((t, g) => t + g.Monto, 0);
    const mayorGasto = gastos.length > 0 ? Math.max(...gastos.map((g) => g.Monto)) : 0;

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
            {/* ── Modal nuevo gasto ── */}
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
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(217,119,6,0.1)" }}>
                                    <Receipt size={18} color="#D97706" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Registrar Salida de Dinero
                                    </h2>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Gasto operativo</p>
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

                        <form onSubmit={registrarGasto} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Concepto o Descripción
                                </label>
                                <input type="text" required placeholder="Ej. Pago recibo de luz"
                                    value={concepto} onChange={(e) => setConcepto(e.target.value)}
                                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Monto (C$)
                                    </label>
                                    <input type="number" step="0.01" required placeholder="0.00"
                                        value={monto} onChange={(e) => setMonto(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        Fecha
                                    </label>
                                    <input type="date" required value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                    Categoría
                                </label>
                                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
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
                                        backgroundColor: "#D97706",
                                        boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
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
                                        <><Plus size={14} />Registrar Gasto</>
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.85)" }}>
                        <DollarSign size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Finanzas</p>
                        <p className="text-blue-300 text-xs mt-0.5">Gastos operativos y caja chica</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={cargarGastos}
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

                {/* ── Mensaje estado ── */}
                {mensaje && (
                    <div
                        className="px-4 py-3 rounded-xl flex items-start gap-3 text-sm animate-slide-down"
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

                {/* ── Stats ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            label: "Total Gastos Acumulados",
                            value: `C$ ${totalGastos.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
                            icon: TrendingDown,
                            color: "#DC2626",
                            bg: "rgba(220,38,38,0.08)",
                            sub: `${gastos.length} registro${gastos.length !== 1 ? "s" : ""}`,
                        },
                        {
                            label: "Gastos Este Mes",
                            value: `C$ ${totalEstesMes.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
                            icon: CalendarDays,
                            color: "#D97706",
                            bg: "rgba(217,119,6,0.08)",
                            sub: new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
                        },
                        {
                            label: "Mayor Gasto Registrado",
                            value: `C$ ${mayorGasto.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
                            icon: Receipt,
                            color: "#7C3AED",
                            bg: "rgba(124,58,237,0.08)",
                            sub: "histórico",
                        },
                    ].map(({ label, value, icon: Icon, color, bg, sub }) => (
                        <div key={label} className="rounded-2xl p-5 flex items-center gap-4"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div>
                                <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                                <p className="text-lg font-bold leading-none" style={{ color }}>{value}</p>
                                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabla ── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>

                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Libro de Gastos</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {gastos.length} movimiento{gastos.length !== 1 ? "s" : ""} registrados
                            </p>
                        </div>
                        <button onClick={() => setMostrarModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 active:scale-95"
                            style={{ backgroundColor: "#D97706", boxShadow: "0 3px 10px rgba(217,119,6,0.25)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B45309")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D97706")}>
                            <Plus size={13} />Registrar Gasto
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(240,244,248,0.6)" }}>
                                    {["Fecha", "Concepto", "Categoría", "Monto"].map((col) => (
                                        <th key={col} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {cargandoTabla ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="animate-spin-fast" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                                </svg>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Cargando contabilidad...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : gastos.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: "rgba(217,119,6,0.08)" }}>
                                                    <DollarSign size={22} color="#D97706" />
                                                </div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Sin gastos registrados</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Registre el primer movimiento</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    gastos.map((gasto, idx) => {
                                        const catColor = CATEGORIA_COLORS[gasto.Categoria] ?? { bg: "rgba(100,116,139,0.1)", color: "#475569" };
                                        const esMayor = gasto.Monto === mayorGasto && mayorGasto > 0;
                                        return (
                                            <tr key={gasto.GastoID}
                                                className="transition-colors duration-150"
                                                style={{ borderBottom: idx < gastos.length - 1 ? "1px solid var(--border)" : "none" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(240,244,248,0.6)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>

                                                {/* Fecha */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <CalendarDays size={13} color="var(--text-muted)" />
                                                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                                                            {formatFecha(gasto.FechaGasto)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Concepto */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: catColor.bg }}>
                                                            <Tag size={12} color={catColor.color} />
                                                        </div>
                                                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                            {gasto.Concepto}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Categoría */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: catColor.bg, color: catColor.color }}>
                                                        {gasto.Categoria}
                                                    </span>
                                                </td>

                                                {/* Monto */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold" style={{ color: "#DC2626" }}>
                                                            − C$ {gasto.Monto.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                                                        </span>
                                                        {esMayor && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                                                style={{ backgroundColor: "rgba(124,58,237,0.1)", color: "#5B21B6" }}>
                                                                mayor
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>

                            {/* Fila de total */}
                            {gastos.length > 0 && (
                                <tfoot>
                                    <tr style={{ borderTop: "2px solid var(--border)", backgroundColor: "rgba(240,244,248,0.8)" }}>
                                        <td colSpan={3} className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                                            style={{ color: "var(--text-muted)" }}>
                                            Total acumulado
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="text-base font-bold" style={{ color: "#DC2626" }}>
                                                − C$ {totalGastos.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}