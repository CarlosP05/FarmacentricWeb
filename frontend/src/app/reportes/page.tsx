"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EstadoResultados {
    ingresos: number;
    costo_ventas: number;
    ganancia_bruta: number;
    gastos_operativos: number;
    ganancia_neta: number;
}

export default function ReportesPage() {
    const router = useRouter();
    const [reporte, setReporte] = useState<EstadoResultados | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) {
            router.push("/login");
            return;
        }

        const user = JSON.parse(usuarioGuardado);
        if (user.rol !== "Administrador") {
            alert("Acceso denegado. Solo el Administrador puede ver reportes financieros.");
            router.push("/dashboard");
        } else {
            cargarReporte();
        }
    }, [router]);

    const cargarReporte = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/reportes/estado-resultados");
            if (response.ok) {
                const data = await response.json();
                setReporte(data);
            }
        } catch (error) {
            console.error("Error al cargar reporte:", error);
        } finally {
            setCargando(false);
        }
    };

    const formatoMoneda = (monto: number) => {
        return `C$ ${monto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}`;
    };

    if (cargando) {
        return <div className="flex min-h-screen items-center justify-center"><p className="text-xl font-bold text-slate-600">Calculando métricas de la farmacia...</p></div>;
    }

    // NUEVO: En lugar de devolver 'null' (pantalla blanca), mostramos un mensaje de error claro
    if (!reporte) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8">
                <div className="rounded-xl bg-red-50 p-6 border-l-4 border-red-500 shadow-md">
                    <h3 className="text-xl font-bold text-red-800">⚠️ Error de Conexión</h3>
                    <p className="mt-2 text-red-700">No se pudo obtener el reporte. Asegúrate de que el backend de Python esté encendido y que tenga la ruta de reportes creada.</p>
                    <button onClick={() => router.push("/dashboard")} className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">Volver al Panel</button>
                </div>
            </div>
        );
    }

    const esGanancia = reporte.ganancia_neta >= 0;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-2xl border-t-4 border-slate-800">
                <div className="mb-8 text-center border-b pb-6">
                    <h1 className="text-3xl font-black text-slate-800">📊 Estado de Resultados</h1>
                    <p className="text-slate-500 mt-2">Reporte de Ganancias y Pérdidas (P&L) Consolidado</p>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center rounded-lg bg-blue-50 p-4">
                        <span className="text-lg font-semibold text-blue-900">Ingresos Totales (Ventas)</span>
                        <span className="text-xl font-bold text-blue-700">{formatoMoneda(reporte.ingresos)}</span>
                    </div>

                    <div className="flex justify-between items-center rounded-lg bg-red-50 p-4">
                        <span className="text-lg font-semibold text-red-900">(-) Costo de los Bienes Vendidos</span>
                        <span className="text-xl font-bold text-red-700">- {formatoMoneda(reporte.costo_ventas)}</span>
                    </div>

                    <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 pt-2 px-4">
                        <span className="text-xl font-bold text-slate-700">Ganancia Bruta</span>
                        <span className="text-2xl font-black text-slate-800">{formatoMoneda(reporte.ganancia_bruta)}</span>
                    </div>

                    <div className="flex justify-between items-center rounded-lg bg-amber-50 p-4">
                        <span className="text-lg font-semibold text-amber-900">(-) Gastos Operativos (Finanzas)</span>
                        <span className="text-xl font-bold text-amber-700">- {formatoMoneda(reporte.gastos_operativos)}</span>
                    </div>

                    <div className={`mt-8 flex justify-between items-center rounded-xl p-6 ${esGanancia ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-red-600 text-white shadow-red-200'} shadow-lg`}>
                        <div>
                            <span className="block text-sm font-medium opacity-80 uppercase tracking-wider">Resultado del Ejercicio</span>
                            <span className="text-2xl font-black">{esGanancia ? 'Utilidad Neta (Ganancia)' : 'Pérdida Neta'}</span>
                        </div>
                        <span className="text-4xl font-extrabold tracking-tight">
                            {formatoMoneda(reporte.ganancia_neta)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}