"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart2, ArrowLeft, RefreshCw, TrendingUp, TrendingDown,
    DollarSign, ShoppingBag, Minus, AlertCircle, PieChart as PieChartIcon, Activity
} from "lucide-react";
// Importamos los componentes de Recharts
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface EstadoResultados {
    ingresos: number;
    costo_ventas: number;
    ganancia_bruta: number;
    gastos_operativos: number;
    ganancia_neta: number;
}

interface VentaDia { fecha: string; total: number; }
interface GastoCategoria { name: string; value: number; }

function fmt(n: number) {
    return `C$ ${n.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
}

// Colores profesionales para el gráfico de "dona"
const COLORES_PIE = ['#0EA5E9', '#059669', '#D97706', '#7C3AED', '#DC2626', '#475569'];

export default function ReportesPage() {
    const router = useRouter();
    const [reporte, setReporte] = useState<EstadoResultados | null>(null);
    const [ventasSemana, setVentasSemana] = useState<VentaDia[]>([]);
    const [gastosDist, setGastosDist] = useState<GastoCategoria[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const cargarDashboard = async () => {
        setCargando(true);
        setError("");
        try {
            const [resReporte, resVentas, resGastos] = await Promise.all([
                fetch("http://127.0.0.1:8000/reportes/estado-resultados"),
                fetch("http://127.0.0.1:8000/reportes/ventas-semana"),
                fetch("http://127.0.0.1:8000/reportes/gastos-distribucion")
            ]);

            if (resReporte.ok && resVentas.ok && resGastos.ok) {
                setReporte(await resReporte.json());

                // Formatear las fechas para que se vean amigables (ej: "Lun 12")
                const ventasCrudas = await resVentas.json();
                const ventasFormateadas = ventasCrudas.map((v: VentaDia) => {
                    const fechaObj = new Date(v.fecha + "T00:00:00");
                    const diaCorto = new Intl.DateTimeFormat('es-NI', { weekday: 'short', day: 'numeric' }).format(fechaObj);
                    return { fecha: diaCorto.charAt(0).toUpperCase() + diaCorto.slice(1), total: v.total };
                });
                setVentasSemana(ventasFormateadas);
                setGastosDist(await resGastos.json());
            } else {
                setError("El servidor devolvió un error al cargar las gráficas.");
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
        cargarDashboard();
    }, [router]);

    const esGanancia = reporte ? reporte.ganancia_neta >= 0 : false;
    const margenBruto = reporte && reporte.ingresos > 0 ? ((reporte.ganancia_bruta / reporte.ingresos) * 100).toFixed(1) : "0.0";
    const margenNeto = reporte && reporte.ingresos > 0 ? ((reporte.ganancia_neta / reporte.ingresos) * 100).toFixed(1) : "0.0";

    return (
        <div className="min-h-screen flex flex-col pb-10" style={{ backgroundColor: "var(--background)" }}>
            {/* ── Header ── */}
            <div className="px-6 py-3 shadow-md flex items-center justify-between" style={{ backgroundColor: "var(--primary)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(100,116,139,0.7)" }}>
                        <BarChart2 size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Panel de Inteligencia de Negocios</p>
                        <p className="text-blue-300 text-xs mt-0.5">Métricas Avanzadas · Solo Administrador</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={cargarDashboard}
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

            <div className="max-w-6xl mx-auto w-full px-6 py-8 flex flex-col gap-6 animate-fade-in">

                {/* Título de la sección */}
                <div className="mb-2">
                    <h1 className="text-4xl mb-1" style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}>
                        Dashboard Ejecutivo
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Visualice el rendimiento financiero y operativo en tiempo real.
                    </p>
                </div>

                {cargando && (
                    <div className="flex items-center justify-center py-20 gap-3">
                        <svg className="animate-spin-fast" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Generando visualizaciones...</span>
                    </div>
                )}

                {!cargando && error && (
                    <div className="rounded-2xl p-6 flex items-start gap-4" style={{ backgroundColor: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(220,38,38,0.1)" }}>
                            <AlertCircle size={20} color="#DC2626" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm mb-1" style={{ color: "#991B1B" }}>Error de conexión</p>
                            <p className="text-sm" style={{ color: "#B91C1C" }}>{error}</p>
                            <button onClick={cargarDashboard} className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-95" style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#DC2626" }}>Reintentar</button>
                        </div>
                    </div>
                )}

                {!cargando && reporte && (
                    <>
                        {/* ── 1. GRÁFICAS (NUEVO) ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Gráfico de Líneas: Ventas */}
                            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity size={18} color="var(--accent)" />
                                    <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Tendencia de Ventas (Últimos 7 días)</h3>
                                </div>
                                <div style={{ width: '100%', height: 280 }}>
                                    {ventasSemana.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-sm text-gray-400">No hay ventas recientes.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={ventasSemana} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`C$ ${Number(value).toFixed(2)}`, 'Ventas']}
                                                />
                                                <Line type="monotone" dataKey="total" stroke="var(--accent)" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: 'var(--surface)' }} activeDot={{ r: 6, fill: 'var(--accent)' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Gráfico de Dona: Gastos */}
                            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChartIcon size={18} color="#D97706" />
                                    <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Distribución de Gastos Operativos</h3>
                                </div>
                                <div style={{ width: '100%', height: 280 }}>
                                    {gastosDist.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-sm text-gray-400">No hay gastos registrados.</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={gastosDist}
                                                    cx="50%" cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {gastosDist.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [`C$ ${Number(value).toFixed(2)}`, 'Total']}
                                                />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── 2. KPIS Y ESTADO DE RESULTADOS ── */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(14,165,233,0.08)" }}>
                                    <TrendingUp size={20} color="#0369A1" />
                                </div>
                                <div>
                                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Margen de Ganancia Bruta</p>
                                    <p className="text-2xl font-bold" style={{ color: "#0369A1" }}>{margenBruto}%</p>
                                </div>
                            </div>
                            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: esGanancia ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)" }}>
                                    <DollarSign size={20} color={esGanancia ? "#059669" : "#DC2626"} />
                                </div>
                                <div>
                                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Margen de Rentabilidad Neta</p>
                                    <p className="text-2xl font-bold" style={{ color: esGanancia ? "#059669" : "#DC2626" }}>{margenNeto}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden mt-2" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
                            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(14,165,233,0.1)" }}>
                                        <ShoppingBag size={16} color="#0369A1" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Ingresos Totales</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Ventas acumuladas</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#0369A1" }}>{fmt(reporte.ingresos)}</p>
                            </div>

                            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(220,38,38,0.02)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(220,38,38,0.08)" }}>
                                        <Minus size={16} color="#DC2626" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Costo de Bienes Vendidos</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Precio de compra × unidades vendidas</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#DC2626" }}>− {fmt(reporte.costo_ventas)}</p>
                            </div>

                            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "2px solid var(--border)", backgroundColor: "rgba(11,36,71,0.03)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(11,36,71,0.07)" }}>
                                        <TrendingUp size={16} color="var(--primary)" />
                                    </div>
                                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Ganancia Bruta</p>
                                </div>
                                <p className="text-xl font-extrabold" style={{ color: "var(--primary)" }}>{fmt(reporte.ganancia_bruta)}</p>
                            </div>

                            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(217,119,6,0.02)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(217,119,6,0.08)" }}>
                                        <TrendingDown size={16} color="#D97706" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Gastos Operativos</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nómina, servicios, insumos</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold" style={{ color: "#D97706" }}>− {fmt(reporte.gastos_operativos)}</p>
                            </div>

                            <div className="px-6 py-6 flex items-center justify-between" style={{ background: esGanancia ? "linear-gradient(135deg, #064E3B 0%, #065F46 100%)" : "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)" }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                                        {esGanancia ? <TrendingUp size={24} color="white" /> : <TrendingDown size={24} color="white" />}
                                    </div>
                                    <div>
                                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Resultado del Ejercicio</p>
                                        <p className="text-white font-bold text-lg">{esGanancia ? "Utilidad Neta" : "Pérdida Neta"}</p>
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-white tracking-tight">{fmt(reporte.ganancia_neta)}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}