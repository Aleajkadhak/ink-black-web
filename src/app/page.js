"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Package, 
  AlertCircle, 
  Zap, 
  PlusCircle,
  Clock,
  ChevronRight,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

export default function Dashboard() {
  const [alertas, setAlertas] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function inicializarDashboard() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }

        // 1. CARGAR ALERTAS DE STOCK (Detecta críticos y agotados)
        const { data: productos, error: prodError } = await supabase
          .from('productos')
          .select('*');
        
        if (prodError) throw prodError;
        if (productos) {
          const criticos = productos.filter(p => p.stock_actual <= p.stock_minimo || p.stock_actual === 0);
          setAlertas(criticos);
        }

        // 2. CARGAR CITAS DE HOY (Solución definitiva de fecha)
        // 'sv-SE' garantiza el formato YYYY-MM-DD que usa tu tabla citas
        const hoyLocal = new Date().toLocaleDateString('sv-SE');

        console.log("🔍 Diagnóstico Dashboard:");
        console.log("Fecha local detectada:", hoyLocal);

        const { data: citas, error: citasError } = await supabase
          .from('citas')
          .select('*')
          .eq('fecha', hoyLocal)
          .order('hora', { ascending: true });

        if (citasError) throw citasError;
        
        console.log("Citas encontradas en DB:", citas?.length || 0);
        if (citas) setCitasHoy(citas);

      } catch (err) {
        console.error("Error en Dashboard:", err.message);
      } finally {
        setCargando(false);
      }
    }

    inicializarDashboard();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      
      {/* SIDEBAR COMPACTO */}
      <aside className="w-60 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/40 text-white">IB</div>
          <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">INK BLACK</h2>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 text-white font-bold text-xs border border-zinc-800 transition-all">
            <LayoutDashboard size={16} className="text-red-600" /> Inicio
          </Link>
          <Link href="/agenda" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold hover:text-zinc-200 text-xs transition-all">
            <Calendar size={16} /> Agenda
          </Link>
          <Link href="/inventario" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold hover:text-zinc-200 text-xs transition-all">
            <Package size={16} /> Inventario
          </Link>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 p-3 text-zinc-600 hover:text-red-500 font-black uppercase text-[9px] tracking-widest transition-all border-t border-zinc-900 pt-6">
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 ml-60 p-8 bg-black overflow-y-auto">
        
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">DASHBOARD</h1>
            <p className="text-zinc-600 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Ink Black Studio</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[9px] font-black text-zinc-500 uppercase italic">Online</span>
          </div>
        </header>

        {/* ACCESOS RÁPIDOS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link href="/nueva-sesion" className="group bg-red-600 hover:bg-red-700 p-6 rounded-3xl flex items-center justify-between transition-all shadow-xl shadow-red-900/10">
            <div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Nueva Sesión</h3>
              <p className="text-red-200 text-[8px] font-black uppercase tracking-widest">Descontar material ahora</p>
            </div>
            <Zap size={24} className="text-white fill-white group-hover:scale-110 transition-transform" />
          </Link>

          <Link href="/inventario" className="group bg-zinc-100 hover:bg-white p-6 rounded-3xl flex items-center justify-between transition-all shadow-xl">
            <div>
              <h3 className="text-xl font-black italic text-black uppercase tracking-tighter">Registrar Compra</h3>
              <p className="text-zinc-500 text-[8px] font-black uppercase tracking-widest">Sumar insumos al stock</p>
            </div>
            <PlusCircle size={24} className="text-black group-hover:rotate-90 transition-transform" />
          </Link>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SECCIÓN ALERTAS */}
          <section>
            <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2 mb-4">
              <AlertCircle size={12} className="text-red-600" /> Alertas de Pánico
            </h2>
            <div className="space-y-2">
              {cargando ? (
                <p className="text-zinc-700 animate-pulse font-bold text-[10px]">Sincronizando...</p>
              ) : alertas.length > 0 ? (
                alertas.map((item) => (
                  <div key={item.id} className={`border p-4 rounded-2xl flex items-center justify-between group transition-all ${item.stock_actual === 0 ? 'bg-red-950/20 border-red-600 animate-pulse' : 'bg-zinc-900/40 border-zinc-800 hover:border-red-600/30'}`}>
                    <div>
                      <p className="text-red-600 font-black uppercase text-[8px] tracking-widest mb-0.5 italic">
                        {item.stock_actual === 0 ? '¡PRODUCTO AGOTADO!' : '¡CUIDADO! STOCK CRÍTICO'}
                      </p>
                      <p className="text-zinc-200 font-bold text-sm tracking-tight">
                        Quedan <span className={item.stock_actual === 0 ? 'text-red-500 font-black' : 'text-white'}>{item.stock_actual}</span> en <span className="text-white uppercase text-xs font-black">{item.nombre}</span>
                      </p>
                    </div>
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                ))
              ) : (
                <div className="p-8 border border-dashed border-zinc-900 rounded-3xl text-center">
                  <p className="text-zinc-700 font-black text-[9px] uppercase tracking-widest">Inventario al día</p>
                </div>
              )}
            </div>
          </section>

          {/* SECCIÓN AGENDA HOY */}
          <section>
            <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2 mb-4">
              <Calendar size={12} /> Agenda Hoy
            </h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-sm">
              {cargando ? (
                <p className="p-8 text-zinc-700 animate-pulse font-bold text-[10px] text-center uppercase">Cargando sesiones...</p>
              ) : citasHoy.length > 0 ? (
                citasHoy.map((cita) => (
                  <div key={cita.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/40 transition-all border-b border-zinc-800/50 last:border-0 group">
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-800 group-hover:bg-red-600 transition-all w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[10px] text-zinc-400 group-hover:text-white">
                        {cita.hora?.slice(0, 5)}
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tighter group-hover:text-red-500 transition-colors text-white">{cita.cliente}</h4>
                        <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{cita.estilo || 'Estilo Libre'}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-700 group-hover:text-white transition-all" />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-zinc-700 font-black text-[9px] uppercase tracking-widest italic">No hay sesiones para hoy</p>
                </div>
              )}
              <Link href="/agenda" className="block w-full p-3 text-[8px] font-black text-zinc-500 hover:text-white text-center uppercase tracking-[0.4em] transition-all bg-black/40 border-t border-zinc-800">
                Ver completa
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}