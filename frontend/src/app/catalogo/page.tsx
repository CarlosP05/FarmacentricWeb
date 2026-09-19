"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, ArrowLeft, Beaker } from "lucide-react";

interface Producto {
    ProductoID: number;
    Nombre: string;
    Categoria: string;
    Proveedor: string;
    PrecioVenta: number;
    StockMinimo: number;
    EsControlado: boolean;
}

interface Categoria {
    CategoriaID: number;
    Nombre: string;
}

interface Proveedor {
    ProveedorID: number;
    NombreEmpresa: string;
}

export default function CatalogoPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Estados del formulario
    const [nombre, setNombre] = useState("");
    const [categoriaId, setCategoriaId] = useState("");
    const [proveedorId, setProveedorId] = useState("");
    const [precioCompra, setPrecioCompra] = useState("");
    const [precioVenta, setPrecioVenta] = useState("");
    const [stockMinimo, setStockMinimo] = useState("10");
    const [esControlado, setEsControlado] = useState(false);
    const [unidadMedida, setUnidadMedida] = useState("Unidad");

    useEffect(() => {
        const stored = localStorage.getItem("usuario");
        if (!stored) {
            router.push("/login");
            return;
        }
        const user = JSON.parse(stored);
        if (user.rol !== "Administrador" && user.rol !== "Cajero/Farmacéutico") {
            router.push("/dashboard");
        } else {
            cargarDatosInit();
        }
    }, [router]);

    const cargarDatosInit = async () => {
        try {
            setCargando(true);
            const [resProd, resCat, resProv] = await Promise.all([
                fetch("http://127.0.0.1:8000/productos"),
                fetch("http://127.0.0.1:8000/categorias"),
                fetch("http://127.0.0.1:8000/proveedores"),
            ]);

            if (resProd.ok) setProductos(await resProd.json());
            if (resCat.ok) setCategorias(await resCat.json());
            if (resProv.ok) setProveedores(await resProv.json());
        } catch (error) {
            console.error("Error al cargar datos del catálogo:", error);
        } finally {
            setCargando(false);
        }
    };

    const guardarProducto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaId || !proveedorId) {
            alert("Debe seleccionar una categoría y un proveedor.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/productos-catalogo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre,
                    categoria_id: parseInt(categoriaId),
                    proveedor_id: parseInt(proveedorId),
                    precio_compra: parseFloat(precioCompra),
                    precio_venta: parseFloat(precioVenta),
                    stock_minimo: parseInt(stockMinimo),
                    es_controlado: esControlado,
                    unidad_medida: unidadMedida,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ " + data.mensaje);
                setMostrarModal(false);
                // Limpiar formulario
                setNombre("");
                setPrecioCompra("");
                setPrecioVenta("");
                setStockMinimo("10");
                setEsControlado(false);
                setUnidadMedida("Unidad");
                cargarDatosInit(); // Recargar la tabla
            } else {
                alert("❌ Error: " + (data.detail || "No se pudo guardar el producto"));
            }
        } catch (error) {
            alert("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="min-h-screen p-6 sm:p-10 animate-fade-in" style={{ backgroundColor: "var(--background)" }}>
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-2 text-sm mb-2 hover:opacity-80 transition-opacity"
                            style={{ color: "var(--text-muted)" }}
                        >
                            <ArrowLeft size={16} /> Volver al Panel
                        </button>
                        <h1 className="text-3xl font-display text-gray-900 flex items-center gap-3">
                            <Tag className="text-blue-500" size={28} />
                            Catálogo de Productos
                        </h1>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                            Administre los nombres, categorías y precios base de los medicamentos.
                        </p>
                    </div>
                    <button
                        onClick={() => setMostrarModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium shadow-md hover:shadow-lg transition-all active:scale-95"
                        style={{ backgroundColor: "var(--accent)" }}
                    >
                        <Plus size={18} /> Nuevo Producto
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b" style={{ borderColor: "var(--border)" }}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Producto</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Categoría</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Proveedor</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Precio Venta</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Controlado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                                {cargando ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Cargando catálogo...
                                        </td>
                                    </tr>
                                ) : productos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No hay productos registrados en el catálogo.
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map((prod) => (
                                        <tr key={prod.ProductoID} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{prod.Nombre}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                                                    {prod.Categoria}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{prod.Proveedor}</td>
                                            <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                                                C$ {prod.PrecioVenta.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {prod.EsControlado ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                                        <Beaker size={12} /> Sí
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Nuevo Producto */}
            {mostrarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-down border-t-4 border-blue-500">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Agregar al Catálogo</h2>
                            <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={guardarProducto} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej. Paracetamol 500mg"
                                    className="w-full rounded-xl border border-gray-300 p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        required
                                        value={categoriaId}
                                        onChange={(e) => setCategoriaId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                                    >
                                        <option value="">Seleccione una categoría...</option>
                                        {categorias.map((c) => (
                                            <option key={c.CategoriaID} value={c.CategoriaID}>{c.Nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                                    <select
                                        required
                                        value={proveedorId}
                                        onChange={(e) => setProveedorId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                                    >
                                        <option value="">Seleccione un proveedor...</option>
                                        {proveedores.map((p) => (
                                            <option key={p.ProveedorID} value={p.ProveedorID}>{p.NombreEmpresa}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={precioCompra}
                                        onChange={(e) => setPrecioCompra(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={precioVenta}
                                        onChange={(e) => setPrecioVenta(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm font-semibold text-blue-700"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mín.</label>
                                    <input
                                        type="number"
                                        required
                                        value={stockMinimo}
                                        onChange={(e) => setStockMinimo(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm"
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                                    <select
                                        value={unidadMedida}
                                        onChange={(e) => setUnidadMedida(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 p-2.5 text-sm bg-white"
                                    >
                                        <option value="Unidad">Unidad</option>
                                        <option value="Caja">Caja</option>
                                        <option value="Frasco">Frasco</option>
                                        <option value="Blister">Blíster</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 pb-2">
                                <input
                                    type="checkbox"
                                    id="controlado"
                                    checked={esControlado}
                                    onChange={(e) => setEsControlado(e.target.checked)}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <label htmlFor="controlado" className="text-sm font-medium text-red-700 flex items-center gap-1">
                                    <Beaker size={14} /> Requiere Receta / Medicamento Controlado
                                </label>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                                    style={{ backgroundColor: "var(--accent)" }}
                                >
                                    Guardar Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}