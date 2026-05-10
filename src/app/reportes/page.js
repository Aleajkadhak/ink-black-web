"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, TrendingUp, Users, 
  LayoutDashboard, Calendar, Package 
} from 'lucide-react';
import Link from 'next/link';

export default function Reportes() {
  const [stats, setStats] = useState({
    totalCitas: 0,
    crecimiento: 0,
    usoKits: {},
    estilosPopulares: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarReportes() {
      // FILTRO AVANZADO: .not con 'ilike' para ignorar mayúsculas/minúsculas
      // Esto asegura que cualquier cita marcada como cancelada no ensucie tus gráficas
      const { data: citas } = await supabase
        .from('citas')
        .select('*')
        .not('estado', 'ilike', 'cancelada');
      
      if (citas) {
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const añoActual = ahora.getFullYear();

        // 1. Filtrar citas de este mes
        const citasEsteMes = citas.filter(c => {
          const fechaCita = new Date(c.fecha);
          return fechaCita.getMonth() === mesActual && fechaCita.getFullYear() === añoActual;
        }).length;

        // 2. Filtrar citas del mes pasado para el cálculo de crecimiento
        const citasMesPasado = citas.filter(c => {
          const fechaCita = new Date(c.fecha);
          const ultimoMes = mesActual === 0 ? 11 : mesActual - 1;
          const ultimoAño = mesActual === 0 ? añoActual - 1 : añoActual;
          return fechaCita.getMonth() === ultimoMes && fechaCita.getFullYear() === ultimoAño;
        }).length;

        // 3. Cálculo de crecimiento real
        let porcentajeCrecimiento = 0;
        if (citasMesPasado > 0) {
          porcentajeCrecimiento = ((citasEsteMes - citasMesPasado) / citasMesPasado) * 100;
        } else if (citasEsteMes > 0) {
          porcentajeCrecimiento = 100; 
        }

        // 4. Agregación de datos para los visuales
        const kits = citas.reduce((acc, c) => {
          acc[c.kit_nombre] = (acc[c.kit_nombre] || 0) + 1;
          return acc;
        }, {});

        const estilos = citas.reduce((acc, c) => {
          acc[c.estilo] = (acc[c.estilo] || 0) + 1;
          return acc;
        }, {});

        setStats({
          totalCitas: citas.length,
          crecimiento: porcentajeCrecimiento.toFixed(1),
          usoKits: kits,
          estilosPopulares: estilos
        });
      }
      setLoading(false);
    }
    cargarReportes();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-60 bg-zinc-950 border-r border-zinc-900 p-6 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-red-600 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-red-900/40">IB</div>
          <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">INK BLACK</h2>
        </div>
        <nav className="space-y-1 flex-1">
          <Link href="/reportes" className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 text-white font-bold text-xs border border-zinc-800 transition-all">
            <BarChart3 size={16} className="text-red-600" /> Reportes
          </Link>
          <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <LayoutDashboard size={16}/> Inicio
          </Link>
          <Link href="/agenda" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <Calendar size={16}/> Agenda
          </Link>
          <Link href="/inventario" className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 text-zinc-500 font-bold text-xs transition-all">
            <Package size={16}/> Inventario
          </Link>
        </nav>
      </aside>

      {/* CUERPO DEL REPORTE */}
      <main className="flex-1 ml-60 p-12 bg-black overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Análisis General</h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">Métricas de Rendimiento Real</p>
        </header>

        {/* INDICADORES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
            <Users className="text-red-600 mb-4" size={24} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sesiones Realizadas</p>
            <h3 className="text-4xl font-black italic">{stats.totalCitas}</h3>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
            <TrendingUp 
              className={stats.crecimiento >= 0 ? "text-green-500 mb-4" : "text-red-500 mb-4"} 
              size={24} 
            />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Crecimiento Mensual</p>
            <h3 className={`text-4xl font-black italic ${stats.crecimiento >= 0 ? "text-white" : "text-red-500"}`}>
              {stats.crecimiento >= 0 ? `+${stats.crecimiento}%` : `${stats.crecimiento}%`}
            </h3>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
            <BarChart3 className="text-blue-500 mb-4" size={24} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Kits Activos</p>
            <h3 className="text-4xl font-black italic">{Object.keys(stats.usoKits).length}</h3>
          </div>
        </div>

        {/* GRÁFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <section className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-[3rem]">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 italic">Uso de Kits (Sin Cancelados)</h2>
            <div className="space-y-6">
              {Object.entries(stats.usoKits).map(([nombre, cantidad]) => (
                <div key={nombre}>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                    <span className="text-zinc-300">{nombre}</span>
                    <span className="text-red-600">{cantidad} sesiones</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.3)]" 
                      style={{ width: stats.totalCitas > 0 ? `${(cantidad / stats.totalCitas) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-[3rem]">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 italic">Estilos Preferidos</h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.estilosPopulares).map(([estilo, cant]) => (
                <div key={estilo} className="bg-black border border-zinc-800 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[100px] hover:border-red-600 transition-colors cursor-default">
                  <span className="text-zinc-500 text-[8px] font-black uppercase tracking-tighter">{estilo || 'General'}</span>
                  <span className="text-2xl font-black italic text-white">{cant}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}