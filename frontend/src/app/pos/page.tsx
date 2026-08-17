"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Definimos la estructura de los datos
interface Producto {
    ProductoID: number;
    Nombre: string;
    PrecioVenta: number;
}

interface ItemCarrito {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

export default function POSPage() {
    const router = useRouter();
    const [usuarioId, setUsuarioId] = useState<number>(0);
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
    const [cargando, setCargando] = useState(false);

    // Cargamos tu catálogo exacto de SQL Server
    const productosCatalog: Producto[] = [
        { ProductoID: 1, Nombre: "Paracetamol 500mg", PrecioVenta: 3.00 },
        { ProductoID: 2, Nombre: "Amoxicilina 500mg", PrecioVenta: 12.00 },
        { ProductoID: 3, Nombre: "Diazepam 10mg", PrecioVenta: 35.00 },
        { ProductoID: 4, Nombre: "Vitamina C 1000mg", PrecioVenta: 15.00 }
    ];

    // Al cargar la página, verificamos quién es el cajero
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario");
        if (usuarioGuardado) {
            const user = JSON.parse(usuarioGuardado);
            setUsuarioId(user.usuario_id); // Guardamos su ID para registrar la venta a su nombre
        } else {
            router.push("/login");
        }
    }, [router]);

    // Funciones del Carrito
    const agregarAlCarrito = (producto: Producto) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.producto_id === producto.ProductoID);
            if (existe) {
                // Si ya está en el carrito, le sumamos 1 a la cantidad
                return prev.map((item) =>
                    item.producto_id === producto.ProductoID
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            // Si no existe, lo agregamos como nuevo
            return [...prev, { producto_id: producto.ProductoID, nombre: producto.Nombre, precio: producto.PrecioVenta, cantidad: 1 }];
        });
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    };

    // Función estrella: Enviar la venta a Python
    const cobrarVenta = async () => {
        if (carrito.length === 0) return alert("El carrito está vacío");
        setCargando(true);

        try {
            const response = await fetch("http://127.0.0.1:8000/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuarioId,
                    metodo_pago: "Efectivo", // Por ahora lo dejamos fijo en Efectivo
                    items: carrito.map((item) => ({
                        producto_id: item.producto_id,
                        cantidad: item.cantidad
                    }))
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Venta exitosa. El inventario se ha descontado.");
                setCarrito([]); // Vaciamos la caja para el siguiente cliente
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
        <div className="flex min-h-screen bg-gray-100 p-4">
            {/* Columna Izquierda: Catálogo de Productos */}
            <div className="flex-1 pr-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Terminal POS - Farmacentric</h1>
                    <button onClick={() => router.push("/dashboard")} className="rounded bg-gray-300 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-400">
                        Volver al Panel
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {productosCatalog.map((prod) => (
                        <div
                            key={prod.ProductoID}
                            onClick={() => agregarAlCarrito(prod)}
                            className="cursor-pointer rounded-lg border bg-white p-4 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md active:scale-95"
                        >
                            <div className="text-3xl mb-2">💊</div>
                            <h3 className="font-semibold text-gray-700">{prod.Nombre}</h3>
                            <p className="mt-2 text-lg font-bold text-green-600">C$ {prod.PrecioVenta.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Columna Derecha: El Carrito / Ticket */}
            <div className="w-96 flex flex-col rounded-xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-800">Ticket de Venta</h2>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto">
                    {carrito.length === 0 ? (
                        <p className="text-center text-gray-500 mt-10">Agrega productos para comenzar</p>
                    ) : (
                        <ul className="space-y-4">
                            {carrito.map((item, index) => (
                                <li key={index} className="flex justify-between border-b pb-2">
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.nombre}</p>
                                        <p className="text-sm text-gray-500">{item.cantidad} x C$ {item.precio.toFixed(2)}</p>
                                    </div>
                                    <p className="font-bold text-gray-800">
                                        C$ {(item.cantidad * item.precio).toFixed(2)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Total y Botón de Cobrar */}
                <div className="mt-4 border-t pt-4">
                    <div className="mb-4 flex justify-between text-2xl font-bold text-gray-800">
                        <span>Total:</span>
                        <span className="text-green-600">C$ {calcularTotal().toFixed(2)}</span>
                    </div>

                    <button
                        onClick={cobrarVenta}
                        disabled={cargando || carrito.length === 0}
                        className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {cargando ? "Procesando..." : "💳 COBRAR"}
                    </button>
                </div>
            </div>
        </div>
    );
}