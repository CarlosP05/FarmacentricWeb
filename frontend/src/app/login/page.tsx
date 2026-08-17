"use client"; // Le dice a Next.js que esta página usa interactividad (botones, inputs)

import { useState } from "react";
import { useRouter } from "next/navigation"; // Ojo: en Next 13+ es 'next/navigation'

// Corrección de importación para Next.js App Router
import { useRouter as useNextRouter } from "next/navigation";

export default function LoginPage() {
    const router = useNextRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita que la página se recargue
        setError("");
        setLoading(true);

        try {
            // 1. Llamamos a tu backend en Python
            const res = await fetch("http://127.0.0.1:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // 2. Enviamos los datos exactamente como los pide tu esquema Pydantic
                body: JSON.stringify({
                    nombre_usuario: username,
                    contrasena: password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // ¡Éxito! Guardamos los datos del usuario en el navegador (temporalmente)
                localStorage.setItem("usuario", JSON.stringify(data.usuario));
                alert(data.mensaje); // Mostrará: "Bienvenido a Farmacentric, juan_caja"

                // Aquí luego lo mandaremos al panel de ventas (POS)
                router.push("/dashboard");
            } else {
                // Mostramos el error exacto que nos devuelva Python (ej. "Contraseña incorrecta")
                setError(data.detail || "Error al iniciar sesión");
            }
        } catch (err) {
            setError("No se pudo conectar con el servidor. ¿Está Python encendido?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                {/* Encabezado */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-600">Farmacentric</h1>
                    <p className="text-gray-500 mt-2">Ingresa tus credenciales para continuar</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="text"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Ej: juan_caja"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Mensaje de Error (solo aparece si hay error) */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {loading ? "Verificando..." : "Iniciar Sesión"}
                    </button>
                </form>
            </div>
        </div>
    );
}