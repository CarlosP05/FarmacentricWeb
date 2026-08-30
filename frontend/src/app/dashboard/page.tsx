"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<{ nombre_usuario: string; rol: string } | null>(null);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            router.push("/login");
        }
    }, [router]);

    if (!usuario) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-black text-xl">Cargando sistema...</p></div>;

    const esAdmin = usuario.rol === "Administrador";
    const esCajero = usuario.rol === "Cajero/Farmacéutico";
    const esRRHH = usuario.rol === "Contador/RRHH";

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-6xl rounded-lg bg-white p-6 shadow-md">

                <div className="mb-8 flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-800">Panel de Control Farmacentric</h1>
                        <p className="mt-1 text-gray-600">
                            Bienvenido, <span className="font-bold text-black">{usuario.nombre_usuario}</span>
                        </p>
                    </div>
                </div>

                <h2 className="mb-4 text-lg font-semibold text-gray-700">Tus Módulos de Acceso</h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(esAdmin || esCajero) && (
                        <div onClick={() => router.push("/pos")} className="cursor-pointer rounded-lg border bg-blue-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-blue-800">🛒 Punto de Venta (POS)</h3>
                            <p className="mt-2 text-sm text-gray-600">Registrar nuevas ventas, cobrar y emitir tickets.</p>
                        </div>
                    )}
                    {(esAdmin || esCajero) && (
                        <div onClick={() => router.push("/inventario")} className="cursor-pointer rounded-lg border bg-emerald-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-emerald-800">📦 Inventario</h3>
                            <p className="mt-2 text-sm text-gray-600">Control de Lotes, caducidades y alertas de stock.</p>
                        </div>
                    )}
                    {(esAdmin || esRRHH) && (
                        <div onClick={() => router.push("/rrhh")} className="cursor-pointer rounded-lg border bg-purple-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-purple-800">👥 Recursos Humanos</h3>
                            <p className="mt-2 text-sm text-gray-600">Gestión de empleados, accesos y nómina.</p>
                        </div>
                    )}
                    {(esAdmin || esRRHH) && (
                        <div onClick={() => router.push("/finanzas")} className="cursor-pointer rounded-lg border bg-amber-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-amber-800">💰 Finanzas</h3>
                            <p className="mt-2 text-sm text-gray-600">Registro de gastos operativos, nómina y caja chica.</p>
                        </div>
                    )}

                    {/* 5. TARJETA NUEVA DE REPORTES */}
                    {esAdmin && (
                        <div onClick={() => router.push("/reportes")} className="cursor-pointer rounded-lg border bg-slate-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-slate-800">📊 Reportes y P&L</h3>
                            <p className="mt-2 text-sm text-gray-600">Estado de resultados, ganancias y pérdidas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}