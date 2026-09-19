"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import { User, Lock, Pill, ShieldCheck, Activity, ChevronRight } from "lucide-react";



export default function LoginPage() {

    const router = useRouter();

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        setError("");



        try {

            const res = await fetch("http://127.0.0.1:8000/login", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({ nombre_usuario: username, contrasena: password }),

            });



            const data = await res.json();



            if (!res.ok) {

                setError(data.detail || "Error al iniciar sesión");

            } else {

                localStorage.setItem("usuario", JSON.stringify(data.usuario));

                router.push("/dashboard");

            }

        } catch {

            setError("No se pudo conectar con el servidor. Verifique su conexión.");

        } finally {

            setLoading(false);

        }

    };



    return (

        <div className="min-h-screen flex">

            {/* ── Panel izquierdo — Branding ── */}

            <div

                className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"

                style={{ backgroundColor: "var(--primary)" }}

            >

                {/* Patrón SVG de cruces médicas */}

                <div

                    className="absolute inset-0 opacity-[0.04]"

                    style={{

                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Crect x='17' y='8' width='6' height='24'/%3E%3Crect x='8' y='17' width='24' height='6'/%3E%3C/g%3E%3C/svg%3E")`,

                        backgroundSize: "40px 40px",

                    }}

                />



                {/* Logo */}

                <div className="relative z-10">

                    <div className="flex items-center gap-3 mb-2">

                        <div

                            className="w-10 h-10 rounded-xl flex items-center justify-center"

                            style={{ backgroundColor: "var(--accent)" }}

                        >

                            <Pill size={20} color="white" />

                        </div>

                        <span className="text-white text-xl font-bold tracking-wide">Farmacentric</span>

                    </div>

                    <p className="text-blue-300 text-sm mt-1">Sistema de Gestión Farmacéutica</p>

                </div>



                {/* Headline central */}

                <div className="relative z-10">

                    <h1

                        className="text-white text-5xl leading-tight mb-6"

                        style={{ fontFamily: "var(--font-display), Georgia, serif" }}

                    >

                        Gestión inteligente para su farmacia

                    </h1>

                    <p className="text-blue-200 text-base leading-relaxed max-w-sm">

                        Control total de inventario, ventas, recursos humanos y finanzas en una sola plataforma segura.

                    </p>



                    <div className="mt-10 space-y-4">

                        {[

                            { icon: ShieldCheck, label: "Acceso por roles y permisos" },

                            { icon: Activity, label: "Inventario con alertas en tiempo real" },

                            { icon: ChevronRight, label: "Reportes financieros automáticos" },

                        ].map(({ icon: Icon, label }) => (

                            <div key={label} className="flex items-center gap-3">

                                <div

                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"

                                    style={{ backgroundColor: "rgba(14,165,233,0.15)" }}

                                >

                                    <Icon size={16} color="#7DD3FC" />

                                </div>

                                <span className="text-blue-100 text-sm">{label}</span>

                            </div>

                        ))}

                    </div>

                </div>



                {/* Footer */}

                <div className="relative z-10">

                    <p className="text-blue-400 text-xs">

                        © {new Date().getFullYear()} Farmacentric · Todos los derechos reservados

                    </p>

                </div>

            </div>



            {/* ── Panel derecho — Formulario ── */}

            <div

                className="flex-1 flex items-center justify-center p-6 sm:p-12"

                style={{ backgroundColor: "var(--background)" }}

            >

                <div className="w-full max-w-md animate-fade-in">

                    {/* Logo solo en móvil */}

                    <div className="flex items-center gap-2 mb-8 lg:hidden">

                        <div

                            className="w-8 h-8 rounded-lg flex items-center justify-center"

                            style={{ backgroundColor: "var(--primary)" }}

                        >

                            <Pill size={16} color="white" />

                        </div>

                        <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>Farmacentric</span>

                    </div>



                    <div className="mb-8">

                        <h2

                            className="text-3xl mb-2"

                            style={{

                                fontFamily: "var(--font-display), Georgia, serif",

                                color: "var(--text-primary)",

                            }}

                        >

                            Bienvenido de vuelta

                        </h2>

                        <p style={{ color: "var(--text-muted)" }} className="text-sm">

                            Ingrese sus credenciales para acceder al sistema

                        </p>

                    </div>



                    {/* Error banner */}

                    {error && (

                        <div

                            className="mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-slide-down"

                            style={{

                                backgroundColor: "#FEF2F2",

                                border: "1px solid #FECACA",

                                color: "#991B1B",

                            }}

                        >

                            <span className="mt-0.5 flex-shrink-0">⚠</span>

                            <span>{error}</span>

                        </div>

                    )}



                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Usuario */}

                        <div>

                            <label

                                className="block text-sm font-medium mb-1.5"

                                style={{ color: "var(--text-primary)" }}

                            >

                                Usuario

                            </label>

                            <div className="relative">

                                <div

                                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"

                                    style={{ color: "var(--text-muted)" }}

                                >

                                    <User size={16} />

                                </div>

                                <input

                                    type="text"

                                    value={username}

                                    onChange={(e) => setUsername(e.target.value)}

                                    placeholder="Nombre de usuario"

                                    required

                                    autoComplete="username"

                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"

                                    style={{

                                        border: "1.5px solid var(--border)",

                                        backgroundColor: "var(--surface)",

                                        color: "var(--text-primary)",

                                    }}

                                    onFocus={(e) => {

                                        e.target.style.borderColor = "var(--accent)";

                                        e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";

                                    }}

                                    onBlur={(e) => {

                                        e.target.style.borderColor = "var(--border)";

                                        e.target.style.boxShadow = "none";

                                    }}

                                />

                            </div>

                        </div>



                        {/* Contraseña */}

                        <div>

                            <label

                                className="block text-sm font-medium mb-1.5"

                                style={{ color: "var(--text-primary)" }}

                            >

                                Contraseña

                            </label>

                            <div className="relative">

                                <div

                                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"

                                    style={{ color: "var(--text-muted)" }}

                                >

                                    <Lock size={16} />

                                </div>

                                <input

                                    type="password"

                                    value={password}

                                    onChange={(e) => setPassword(e.target.value)}

                                    placeholder="••••••••"

                                    required

                                    autoComplete="current-password"

                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"

                                    style={{

                                        border: "1.5px solid var(--border)",

                                        backgroundColor: "var(--surface)",

                                        color: "var(--text-primary)",

                                    }}

                                    onFocus={(e) => {

                                        e.target.style.borderColor = "var(--accent)";

                                        e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)";

                                    }}

                                    onBlur={(e) => {

                                        e.target.style.borderColor = "var(--border)";

                                        e.target.style.boxShadow = "none";

                                    }}

                                />

                            </div>

                        </div>



                        {/* Botón */}

                        <button

                            type="submit"

                            disabled={loading}

                            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-95 mt-2"

                            style={{

                                backgroundColor: loading ? "#38BDF8" : "var(--accent)",

                                boxShadow: loading ? "none" : "0 4px 14px rgba(14,165,233,0.35)",

                                cursor: loading ? "not-allowed" : "pointer",

                            }}

                            onMouseEnter={(e) => {

                                if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-dark)";

                            }}

                            onMouseLeave={(e) => {

                                if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent)";

                            }}

                        >

                            {loading ? (

                                <>

                                    <svg

                                        className="animate-spin-fast"

                                        width="16"

                                        height="16"

                                        viewBox="0 0 24 24"

                                        fill="none"

                                        stroke="currentColor"

                                        strokeWidth="2.5"

                                    >

                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />

                                    </svg>

                                    Verificando...

                                </>

                            ) : (

                                <>Ingresar al sistema</>

                            )}

                        </button>

                    </form>



                    <p className="text-center text-xs mt-8" style={{ color: "var(--text-muted)" }}>

                        Acceso restringido a personal autorizado

                    </p>

                </div>

            </div>

        </div>

    );

}