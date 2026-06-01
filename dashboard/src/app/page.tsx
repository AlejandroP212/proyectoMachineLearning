"use client";

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, Activity, BarChart3, Database, Target, 
  BrainCircuit, Globe, TrendingUp, Users, Filter, Info,
  Shield, Zap, Eye, ChevronDown, MapPin, Calendar,
  Flame, Plane, Ship, Newspaper, MessageCircle
} from 'lucide-react';
import featuresData from '../../public/data/features.json';
import overallData from '../../public/data/overall_intensity.json';
import metricsData from '../../public/data/metrics.json';

const Charts = dynamic(() => import('./charts'), { ssr: false });

interface Feature {
  date: string;
  country: string;
  n_conflict_events: number;
  avg_goldstein: number;
  n_mentions: number;
  has_high_violence: number;
  n_ucdp_events: number;
  total_fatalities: number;
  n_news_articles: number;
  n_hotspots: number;
  avg_frp: number;
  n_social_posts: number;
  avg_social_engagement: number;
  conflict_events_rolling_3d: number;
  fatalities_rolling_3d: number;
  conflict_score: number;
  escalation_level: number;
}

interface OverallIntensity {
  date: string;
  overall_intensity: number;
}

interface ModelMetrics {
  f1_weighted_mean: number;
  f1_weighted_std: number;
  precision_mean: number;
  recall_mean: number;
}

const features = featuresData as Feature[];
const overall = overallData as OverallIntensity[];
const metrics = metricsData as Record<string, ModelMetrics>;

