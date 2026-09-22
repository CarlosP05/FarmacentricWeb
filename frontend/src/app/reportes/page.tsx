"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart2,
    ArrowLeft,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag,
    Minus,
    AlertCircle,
} from "lucide-react";

interface EstadoResultados {
    ingresos: number;
    costo_ventas: number;
    ganancia_bruta: number;
    gastos_operativos: number;
    ganancia_neta: number;
}

function fmt(n: number) {
    return `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
}

export default function ReportesPage() {
    const router = useRouter();
    const [reporte, setReporte] = useState<EstadoResultados | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarReporte = async () => {
        setCargando(true);
        setError("");
        try {
            const res = await fetch("http://127.0.0.1:8000/reportes/estado-resultados");
            if (res.ok) {
                setReporte(await res.json());
            } else {
                setError("El servidor devolvió un error. Verifique el backend.");
            }
        } catch {
            setError("No se pudo conectar con el servidor. Asegúrese de que el backend esté activo.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) { router.push("/login"); return; }
        const user = JSON.parse(stored);
        if (user.rol !== "Administrador") { router.push("/dashboard"); return; }
        cargarReporte();
    }, [router]);

    const esGanancia = reporte ? reporte.ganancia_neta >= 0 : false;
    const margenBruto = reporte && reporte.ingresos > 0
        ? ((reporte.ganancia_bruta / reporte.ingresos) * 100).toFixed(1)
        : "0.0";
    const margenNeto = reporte && reporte.ingresos > 0
        ? ((reporte.ganancia_neta / reporte.ingresos) * 100).toFixed(1)
        : "0.0";

    return (
        <div className="min-h-screen flex flex-col">

            {/* ── Header ── */}
            <div className="px-6 py-3 shadow-md flex items-center justify-between" style={{ backgroundColor: "var(--primary)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "rgba(100,116,139,0.7)" }}>
                        <BarChart2 size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Reportes Gerenciales</p>
                        <p className="text-blue-300 text-xs mt-0.5">Estado de Resultados · Solo Administrador</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={cargarReporte}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"
                        style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}>
                        <RefreshCw size={12} />Recalcular
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

            <div className="max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

                {/* Título */}
                <div>
                    <h1 className="text-4xl mb-1"
                        style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}>
                        Estado de Resultados
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Reporte consolidado de Ganancias y Pérdidas (P&L)
                    </p>
                </div>

                {/* Cargando */}
                {cargando && (
                    <div className="flex items-center justify-center py-20 gap-3">
                        <svg className="animate-spin-fast" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span className="text-sm" style={{ color: "var(--text-muted)" }}>Calculando métricas financieras...</span>
                    </div>
                )}

                {/* Error */}
                {!cargando && error && (
                    <div className="rounded-2xl p-6 flex items-start gap-4 animate-slide-down"
                        style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>
                            <AlertCircle size={20} color="#DC2626" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm mb-1" style={{ color: "#991B1B" }}>Error de conexión</p>
                            <p className="text-sm" style={{ color: "#B91C1C" }}>{error}</p>
                            <button onClick={cargarReporte}
                                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95"
                                style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {/* Reporte */}
                {!cargando && reporte && (
                    <>
                        {/* KPIs rápidos */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl p-4 flex items-center gap-3"
                                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(14,165,233,0.08)" }}>
                                    <TrendingUp size={18} color="#0369A1" />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Margen Bruto</p>
                                    <p className="text-xl font-bold" style={{ color: "#0369A1" }}>{margenBruto}%</p>
                                </div>
                            </div>
                            <div className="rounded-2xl p-4 flex items-center gap-3"
                                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: esGanancia ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)" }}>
                                    <DollarSign size={18} color={esGanancia ? "#059669" : "#DC2626"} />
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Margen Neto</p>
                                    <p className="text-xl font-bold" style={{ color: esGanancia ? "#059669" : "#DC2626" }}>
                                        {margenNeto}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Estado de resultados */}
                        <div className="rounded-2xl overflow-hidden"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>

                            {/* Ingresos */}
                            <div className="px-6 py-5 flex items-center justify-between"
                                style={{ borderBottom: "1px solid var(--border)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(14,165,233,0.1)" }}>
                                        <ShoppingBag size={16} color="#0369A1" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            Ingresos Totales
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ventas acumuladas</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#0369A1" }}>{fmt(reporte.ingresos)}</p>
                            </div>

                            {/* Costo ventas */}
                            <div className="px-6 py-5 flex items-center justify-between"
                                style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(220,38,38,0.02)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(220,38,38,0.08)" }}>
                                        <Minus size={16} color="#DC2626" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            Costo de Bienes Vendidos
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Precio de compra × unidades vendidas</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#DC2626" }}>
                                    − {fmt(reporte.costo_ventas)}
                                </p>
                            </div>

                            {/* Ganancia bruta */}
                            <div className="px-6 py-5 flex items-center justify-between"
                                style={{ borderBottom: "2px solid var(--border)", backgroundColor: "rgba(11,36,71,0.03)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(11,36,71,0.07)" }}>
                                        <TrendingUp size={16} color="var(--primary)" />
                                    </div>
                                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Ganancia Bruta
                                    </p>
                                </div>
                                <p className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>
                                    {fmt(reporte.ganancia_bruta)}
                                </p>
                            </div>

                            {/* Gastos operativos */}
                            <div className="px-6 py-5 flex items-center justify-between"
                                style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(217,119,6,0.02)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(217,119,6,0.08)" }}>
                                        <TrendingDown size={16} color="#D97706" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            Gastos Operativos
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nómina, servicios, insumos</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#D97706" }}>
                                    − {fmt(reporte.gastos_operativos)}
                                </p>
                            </div>

                            {/* Resultado neto */}
                            <div
                                className="px-6 py-6 flex items-center justify-between"
                                style={{
                                    background: esGanancia
                                        ? "linear-gradient(135deg, #064E3B 0%, #065F46 100%)"
                                        : "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                                        {esGanancia
                                            ? <TrendingUp size={20} color="white" />
                                            : <TrendingDown size={20} color="white" />}
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                            Resultado del Ejercicio
                                        </p>
                                        <p className="text-white font-bold text-base">
                                            {esGanancia ? "Utilidad Neta" : "Pérdida Neta"}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-3xl font-extrabold text-white tracking-tight">
                                    {fmt(reporte.ganancia_neta)}
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}