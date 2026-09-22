"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    ArrowLeft,
    Plus,
    RefreshCw,
    XCircle,
    CheckCircle,
    UserCheck,
    Wallet,
    Briefcase,
    BadgeCheck,
} from "lucide-react";

interface Empleado {
    EmpleadoID: number;
    Nombre?: string;
    Apellido?: string;
    NombreCompleto?: string;
    Cedula: string;
    Puesto: string;
    SalarioBase: number;
    FechaContratacion: string;
    Activo: boolean;
    UsuarioSistema: string;
}

type MensajeEstado = { tipo: "exito" | "error"; texto: string } | null;

const PUESTOS = [
    "Cajero/Farmacéutico",
    "Contador/RRHH",
    "Gerente General",
    "Bodeguero",
];

const PUESTO_COLORS: Record<string, { bg: string; color: string }> = {
    "Cajero/Farmacéutico": { bg: "rgba(14,165,233,0.1)", color: "#0369A1" },
    "Contador/RRHH": { bg: "rgba(217,119,6,0.1)", color: "#92400E" },
    "Gerente General": { bg: "rgba(11,36,71,0.08)", color: "#0B2447" },
    "Bodeguero": { bg: "rgba(5,150,105,0.1)", color: "#065F46" },
};

const AVATAR_COLORS = [
    { bg: "rgba(14,165,233,0.15)", color: "#0369A1" },
    { bg: "rgba(124,58,237,0.15)", color: "#5B21B6" },
    { bg: "rgba(5,150,105,0.15)", color: "#065F46" },
    { bg: "rgba(217,119,6,0.15)", color: "#92400E" },
    { bg: "rgba(220,38,38,0.12)", color: "#991B1B" },
];

