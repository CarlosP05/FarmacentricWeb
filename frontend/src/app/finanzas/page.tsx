"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Gasto {
    GastoID: number;
    Concepto: string;
    Monto: number;
    Categoria: string;
    FechaGasto: string;
    RegistradoPor: number;
}

export default function FinanzasPage() {
    const router = useRouter();
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioId, setUsuarioId] = useState(0);

    // Estados del Formulario
    const [concepto, setConcepto] = useState("");
    const [monto, setMonto] = useState("");
    const [categoria, setCategoria] = useState("Servicios Básicos");
    const [fecha, setFecha] = useState("");

    const cargarGastos = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/gastos");
            if (response.ok) {
                const data = await response.json();
                setGastos(data);
            }
        } catch (error) {
            console.error("Error al cargar finanzas:", error);
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
            const idSeguro = user.usuario_id || user.UsuarioID || 2;
            setUsuarioId(idSeguro);
            cargarGastos();
        }
    }, [router]);

    const registrarGasto = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/gastos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    concepto: concepto,
                    monto: parseFloat(monto),
                    categoria: categoria,
                    fecha_gasto: fecha,
                    registrado_por: usuarioId
                })
            });

            if (response.ok) {
                alert("✅ Gasto registrado en contabilidad.");
                setMostrarModal(false);
                setConcepto("");
                setMonto("");
                cargarGastos(); // Recargamos la tabla
            } else {
                alert("❌ Error al registrar el gasto.");
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor Backend.");
        } finally {
            setCargando(false);
        }
    };

    const calcularTotalGastos = () => {
        return gastos.reduce((total, item) => total + item.Monto, 0);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative">
            <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-lg border-t-4 border-amber-500">

                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">💰 Finanzas y Gastos Operativos</h1>
                        <p className="text-gray-500">Control de caja chica, pago de servicios y nómina</p>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="rounded bg-amber-600 px-4 py-2 font-semibold text-white transition hover:bg-amber-700 shadow-sm"
                        >
                            + Registrar Gasto
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="rounded bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400"
                        >
                            Volver al Panel
                        </button>
                    </div>
                </div>

                {/* Tarjeta de Resumen */}
                <div className="mb-6 inline-block rounded-lg bg-amber-50 p-4 border border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 uppercase">Total Gastos Registrados</p>
                    <p className="text-2xl font-bold text-gray-900">
                        C$ {calcularTotalGastos().toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                {/* Tabla de Gastos */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-amber-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Concepto</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-amber-800">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {cargando ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Cargando contabilidad...</td></tr>
                            ) : gastos.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay gastos registrados.</td></tr>
                            ) : (
                                gastos.map((gasto) => (
                                    <tr key={gasto.GastoID} className="hover:bg-amber-50/30 transition">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{gasto.FechaGasto}</td>
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-800">{gasto.Concepto}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 border border-gray-300">
                                                {gasto.Categoria}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-red-600">
                                            - C$ {gasto.Monto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ventana Modal para Nuevo Gasto */}
            {mostrarModal && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border-t-4 border-amber-500">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Registrar Salida de Dinero</h2>

                        <form onSubmit={registrarGasto} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Concepto o Descripción</label>
                                <input type="text" required className="mt-1 w-full rounded border p-2 text-black" placeholder="Ej. Pago recibo de luz" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monto (C$)</label>
                                    <input type="number" step="0.01" required className="mt-1 w-full rounded border p-2 text-black" placeholder="0.00" value={monto} onChange={(e) => setMonto(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                                    <input type="date" required className="mt-1 w-full rounded border p-2 text-black" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <select className="mt-1 w-full rounded border p-2 text-black" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                                    <option value="Servicios Básicos">Servicios Básicos</option>
                                    <option value="Nómina">Nómina / Salarios</option>
                                    <option value="Insumos">Insumos Locales</option>
                                    <option value="Mantenimiento">Mantenimiento</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                                <button type="button" onClick={() => setMostrarModal(false)} className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={cargando} className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:bg-gray-400">
                                    {cargando ? "Guardando..." : "Registrar Salida"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}