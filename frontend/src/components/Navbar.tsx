"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [usuario, setUsuario] = useState<{ nombre_usuario: string; rol: string } | null>(null);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            setUsuario(JSON.parse(usuarioGuardado));
        } else {
            setUsuario(null);
        }
    }, [pathname]);

    if (pathname === "/login" || pathname === "/" || !usuario) {
        return null;
    }

    const esAdmin = usuario.rol === "Administrador";
    const esCajero = usuario.rol === "Cajero/Farmacéutico";
    const esRRHH = usuario.rol === "Contador/RRHH";

    const cerrarSesion = () => {
        localStorage.removeItem("usuario");
        setUsuario(null);
        router.push("/login");
    };

    return (
        <nav className="bg-slate-900 px-6 py-4 shadow-lg text-white">
            <div className="mx-auto max-w-7xl flex items-center justify-between">

                <div className="flex items-center space-x-8">
                    <Link href="/dashboard" className="text-xl font-extrabold tracking-wide text-blue-400 hover:text-blue-300">
                        🏥 Farmacentric
                    </Link>

                    <div className="hidden md:flex space-x-2">
                        {(esAdmin || esCajero) && (
                            <Link href="/pos" className={`px-3 py-2 rounded-md font-medium transition ${pathname === '/pos' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                🛒 POS
                            </Link>
                        )}

                        {(esAdmin || esCajero) && (
                            <Link href="/inventario" className={`px-3 py-2 rounded-md font-medium transition ${pathname === '/inventario' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                📦 Inventario
                            </Link>
                        )}

                        {(esAdmin || esRRHH) && (
                            <Link href="/rrhh" className={`px-3 py-2 rounded-md font-medium transition ${pathname === '/rrhh' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                👥 RRHH
                            </Link>
                        )}

                        {(esAdmin || esRRHH) && (
                            <Link href="/finanzas" className={`px-3 py-2 rounded-md font-medium transition ${pathname === '/finanzas' ? 'bg-amber-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                💰 Finanzas
                            </Link>
                        )}

                        {/* 📊 NUEVO BOTÓN DE REPORTES */}
                        {esAdmin && (
                            <Link href="/reportes" className={`px-3 py-2 rounded-md font-medium transition ${pathname === '/reportes' ? 'bg-slate-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}`}>
                                📊 Reportes
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold leading-none">{usuario.nombre_usuario}</p>
                        <p className="text-xs text-gray-400 mt-1">{usuario.rol}</p>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="ml-4 rounded bg-red-600/90 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-red-500"
                    >
                        Salir
                    </button>
                </div>

            </div>
        </nav>
    );
}