function formatFecha(fechaStr: string) {
    if (!fechaStr) return "N/A";
    return new Date(fechaStr).toLocaleDateString("es-ES", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

export default function RRHHPage() {
    const router = useRouter();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [cargandoTabla, setCargandoTabla] = useState(true);
    const [cargandoForm, setCargandoForm] = useState(false);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState<MensajeEstado>(null);

    const [usuarioId, setUsuarioId] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [cedula, setCedula] = useState("");
    const [puesto, setPuesto] = useState(PUESTOS[0]);
    const [fechaContratacion, setFechaContratacion] = useState("");
    const [salarioBase, setSalarioBase] = useState("");

    const cargarEmpleados = async () => {
        setCargandoTabla(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/empleados");
            if (res.ok) setEmpleados(await res.json());
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
            router.push("/dashboard");
            return;
        }
        cargarEmpleados();
    }, [router]);

    const resetForm = () => {
        setUsuarioId(""); setNombre(""); setApellido("");
        setCedula(""); setPuesto(PUESTOS[0]);
        setFechaContratacion(""); setSalarioBase("");
    };

    const registrarEmpleado = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargandoForm(true);
        setMensaje(null);

        try {
            const res = await fetch("http://127.0.0.1:8000/empleados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: parseInt(usuarioId),
                    nombre,
                    apellido,
                    cedula,
                    puesto,
                    fecha_contratacion: fechaContratacion,
                    salario_base: parseFloat(salarioBase),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMensaje({ tipo: "exito", texto: data.mensaje });
                setMostrarModal(false);
                resetForm();
                cargarEmpleados();
            } else {
                setMensaje({ tipo: "error", texto: data.detail || "No se pudo registrar el empleado." });
            }
        } catch {
            setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
        } finally {
            setCargandoForm(false);
        }
    };

    const totalEmpleados = empleados.length;
    const activos = empleados.filter((e) => e.Activo).length;
    const nominaTotal = empleados.reduce((s, e) => s + (e.SalarioBase || 0), 0);

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

            {/* ── Modal nuevo empleado ── */}
            {mostrarModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(11,36,71,0.55)", backdropFilter: "blur(4px)" }}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl p-6 animate-slide-down"
                        style={{ backgroundColor: "var(--surface)", boxShadow: "var(--shadow-xl)" }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: "rgba(124,58,237,0.1)" }}
                                >
                                    <Users size={18} color="#7C3AED" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                        Registrar Nuevo Empleado
                                    </h2>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Expediente de personal
                                    </p>
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

                        <form onSubmit={registrarEmpleado} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Nombres</label>
                                    <input type="text" required placeholder="Carlos" value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Apellidos</label>
                                    <input type="text" required placeholder="Pérez" value={apellido}
                                        onChange={(e) => setApellido(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Cédula de Identidad</label>
                                    <input type="text" required placeholder="000-000000-0000A" value={cedula}
                                        onChange={(e) => setCedula(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
                                        ID de Usuario (Sistema)
                                    </label>
                                    <input type="number" required placeholder="Ej. 4" value={usuarioId}
                                        onChange={(e) => setUsuarioId(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Cargo / Puesto</label>
                                    <select value={puesto} onChange={(e) => setPuesto(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                                        {PUESTOS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Salario Base (C$)</label>
                                    <input type="number" step="0.01" required placeholder="0.00" value={salarioBase}
                                        onChange={(e) => setSalarioBase(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>Contratación</label>
                                    <input type="date" required value={fechaContratacion}
                                        onChange={(e) => setFechaContratacion(e.target.value)}
                                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                                </div>
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
                                        backgroundColor: "#7C3AED",
                                        boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
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
                                        <><Plus size={14} />Registrar Empleado</>
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
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(124,58,237,0.85)" }}>
                        <Users size={16} color="white" />
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm leading-none">Recursos Humanos</p>
                        <p className="text-blue-300 text-xs mt-0.5">Expedientes y planilla del personal</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={cargarEmpleados}
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
                        }}
                    >
                        {mensaje.tipo === "exito"
                            ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                            : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
                        <span>{mensaje.texto}</span>
                    </div>
                )}

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Personal", value: totalEmpleados, icon: Users, color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
                        { label: "Activos", value: activos, icon: UserCheck, color: "#059669", bg: "rgba(5,150,105,0.08)" },
                        { label: "Nómina Total", value: `C$ ${nominaTotal.toLocaleString("es-NI")}`, icon: Wallet, color: "#D97706", bg: "rgba(217,119,6,0.08)" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="rounded-2xl p-4 flex items-center gap-3"
                            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div>
                                <p className="text-xl font-bold leading-none" style={{ color }}>{value}</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabla ── */}
                <div className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>

                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                        <div>
                            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Directorio de Personal</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {totalEmpleados} colaborador{totalEmpleados !== 1 ? "es" : ""} registrados
                            </p>
                        </div>
                        <button onClick={() => setMostrarModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 active:scale-95"
                            style={{ backgroundColor: "#7C3AED", boxShadow: "0 3px 10px rgba(124,58,237,0.25)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6D28D9")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7C3AED")}>
                            <Plus size={13} />Nuevo Empleado
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "rgba(240,244,248,0.6)" }}>
                                    {["Colaborador", "Cédula", "Cargo", "Salario Base", "Usuario Sistema"].map((col) => (
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
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="animate-spin-fast" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                                </svg>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Cargando personal...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : empleados.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: "rgba(124,58,237,0.08)" }}>
                                                    <Users size={22} color="#7C3AED" />
                                                </div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Sin empleados registrados</p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Registre el primer colaborador</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    empleados.map((emp, idx) => {
                                        const nombreMostrar = emp.Nombre
                                            ? `${emp.Nombre} ${emp.Apellido || ""}`.trim()
                                            : emp.NombreCompleto || "Desconocido";
                                        const ini1 = (emp.Nombre || emp.NombreCompleto || "E").charAt(0).toUpperCase();
                                        const ini2 = (emp.Apellido || "").charAt(0).toUpperCase();
                                        const avatarColor = AVATAR_COLORS[emp.EmpleadoID % AVATAR_COLORS.length];
                                        const puestoColor = PUESTO_COLORS[emp.Puesto] ?? { bg: "rgba(100,116,139,0.1)", color: "#475569" };

                                        return (
                                            <tr key={emp.EmpleadoID}
                                                className="transition-colors duration-150"
                                                style={{ borderBottom: idx < empleados.length - 1 ? "1px solid var(--border)" : "none" }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(240,244,248,0.6)")}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>

                                                {/* Colaborador */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                                            style={{ backgroundColor: avatarColor.bg, color: avatarColor.color }}>
                                                            {ini1}{ini2}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{nombreMostrar}</p>
                                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                                Desde {formatFecha(emp.FechaContratacion)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cédula */}
                                                <td className="px-5 py-4">
                                                    <span className="text-xs font-mono px-2 py-1 rounded-lg"
                                                        style={{ backgroundColor: "rgba(100,116,139,0.08)", color: "var(--text-muted)" }}>
                                                        {emp.Cedula}
                                                    </span>
                                                </td>

                                                {/* Cargo */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                                        style={{ backgroundColor: puestoColor.bg, color: puestoColor.color }}>
                                                        <Briefcase size={10} />
                                                        {emp.Puesto}
                                                    </span>
                                                </td>

                                                {/* Salario */}
                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-bold" style={{ color: "var(--success)" }}>
                                                        C$ {(emp.SalarioBase || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>mensual</p>
                                                </td>

                                                {/* Usuario sistema */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                                                        style={{
                                                            backgroundColor: emp.UsuarioSistema !== "Sin acceso" ? "rgba(14,165,233,0.08)" : "rgba(100,116,139,0.08)",
                                                            color: emp.UsuarioSistema !== "Sin acceso" ? "#0369A1" : "var(--text-muted)",
                                                        }}>
                                                        {emp.UsuarioSistema !== "Sin acceso" && <BadgeCheck size={11} />}
                                                        {emp.UsuarioSistema}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}