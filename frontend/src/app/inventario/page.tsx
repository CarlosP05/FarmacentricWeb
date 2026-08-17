"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos la estructura exacta que nos envía tu Python
interface LoteInventario {
    LoteID: number;
    Producto: string;
    NumeroLote: string;
    FechaVencimiento: string;
    CantidadActual: number;
    StockMinimo: number;
    EsControlado: boolean;
    AlertaStock: boolean;
}

interface ProductoCatalogo {
    ProductoID: number;
    Nombre: string;
}

export default function InventarioPage() {
    const router = useRouter();
    const [cargando, setCargando] = useState(false);

    // NUEVO: Aquí guardaremos la lista real que nos mande Python
    const [inventario, setInventario] = useState<LoteInventario[]>([]);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Estados para el formulario
    const [productoId, setProductoId] = useState(1);
    const [numeroLote, setNumeroLote] = useState("");
    const [fechaFabricacion, setFechaFabricacion] = useState("");
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [cantidad, setCantidad] = useState(0);

    const productosCatalog: ProductoCatalogo[] = [
        { ProductoID: 1, Nombre: "Paracetamol 500mg" },
        { ProductoID: 2, Nombre: "Amoxicilina 500mg" },
        { ProductoID: 3, Nombre: "Diazepam 10mg" },
        { ProductoID: 4, Nombre: "Vitamina C 1000mg" }
    ];

    // NUEVO: Función para pedirle los datos a Python
    const cargarInventario = async () => {
        try {
            // Nota: Asumo que tu ruta en Python se llama /inventario. Si se llama diferente, cámbiala aquí.
            const response = await fetch("http://127.0.0.1:8000/inventario");
            if (response.ok) {
                const data = await response.json();
                setInventario(data); // Guardamos los datos reales
            }
        } catch (error) {
            console.error("Error al cargar la tabla:", error);
        }
    };

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (!usuarioGuardado) {
            router.push("/login");
        } else {
            // Si el usuario es válido, cargamos la tabla inmediatamente
            cargarInventario();
        }
    }, [router]);

    const registrarIngreso = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/ingresos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    producto_id: productoId,
                    numero_lote: numeroLote,
                    fecha_fabricacion: fechaFabricacion,
                    fecha_vencimiento: fechaVencimiento,
                    cantidad: cantidad
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ " + data.mensaje);
                setMostrarModal(false);
                setNumeroLote("");
                setCantidad(0);
                // NUEVO: Refrescamos la tabla automáticamente para ver las nuevas cajas
                cargarInventario();
            } else {
                alert("❌ Error: " + JSON.stringify(data.detail, null, 2));
            }
        } catch (error) {
            alert("No se pudo conectar con el servidor Backend.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 relative">
            <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow-lg">

                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">📦 Gestión de Bodega e Inventario</h1>
                        <p className="text-gray-500">Control de Lotes y existencias físicas</p>
                    </div>
                    <div className="space-x-4">
                        <button
                            onClick={() => setMostrarModal(true)}
                            className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
                        >
                            + Ingresar Nuevo Lote
                        </button>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="rounded bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400"
                        >
                            Volver
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lote</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Vencimiento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">

                            {/* MAGIA: Iteramos sobre los datos reales de tu base de datos */}
                            {inventario.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Cargando inventario o sin productos...
                                    </td>
                                </tr>
                            ) : (
                                inventario.map((item) => (
                                    <tr key={item.LoteID} className="hover:bg-gray-50 transition">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{item.Producto}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-gray-500">{item.NumeroLote}</td>
                                        <td className="whitespace-nowrap px-6 py-4 text-gray-500">{item.FechaVencimiento}</td>

                                        {/* Cambiamos el color del número si hay alerta */}
                                        <td className={`whitespace-nowrap px-6 py-4 font-bold ${item.AlertaStock ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.CantidadActual} Unidades
                                        </td>

                                        {/* Etiqueta dinámica de estado */}
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {item.AlertaStock ? (
                                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Stock Crítico</span>
                                            ) : (
                                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Óptimo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ventana Emergente (Modal) */}
            {mostrarModal && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-800">Registrar Ingreso de Proveedor</h2>

                        <form onSubmit={registrarIngreso} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Producto</label>
                                <select
                                    className="mt-1 w-full rounded border p-2 text-black"
                                    value={productoId}
                                    onChange={(e) => setProductoId(Number(e.target.value))}
                                >
                                    {productosCatalog.map(p => (
                                        <option key={p.ProductoID} value={p.ProductoID}>{p.Nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Número de Lote (Caja)</label>
                                <input type="text" required className="mt-1 w-full rounded border p-2 text-black" placeholder="Ej. LOTE-2026-X" value={numeroLote} onChange={(e) => setNumeroLote(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fabricación</label>
                                    <input type="date" required className="mt-1 w-full rounded border p-2 text-black" value={fechaFabricacion} onChange={(e) => setFechaFabricacion(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vencimiento</label>
                                    <input type="date" required className="mt-1 w-full rounded border p-2 text-black" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cantidad Ingresada</label>
                                <input type="number" min="1" required className="mt-1 w-full rounded border p-2 text-black" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
                            </div>

                            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                                <button type="button" onClick={() => setMostrarModal(false)} className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={cargando} className="rounded bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400">
                                    {cargando ? "Guardando..." : "Guardar Lote"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}