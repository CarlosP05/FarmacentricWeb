"use client";



import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {

    ShoppingCart, Package, Users, DollarSign,

    BarChart2, ChevronRight, LogOut, Pill,

} from "lucide-react";



type Usuario = { id: number; nombre_usuario: string; rol: string };



interface Modulo {

    key: string;

    titulo: string;

    descripcion: string;

    ruta: string;

    icon: React.ElementType;

    color: string;

    colorBg: string;

    colorBorder: string;

    roles: string[];

    badge: string;

}



const MODULOS: Modulo[] = [

    {

        key: "pos",

        titulo: "Punto de Venta",

        descripcion: "Procese ventas, aplique descuentos y emita comprobantes.",

        ruta: "/pos",

        icon: ShoppingCart,

        color: "#0EA5E9",

        colorBg: "rgba(14,165,233,0.08)",

        colorBorder: "#0EA5E9",

        roles: ["Administrador", "Cajero/Farmacéutico"],

        badge: "POS",

    },

    {
        key: "catalogo",
        titulo: "Catálogo",
        descripcion: "Administre los nombres, categorías y precios base de los medicamentos.",
        ruta: "/catalogo",
        icon: Package,
        color: "#3B82F6",
        colorBg: "rgba(59,130,246,0.08)",
        colorBorder: "#3B82F6",
        roles: ["Administrador", "Cajero/Farmacéutico"],
        badge: "Catálogo",
    },

    {

        key: "inventario",

        titulo: "Inventario",

        descripcion: "Gestione lotes, registre ingresos y controle stock mínimo.",

        ruta: "/inventario",

        icon: Package,

        color: "#059669",

        colorBg: "rgba(5,150,105,0.08)",

        colorBorder: "#059669",

        roles: ["Administrador", "Cajero/Farmacéutico"],

        badge: "Inventario",

    },

    {

        key: "rrhh",

        titulo: "Recursos Humanos",

        descripcion: "Administre empleados, puestos y datos del personal.",

        ruta: "/rrhh",

        icon: Users,

        color: "#7C3AED",

        colorBg: "rgba(124,58,237,0.08)",

        colorBorder: "#7C3AED",

        roles: ["Administrador", "Contador/RRHH"],

        badge: "RRHH",

    },

    {

        key: "finanzas",

        titulo: "Finanzas",

        descripcion: "Registre gastos operativos y lleve la contabilidad diaria.",

        ruta: "/finanzas",

        icon: DollarSign,

        color: "#D97706",

        colorBg: "rgba(217,119,6,0.08)",

        colorBorder: "#D97706",

        roles: ["Administrador", "Contador/RRHH"],

        badge: "Finanzas",

    },

    {

        key: "reportes",

        titulo: "Reportes Gerenciales",

        descripcion: "Consulte el estado de resultados y métricas financieras.",

        ruta: "/reportes",

        icon: BarChart2,

        color: "#0B2447",

        colorBg: "rgba(11,36,71,0.07)",

        colorBorder: "#0B2447",

        roles: ["Administrador"],

        badge: "Solo Admin",

    },

];



function getRolColor(rol: string) {

    if (rol === "Administrador") return { bg: "rgba(14,165,233,0.12)", color: "#0369A1" };

    if (rol === "Cajero/Farmacéutico") return { bg: "rgba(5,150,105,0.12)", color: "#065F46" };

    return { bg: "rgba(124,58,237,0.12)", color: "#5B21B6" };

}



function getFechaActual() {

    return new Date().toLocaleDateString("es-ES", {

        weekday: "long", year: "numeric", month: "long", day: "numeric",

    });

}



function getSaludo() {

    const h = new Date().getHours();

    if (h < 12) return "Buenos días";

    if (h < 19) return "Buenas tardes";

    return "Buenas noches";

}