export default function Dashboard() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['IRN', 'ISR', 'USA']);
  const [dateRange, setDateRange] = useState<[string, string]>(['2024-01-01', '2026-12-31']);
  const [activeSection, setActiveSection] = useState(0);

  const filteredFeatures = useMemo(() => {
    return features.filter((f: Feature) => 
      selectedCountries.includes(f.country) &&
      f.date >= dateRange[0] &&
      f.date <= dateRange[1]
    );
  }, [selectedCountries, dateRange]);

  const filteredOverall = useMemo(() => {
    return overall.filter((o: OverallIntensity) => 
      o.date >= dateRange[0] && o.date <= dateRange[1]
    );
  }, [dateRange]);

  const kpis = useMemo(() => {
    const totalEvents = filteredFeatures.reduce((sum: number, f: Feature) => sum + f.n_conflict_events, 0);
    const totalFatalities = filteredFeatures.reduce((sum: number, f: Feature) => sum + f.total_fatalities, 0);
    const avgEscalation = filteredFeatures.length > 0 
      ? filteredFeatures.reduce((sum: number, f: Feature) => sum + f.escalation_level, 0) / filteredFeatures.length 
      : 0;
    const highEscalationDays = filteredFeatures.filter((f: Feature) => f.escalation_level === 2).length;
    return { totalEvents, totalFatalities, avgEscalation, highEscalationDays };
  }, [filteredFeatures]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const bestModel = Object.entries(metrics).reduce((best, [name, m]) => 
    m.f1_weighted_mean > best[1].f1_weighted_mean ? [name, m] : best,
    Object.entries(metrics)[0] || ['', { f1_weighted_mean: 0, f1_weighted_std: 0, precision_mean: 0, recall_mean: 0 }]
  );

  const latestData = useMemo(() => {
    const latest = features.reduce((acc, f) => {
      if (!acc[f.country] || f.date > acc[f.country].date) {
        acc[f.country] = f;
      }
      return acc;
    }, {} as Record<string, Feature>);
    return latest;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = 0;
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          current = index;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Shield className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <span className="font-bold text-lg hidden sm:inline-block">OSINT · Medio Oriente</span>
              <span className="text-xs text-slate-500 block sm:hidden">ML1</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#conflicto" className={`transition-colors ${activeSection === 0 ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}>El Conflicto</a>
            <a href="#datos" className={`transition-colors ${activeSection === 1 ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}>Los Datos</a>
            <a href="#modelo" className={`transition-colors ${activeSection === 2 ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}>El Modelo</a>
            <a href="#hoy" className={`transition-colors ${activeSection === 3 ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}>Hoy</a>
          </nav>
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <Users className="h-3 w-3" />
            <span>Rincón · Barrera · Pardo</span>
          </div>
        </div>
      </header>

      <section id="conflicto" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-slate-950 to-orange-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.1),transparent_50%)]" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            Monitoreo Activo · Medio Oriente
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter">
            <span className="gradient-text">Irán.</span>
            <br />
            <span className="text-slate-300">Israel. EE.UU.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-400 leading-relaxed">
            El conflicto más tenso del siglo XXI en Medio Oriente, monitoreado con 
            inteligencia artificial y fuentes abiertas. Del Estrecho de Ormuz al Mediterráneo.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
            <HeroStat value={kpis.totalEvents.toLocaleString()} label="eventos crudos" />
            <HeroStat value="5" label="fuentes OSINT" />
            <HeroStat value={filteredFeatures.length.toString()} label="días analizados" />
            <HeroStat value={`${(bestModel[1].f1_weighted_mean * 100).toFixed(0)}%`} label="F1 del modelo" />
          </div>

          <div className="pt-12 animate-bounce">
            <ChevronDown className="h-8 w-8 mx-auto text-slate-500" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Una crisis en <span className="gradient-text">Medio Oriente</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              Tres actores. Una región. El Estrecho de Ormuz como punto crítico del comercio energético mundial.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            <ActorCard
              flag="🇮🇷"
              code="IRN"
              name="Irán"
              role="Actor ofensivo — presión asimétrica"
              points={[
                "Red de proxies: Hezbollah, Hutíes, Hamás",
                "Programa nuclear con uranio al 60%",
                "Control del Estrecho de Ormuz",
                "1er productor de petróleo OPEP"
              ]}
              data={latestData['IRN']}
            />
            <ActorCard
              flag="🇮🇱"
              code="ISR"
              name="Israel"
              role="Actor defensivo — respuesta directa"
              points={[
                "Guerra activa en Gaza (oct 2023–presente)",
                "Operación terrestre en Líbano (2024)",
                "Ataques sobre suelo iraní",
                "Única potencia nuclear no declarada"
              ]}
              data={latestData['ISR']}
            />
            <ActorCard
              flag="🇺🇸"
              code="USA"
              name="Estados Unidos"
              role="Actor disuasorio — contención"
              points={[
                "Garante de seguridad israelí",
                "Dos portaaviones en el Mediterráneo",
                "V Flota Naval en el Golfo Pérsico",
                "Arquitecto de sanciones a Irán"
              ]}
              data={latestData['USA']}
            />
          </div>
        </div>
      </section>

      <section id="datos" className="py-20 space-y-16">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              ¿Qué dicen <span className="gradient-text">los datos</span>?
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              5 fuentes OSINT integradas. Del tono mediático de GDELT a las anomalías térmicas de NASA FIRMS en el Estrecho de Ormuz.
            </p>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-slate-300">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">Filtros Interactivos</h3>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Países</label>
                <div className="flex gap-2">
                  {['IRN', 'ISR', 'USA'].map(c => (
                    <button
                      key={c}
                      onClick={() => toggleCountry(c)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCountries.includes(c)
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {c === 'IRN' ? 'Irán' : c === 'ISR' ? 'Israel' : 'EE.UU.'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Rango de Fechas</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={dateRange[0]}
                    onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200"
                  />
                  <span className="text-slate-500">—</span>
                  <input
                    type="date"
                    value={dateRange[1]}
                    onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            <KPICard 
              icon={<Zap className="h-5 w-5 text-yellow-400" />}
              label="Eventos de Conflicto"
              value={kpis.totalEvents.toLocaleString()}
              subtitle="GDELT + UCDP"
            />
            <KPICard 
              icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
              label="Fatalidades Totales"
              value={kpis.totalFatalities.toLocaleString()}
              subtitle="UCDP verificado"
            />
            <KPICard 
              icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
              label="Escalada Promedio"
              value={kpis.avgEscalation.toFixed(2)}
              subtitle="0=Bajo, 2=Alto"
            />
            <KPICard 
              icon={<Eye className="h-5 w-5 text-purple-400" />}
              label="Días Alta Escalada"
              value={kpis.highEscalationDays.toString()}
              subtitle={`de ${filteredFeatures.length} observaciones`}
            />
          </div>

          <div className="space-y-6 max-w-6xl mx-auto">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Evolución de la Escalada en Medio Oriente
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <Charts type="timeline" data={filteredOverall} />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-slate-200">Distribución por País</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Charts type="distribution" data={filteredFeatures} />
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-slate-200">Eventos vs Fatalidades</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Charts type="scatter" data={filteredFeatures} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              El <span className="gradient-text">Estrecho de Ormuz</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              39 km de ancho. 20% del petróleo mundial. El punto más crítico del conflicto.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <StatCard icon={<Flame className="h-6 w-6 text-orange-400" />} value="6,812" label="hotspots detectados" subtitle="NASA FIRMS" />
            <StatCard icon={<MapPin className="h-6 w-6 text-red-400" />} value="39 km" label="ancho del Estrecho" subtitle="Punto crítico" />
            <StatCard icon={<Ship className="h-6 w-6 text-blue-400" />} value="20%" label="del petróleo mundial" subtitle="Transita por aquí" />
          </div>

          <Card className="glass-card max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                Radar de Fuentes OSINT — Medio Oriente
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Charts type="radar" data={filteredFeatures} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="modelo" className="py-20 space-y-12">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              ¿Puede la IA <span className="gradient-text">predecir la guerra</span>?
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              Cuatro algoritmos. {filteredFeatures.length} ventanas país-día. Validación cruzada temporal.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 max-w-6xl mx-auto">
            {Object.entries(metrics).map(([modelName, m]) => (
              <Card 
                key={modelName} 
                className={`glass-card transition-all hover:scale-[1.02] ${
                  modelName === bestModel[0] ? 'ring-2 ring-emerald-500/50 animate-pulse-glow' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-slate-200">
                    <span className="flex items-center gap-2">
                      {modelName === bestModel[0] && <Zap className="h-4 w-4 text-emerald-400" />}
                      {modelName}
                    </span>
                    {modelName === bestModel[0] && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                        Mejor Modelo
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <MetricBox label="F1 Score" value={m.f1_weighted_mean} color="emerald" />
                    <MetricBox label="Precisión" value={m.precision_mean} color="blue" />
                    <MetricBox label="Recall" value={m.recall_mean} color="purple" />
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                      style={{ width: `${m.f1_weighted_mean * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    σ = ±{(m.f1_weighted_std * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="hoy" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              EN VIVO
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              El conflicto <span className="gradient-text">hoy</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg">
              Predicción del modelo {bestModel[0]} sobre los últimos datos disponibles.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {['IRN', 'ISR', 'USA'].map(code => (
              <StatusCard 
                key={code}
                flag={code === 'IRN' ? '🇮🇷' : code === 'ISR' ? '🇮🇱' : '🇺🇸'}
                code={code}
                name={code === 'IRN' ? 'Irán' : code === 'ISR' ? 'Israel' : 'EE.UU.'}
                data={latestData[code]}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 space-y-12">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              5 Fuentes de <span className="gradient-text">Inteligencia Abierta</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <SourceCard 
              name="GDELT 2.0"
              type="Eventos + NLP"
              description="Base de datos global de eventos, tono Goldstein y menciones mediáticas derivadas de noticias."
              icon={<Globe className="h-6 w-6 text-blue-400" />}
              color="blue"
            />
            <SourceCard 
              name="UCDP"
              type="Conflictos Armados"
              description="Uppsala Conflict Data Program: eventos georreferenciados de violencia organizada con fatalidades verificadas."
              icon={<Target className="h-6 w-6 text-red-400" />}
              color="red"
            />
            <SourceCard 
              name="NASA FIRMS"
              type="Señales Térmicas"
              description="Hotspots de fuego detectados por satélite VIIRS. Proxy de actividad anómala en Medio Oriente."
              icon={<Flame className="h-6 w-6 text-orange-400" />}
              color="orange"
            />
            <SourceCard 
              name="RSS Feeds"
              type="Cobertura Mediática"
              description="BBC Middle East y Al Jazeera RSS para monitoreo editorial y contraste de narrativas regionales."
              icon={<Newspaper className="h-6 w-6 text-purple-400" />}
              color="purple"
            />
            <SourceCard 
              name="Bluesky"
              type="Pulso Social"
              description="Red social descentralizada. Posts y engagement como señal de conversación pública sobre el conflicto."
              icon={<MessageCircle className="h-6 w-6 text-cyan-400" />}
              color="cyan"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Lo que <span className="gradient-text">encontramos</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
            <FindingCard
              number="01"
              title="El tono mediático predice la escalada"
              description="La escala Goldstein de GDELT es la variable más predictiva. Los medios capturan la tensión antes de que se materialice en eventos físicos."
            />
            <FindingCard
              number="02"
              title="El Estrecho de Ormuz es el nodo crítico"
              description="Bandar Abbas — puerto naval iraní — concentra el riesgo geopolítico más alto. Un bloqueo desencadenaría una crisis energética global en 72 horas."
            />
            <FindingCard
              number="03"
              title="Logistic Regression supera a los modelos base"
              description={`Con F1=${(bestModel[1].f1_weighted_mean).toFixed(2)} en CV temporal, Logistic Regression captura patrones lineales de escalada con alta estabilidad.`}
            />
            <FindingCard
              number="04"
              title="Las fuentes abiertas son suficientes"
              description="Con datos 100% gratuitos — GDELT, UCDP, FIRMS, RSS, Bluesky — el sistema clasifica la escalada con alta precisión, validando la hipótesis OSINT."
            />
          </div>

          <Card className="glass-card max-w-4xl mx-auto border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Limitaciones del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <LimitationItem text="El modelo clasifica patrones, no predice eventos futuros" />
              <LimitationItem text="GDELT puede sobrerepresentar conflictos visibles en medios occidentales" />
              <LimitationItem text="El target es una simplificación de 3 niveles basada en cuantiles" />
              <LimitationItem text="Bluesky tiene volumen bajo para ser determinante en el modelo" />
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 bg-slate-950 py-12">
        <div className="container mx-auto px-4 space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-slate-400 font-medium text-lg">Sistema de Inteligencia Multifuente</p>
            <p className="text-slate-500">Conflicto Irán · Israel · EE.UU. — Medio Oriente</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm font-medium">Universidad Externado de Colombia</p>
            <p className="text-slate-500 text-sm">Machine Learning 1 · ML1-2026I</p>
          </div>
          <div className="pt-4 border-t border-slate-800/50">
            <p className="text-slate-500 text-sm">
              Juan Tomás Rincón Pinzón · Hudy Nicolás Barrera Castañeda · Alejandro Pardo Costo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="space-y-2">
      <p className="text-4xl md:text-5xl font-bold gradient-text">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function ActorCard({ flag, code, name, role, points, data }: {
  flag: string;
  code: string;
  name: string;
  role: string;
  points: string[];
  data?: Feature;
}) {
  const level = data?.escalation_level ?? 0;
  const config = {
    0: { text: "Bajo", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    1: { text: "Medio", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    2: { text: "Alto", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  }[level] || { text: "N/A", color: "text-slate-500", bg: "bg-slate-800", border: "border-slate-700" };

  return (
    <Card className={`glass-card ${config.border} hover:scale-[1.02] transition-all`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="text-4xl">{flag}</div>
          <div className={`px-3 py-1 rounded-full ${config.bg} ${config.color} text-xs font-medium`}>
            {config.text}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-200">{name}</h3>
          <p className="text-xs text-slate-400">{code}</p>
        </div>
        <p className="text-sm text-slate-300 font-medium">{role}</p>
        <ul className="space-y-2">
          {points.map((point, i) => (
            <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
              <span className="text-slate-600 mt-1">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function KPICard({ icon, label, value, subtitle }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtitle?: string;
}) {
  return (
    <Card className="glass-card hover:border-slate-600 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-slate-100">{value}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-slate-800/50">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon, value, label, subtitle }: {
  icon: React.ReactNode;
  value: string;
  label: string;
  subtitle: string;
}) {
  return (
    <Card className="glass-card text-center">
      <CardContent className="p-6 space-y-3">
        <div className="flex justify-center">{icon}</div>
        <p className="text-3xl font-bold gradient-text">{value}</p>
        <p className="text-sm text-slate-300">{label}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function MetricBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };
  
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold font-mono ${colorClasses[color]}`}>
        {(value * 100).toFixed(1)}%
      </p>
    </div>
  );
}

function StatusCard({ flag, code, name, data }: {
  flag: string;
  code: string;
  name: string;
  data?: Feature;
}) {
  if (!data) return null;

  const level = data.escalation_level;
  const config = {
    0: { text: "BAJO", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", desc: "Tono mediático moderado. Eventos dentro del rango histórico normal." },
    1: { text: "MEDIO", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", desc: "Incremento notable en menciones mediáticas o eventos. Posible activación de proxies." },
    2: { text: "ALTO", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", desc: "Alta densidad de eventos de conflicto. Posible actividad militar directa o crisis diplomática." },
  }[level] || { text: "N/A", color: "text-slate-500", bg: "bg-slate-800", border: "border-slate-700", desc: "" };

  return (
    <Card className={`glass-card ${config.border}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-4xl">{flag}</div>
          <div className={`px-4 py-2 rounded-full ${config.bg} ${config.color} font-bold`}>
            {config.text}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-200">{name}</h3>
          <p className="text-xs text-slate-400">Último dato: {data.date}</p>
        </div>
        <p className="text-sm text-slate-400">{config.desc}</p>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Eventos</p>
            <p className="text-lg font-bold text-slate-200">{data.n_conflict_events.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Goldstein</p>
            <p className="text-lg font-bold text-slate-200">{data.avg_goldstein.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SourceCard({ name, type, description, icon, color }: {
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  };
  
  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border hover:scale-[1.02] transition-all`}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h3 className="font-semibold text-slate-200">{name}</h3>
            <p className="text-xs text-slate-400">{type}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function FindingCard({ number, title, description }: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="glass-card hover:border-slate-600 transition-all">
      <CardContent className="p-6 space-y-3">
        <div className="text-4xl font-bold gradient-text">{number}</div>
        <h3 className="text-lg font-bold text-slate-200">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function LimitationItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
