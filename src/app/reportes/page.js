"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, RefreshCw, Award, AlertTriangle, 
  LayoutDashboard, Calendar, Box, LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function Reportes() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCitas: 0,
    insumosNuevosMes: 0,
    usoKits: {},
    topKit: { nombre: '-', cantidad: 0 },
    saludInventario: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    async function cargarDataOperativa() {
      try {
        const res = await fetch('/api/reportes');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error cargando reportes:", error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarDataOperativa();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-60 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white">IB</div>
          <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] italic text-white">INK BLACK</h2>
        </div>
        <nav className="space-y-1 flex-1">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <LayoutDashboard size={16}/> Inicio
          </Link>
          <Link href="/agenda" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <Calendar size={16}/> Agenda
          </Link>
          <Link href="/inventario" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <Box size={16}/> Inventario
          </Link>
          <Link href="/reportes" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 text-white font-bold text-xs border border-zinc-800">
            <BarChart3 size={16} className="text-red-600" /> Reportes
          </Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-zinc-600 hover:text-red-500 font-black uppercase text-[9px] tracking-widest transition-all border-t border-zinc-900 pt-6">
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-60 p-12 bg-black overflow-y-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Control de Flujo</h1>
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Análisis de Desgaste y Rotación de Material</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl text-right">
             <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Insumos Registrados (Mes)</p>
             <h2 className="text-2xl font-black italic text-white">{loading ? '-' : stats.insumosNuevosMes} Unidades</h2>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 animate-pulse font-black uppercase text-xs tracking-widest">Generando Análisis...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-red-600/20 p-4 rounded-2xl">
                  <Award className="text-red-600" size={32} />
                </div>
                <div>
                  <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Kit de Mayor Desgaste</p>
                  <h3 className="text-xl font-black italic uppercase text-white">{stats.topKit.nombre}</h3>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-yellow-600/20 p-4 rounded-2xl">
                  <AlertTriangle className="text-yellow-500" size={32} />
                </div>
                <div>
                  <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Nivel de Abastecimiento</p>
                  <h3 className="text-3xl font-black italic text-white">{stats.saludInventario}%</h3>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-green-600/20 p-4 rounded-2xl">
                  <RefreshCw className="text-green-500" size={32} />
                </div>
                <div>
                  <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Servicios Concluidos</p>
                  <h3 className="text-3xl font-black italic text-white">{stats.totalCitas}</h3>
                </div>
              </div>
            </div>

            <section className="bg-zinc-900/20 border border-zinc-800 p-10 rounded-[3rem]">
              <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-10 italic">Frecuencia de Uso por Kit Operativo</h2>
              
              {Object.keys(stats.usoKits).length === 0 ? (
                 <p className="text-zinc-600 font-bold text-sm text-center">Aún no hay uso de kits registrado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(stats.usoKits).map(([nombre, cant]) => (
                    <div key={nombre} className="bg-black border border-zinc-900 p-6 rounded-3xl group hover:border-red-600/50 transition-all">
                      <p className="text-zinc-500 text-[8px] font-black uppercase mb-1 tracking-widest">Kit</p>
                      <h4 className="text-lg font-black italic text-white uppercase">{nombre}</h4>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-red-600 italic">{cant}</span>
                          <span className="text-[8px] text-zinc-600 font-bold uppercase">usos</span>
                        </div>
                        {/* Barra de progreso mini */}
                        <div className="w-16 bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-600 h-full transition-all duration-1000" 
                            style={{ width: `${(cant / stats.totalCitas) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}