export default function DashboardPage() {

    const router = useRouter();

    const [usuario, setUsuario] = useState<Usuario | null>(null);

    const [hoveredKey, setHoveredKey] = useState<string | null>(null);



    useEffect(() => {

        const stored = localStorage.getItem("usuario");

        if (!stored) { router.push("/login"); return; }

        setUsuario(JSON.parse(stored));

    }, [router]);



    if (!usuario) return null;



    const modulosVisibles = MODULOS.filter((m) => m.roles.includes(usuario.rol));

    const rolColor = getRolColor(usuario.rol);



    const cerrarSesion = () => {

        localStorage.removeItem("usuario");

        router.push("/login");

    };



    return (

        <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>

            {/* ── Header bar ── */}

            <div className="px-6 py-4 shadow-md" style={{ backgroundColor: "var(--primary)" }}>

                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <div

                            className="w-9 h-9 rounded-xl flex items-center justify-center"

                            style={{ backgroundColor: "var(--accent)" }}

                        >

                            <Pill size={18} color="white" />

                        </div>

                        <div>

                            <p className="text-white font-semibold text-sm leading-none">

                                {getSaludo()}, {usuario.nombre_usuario}

                            </p>

                            <p className="text-blue-300 text-xs mt-0.5 capitalize">{getFechaActual()}</p>

                        </div>

                    </div>



                    <div className="flex items-center gap-3">

                        <span

                            className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold"

                            style={{

                                backgroundColor: rolColor.bg,

                                color: rolColor.color,

                                border: `1px solid ${rolColor.color}30`,

                            }}

                        >

                            {usuario.rol}

                        </span>

                        <button

                            onClick={cerrarSesion}

                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-150 active:scale-95"

                            style={{ backgroundColor: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.3)" }}

                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.35)")}

                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.2)")}

                        >

                            <LogOut size={13} />

                            <span>Salir</span>

                        </button>

                    </div>

                </div>

            </div>



            {/* ── Contenido ── */}

            <div className="max-w-6xl mx-auto px-6 py-10">

                <div className="mb-8">

                    <h1

                        className="text-4xl mb-2"

                        style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}

                    >

                        Panel de Control

                    </h1>

                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>

                        Seleccione un módulo para comenzar a operar

                    </p>

                </div>



                {/* Grid de módulos */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                    {modulosVisibles.map((mod) => {

                        const Icon = mod.icon;

                        const isHovered = hoveredKey === mod.key;

                        return (

                            <button

                                key={mod.key}

                                onClick={() => router.push(mod.ruta)}

                                onMouseEnter={() => setHoveredKey(mod.key)}

                                onMouseLeave={() => setHoveredKey(null)}

                                className="text-left w-full rounded-2xl p-6 transition-all duration-200 active:scale-[0.98]"

                                style={{
                                    backgroundColor: "var(--surface)",
                                    borderTop: `1px solid ${isHovered ? mod.color + "40" : "var(--border)"}`,
                                    borderRight: `1px solid ${isHovered ? mod.color + "40" : "var(--border)"}`,
                                    borderBottom: `1px solid ${isHovered ? mod.color + "40" : "var(--border)"}`,
                                    borderLeft: `4px solid ${mod.colorBorder}`,
                                    boxShadow: isHovered
                                        ? `0 10px 25px -5px ${mod.color}20, 0 4px 10px -5px ${mod.color}15`
                                        : "var(--shadow-sm)",
                                    transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                                }}
                            >

                                <div className="flex items-start justify-between mb-4">

                                    <div

                                        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"

                                        style={{ backgroundColor: isHovered ? mod.color : mod.colorBg }}

                                    >

                                        <Icon size={22} color={isHovered ? "white" : mod.color} strokeWidth={1.75} />

                                    </div>

                                    <div

                                        style={{

                                            opacity: isHovered ? 1 : 0,

                                            transform: isHovered ? "translateX(0)" : "translateX(-4px)",

                                            transition: "all 0.2s",

                                        }}

                                    >

                                        <ChevronRight size={18} color={mod.color} />

                                    </div>

                                </div>



                                <h3

                                    className="font-semibold text-base mb-1"

                                    style={{ color: isHovered ? mod.color : "var(--text-primary)", transition: "color 0.2s" }}

                                >

                                    {mod.titulo}

                                </h3>

                                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>

                                    {mod.descripcion}

                                </p>



                                <span

                                    className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"

                                    style={{ backgroundColor: mod.colorBg, color: mod.color }}

                                >

                                    {mod.badge}

                                </span>

                            </button>

                        );

                    })}

                </div>

            </div>

        </div>

    );

}

