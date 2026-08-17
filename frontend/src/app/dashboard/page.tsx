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

    const cerrarSesion = () => {
        localStorage.removeItem("usuario");
        router.push("/login");
    };

    if (!usuario) return <div className="flex min-h-screen items-center justify-center bg-gray-50"><p className="text-black text-xl">Cargando sistema...</p></div>;

    // 🔐 LÓGICA DE SEGURIDAD: Identificamos el rol del usuario actual
    const esAdmin = usuario.rol === "Administrador";
    const esCajero = usuario.rol === "Cajero/Farmacéutico";
    const esRRHH = usuario.rol === "Contador/RRHH";

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-md">

                {/* Barra superior del Dashboard */}
                <div className="mb-8 flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-blue-800">Panel de Control Farmacentric</h1>
                        <p className="mt-1 text-gray-600">
                            Bienvenido, <span className="font-bold text-black">{usuario.nombre_usuario}</span>
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                            Rol: {usuario.rol}
                        </span>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                <h2 className="mb-4 text-lg font-semibold text-gray-700">Tus Módulos de Acceso</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* 🛒 POS: Solo visible para Administrador y Cajero */}
                    {(esAdmin || esCajero) && (
                        <div
                            onClick={() => router.push("/pos")}
                            className="cursor-pointer rounded-lg border bg-blue-50 p-6 transition hover:shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-blue-800">🛒 Punto de Venta (POS)</h3>
                            <p className="mt-2 text-sm text-gray-600">Registrar nuevas ventas, cobrar y emitir tickets.</p>
                        </div>
                    )}

                    {/* 📦 INVENTARIO: Solo visible para Administrador y Cajero */}
                    {(esAdmin || esCajero) && (
                        <div
                            onClick={() => router.push("/inventario")}
                            className="cursor-pointer rounded-lg border bg-emerald-50 p-6 transition hover:shadow-lg"
                        >
                            <h3 className="text-xl font-bold text-emerald-800">📦 Inventario</h3>
                            <p className="mt-2 text-sm text-gray-600">Control de Lotes, caducidades y alertas de stock.</p>
                        </div>
                    )}

                    {/* 👥 RECURSOS HUMANOS: Solo visible para Administrador y Contador/RRHH */}
                    {(esAdmin || esRRHH) && (
                        <div className="cursor-pointer rounded-lg border bg-purple-50 p-6 transition hover:shadow-lg">
                            <h3 className="text-xl font-bold text-purple-800">👥 Recursos Humanos</h3>
                            <p className="mt-2 text-sm text-gray-600">Gestión de empleados, accesos y nómina.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}