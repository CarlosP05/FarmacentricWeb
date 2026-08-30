"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Hacemos que Nombre, Apellido y NombreCompleto sean opcionales (?) 
// para que React no se asuste si falta alguno.
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

export default function RRHHPage() {
    const router = useRouter();
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Estados del Formulario
    const [usuarioId, setUsuarioId] = useState("");
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [cedula, setCedula] = useState("");
    const [puesto, setPuesto] = useState("Cajero/Farmacéutico");
    const [fechaContratacion, setFechaContratacion] = useState("");
    const [salarioBase, setSalarioBase] = useState("");

    const cargarEmpleados = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/empleados");
            if (response.ok) {
                const data = await response.json();
                setEmpleados(data);
            }
        } catch (error) {
            console.error("Error al cargar empleados:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) {
            router.push("/login");
            return;
        }

        const user = JSON.parse(usuarioGuardado);
        if (user.rol !== "Administrador" && user.rol !== "Contador/RRHH") {
            router.push("/dashboard");
        } else {
            cargarEmpleados();
        }
    }, [router]);

    const registrarEmpleado = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/empleados", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: parseInt(usuarioId),
                    nombre: nombre,
                    apellido: apellido,
                    cedula: cedula,
                    puesto: puesto,
                    fecha_contratacion: fechaContratacion,
                    salario_base: parseFloat(salarioBase)
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ " + data.mensaje);
                setMostrarModal(false);
                setUsuarioId("");
                setNombre("");
                setApellido("");
                setCedula("");
                setSalarioBase("");
                cargarEmpleados();
            } else {
                alert("❌ Error: " + (data.detail || "No se pudo registrar"));
            }
        } catch (error) {
            alert("Error al conectar con el servidor Backend.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative">
            <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-lg border-t-4 border-purple-600">

                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">👥 Gestión de Personal (RRHH)</h1>
                        <p className="text-gray-500">Expedientes, cargos y salarios de los colaboradores</p>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="rounded bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 shadow-sm"
                        >
                            + Nuevo Empleado
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="rounded bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400"
                        >
                            Volver al Panel
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-purple-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-purple-800">Colaborador</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-purple-800">Cédula</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-purple-800">Cargo</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-purple-800">Salario Base</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-purple-800">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {cargando ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Cargando base de datos...</td></tr>
                            ) : empleados.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay empleados registrados.</td></tr>
                            ) : (
                                empleados.map((emp) => {
                                    // Lógica salvavidas para mostrar el nombre y las iniciales correctamente
                                    const nombreMostrar = emp.Nombre ? `${emp.Nombre} ${emp.Apellido || ''}` : emp.NombreCompleto || "Desconocido";
                                    const inicial1 = emp.Nombre ? emp.Nombre.charAt(0) : (emp.NombreCompleto ? emp.NombreCompleto.charAt(0) : "E");
                                    const inicial2 = emp.Apellido ? emp.Apellido.charAt(0) : "";

                                    return (
                                        <tr key={emp.EmpleadoID} className="hover:bg-purple-50/50 transition">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-lg uppercase">
                                                        {inicial1}{inicial2}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-semibold text-gray-900">{nombreMostrar}</div>
                                                        <div className="text-sm text-gray-500">Contratado: {emp.FechaContratacion || "N/A"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{emp.Cedula}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-800">{emp.Puesto}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-700">
                                                C$ {(emp.SalarioBase || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                                <span className="rounded bg-gray-100 px-2 py-1 border border-gray-300">
                                                    {emp.UsuarioSistema || "Sin acceso"}
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

            {/* Ventana Modal para Nuevo Empleado */}
            {mostrarModal && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border-t-4 border-purple-600">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Registrar Nuevo Empleado</h2>

                        <form onSubmit={registrarEmpleado} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombres</label>
                                    <input type="text" required className="mt-1 w-full rounded border p-2 text-black" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Apellidos</label>
                                    <input type="text" required className="mt-1 w-full rounded border p-2 text-black" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cédula de Identidad</label>
                                    <input type="text" required placeholder="000-000000-0000A" className="mt-1 w-full rounded border p-2 text-black" value={cedula} onChange={(e) => setCedula(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">ID de Usuario (Sistema)</label>
                                    <input type="number" required placeholder="Ej. 4" className="mt-1 w-full rounded border p-2 text-black" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Cargo / Puesto</label>
                                    <select className="mt-1 w-full rounded border p-2 text-black" value={puesto} onChange={(e) => setPuesto(e.target.value)}>
                                        <option value="Cajero/Farmacéutico">Cajero/Farmacéutico</option>
                                        <option value="Contador/RRHH">Contador/RRHH</option>
                                        <option value="Gerente General">Gerente General</option>
                                        <option value="Bodeguero">Bodeguero</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Salario Base (C$)</label>
                                    <input type="number" step="0.01" required className="mt-1 w-full rounded border p-2 text-black" value={salarioBase} onChange={(e) => setSalarioBase(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contratación</label>
                                    <input type="date" required className="mt-1 w-full rounded border p-2 text-black" value={fechaContratacion} onChange={(e) => setFechaContratacion(e.target.value)} />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                                <button type="button" onClick={() => setMostrarModal(false)} className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={cargando} className="rounded bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:bg-gray-400">
                                    {cargando ? "Guardando..." : "Registrar Empleado"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}