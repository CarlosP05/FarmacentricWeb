"use client";



import { useEffect, useState } from "react";

import { useRouter, usePathname } from "next/navigation";

import Link from "next/link";

import { Pill, ShoppingCart, Package, Users, DollarSign, BarChart2, LogOut, Tag } from "lucide-react";



export default function Navbar() {

    const router = useRouter();

    const pathname = usePathname();

    const [usuario, setUsuario] = useState<{ nombre_usuario: string; rol: string } | null>(null);



    useEffect(() => {

        const stored = localStorage.getItem("usuario");

        setUsuario(stored ? JSON.parse(stored) : null);

    }, [pathname]);



    if (pathname === "/login" || pathname === "/" || !usuario) return null;



    const esAdmin = usuario.rol === "Administrador";

    const esCajero = usuario.rol === "Cajero/Farmacéutico";

    const esRRHH = usuario.rol === "Contador/RRHH";



    const cerrarSesion = () => {

        localStorage.removeItem("usuario");

        setUsuario(null);

        router.push("/login");

    };



    const navLinks = [

        { href: "/pos", label: "POS", icon: ShoppingCart, visible: esAdmin || esCajero },

        { href: "/inventario", label: "Inventario", icon: Package, visible: esAdmin || esCajero },

        { href: "/catalogo", label: "Catálogo", icon: Tag, visible: esAdmin || esCajero },

        { href: "/rrhh", label: "RRHH", icon: Users, visible: esAdmin || esRRHH },

        { href: "/finanzas", label: "Finanzas", icon: DollarSign, visible: esAdmin || esRRHH },

        { href: "/reportes", label: "Reportes", icon: BarChart2, visible: esAdmin },

    ].filter((l) => l.visible);



    return (

        <nav className="px-6 shadow-lg" style={{ backgroundColor: "var(--primary)" }}>

            <div className="mx-auto max-w-7xl flex items-center justify-between h-14">

                <div className="flex items-center gap-6">

                    <Link

                        href="/dashboard"

                        className="flex items-center gap-2 text-white font-bold tracking-wide transition-opacity duration-150 hover:opacity-80"

                    >

                        <div

                            className="w-7 h-7 rounded-lg flex items-center justify-center"

                            style={{ backgroundColor: "var(--accent)" }}

                        >

                            <Pill size={14} color="white" />

                        </div>

                        <span className="text-sm">Farmacentric</span>

                    </Link>



                    <div className="hidden md:flex items-center gap-1">

                        {navLinks.map(({ href, label, icon: Icon }) => {

                            const active = pathname === href;

                            return (

                                <Link

                                    key={href}

                                    href={href}

                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"

                                    style={{

                                        color: active ? "white" : "rgba(186,230,255,0.75)",

                                        backgroundColor: active ? "rgba(14,165,233,0.2)" : "transparent",

                                    }}

                                    onMouseEnter={(e) => {

                                        if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.08)";

                                    }}

                                    onMouseLeave={(e) => {

                                        if (!active) (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";

                                    }}

                                >

                                    <Icon size={13} strokeWidth={2} />

                                    {label}

                                </Link>

                            );

                        })}

                    </div>

                </div>



                <div className="flex items-center gap-3">

                    <div className="hidden sm:block text-right">

                        <p className="text-white text-xs font-semibold leading-none">{usuario.nombre_usuario}</p>

                        <p className="text-blue-300 text-[10px] mt-0.5">{usuario.rol}</p>

                    </div>

                    <button

                        onClick={cerrarSesion}

                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"

                        style={{ backgroundColor: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)" }}

                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.35)")}

                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.2)")}

                    >

                        <LogOut size={13} />

                        <span className="hidden sm:inline">Salir</span>

                    </button>

                </div>

            </div>

        </nav>

    );

}

