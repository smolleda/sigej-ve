/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Search, 
  Shuffle, 
  Mail, 
  FolderGit, 
  ShieldAlert, 
  BarChart4, 
  Network, 
  Database, 
  Calendar, 
  BookOpen, 
  User, 
  LogOut, 
  Info,
  Layers,
  Fingerprint
} from 'lucide-react';

// Tipos
import { 
  User as UserType, 
  Expediente, 
  Actuacion, 
  Notificacion, 
  MedidaProteccion, 
  AuditoriaLog, 
  Tribunal, 
  EstadoCausa,
  UserRole
} from './types';

// Semilla
import { 
  TRIBUNALES_SEMILLA, 
  USUARIOS_SEMILLA, 
  EXPEDIENTES_SEMILLA, 
  ACTUACIONES_SEMILLA, 
  NOTIFICACIONES_SEMILLA, 
  AUDITORIA_SEMILLA 
} from './db/initialData';

import { getTodosLosTribunales } from './db/venezuelaCatalog';

// Componentes
import ModalAutenticacion from './components/ModalAutenticacion';
import SorteoCausa from './components/SorteoCausa';
import ConsultaPublica from './components/ConsultaPublica';
import ExpedienteElectronico from './components/ExpedienteElectronico';
import NotificacionesBuzon from './components/NotificacionesBuzon';
import MedidasProteccion from './components/MedidasProteccion';
import ReportesEstadisticos from './components/ReportesEstadisticos';
import Interoperabilidad from './components/Interoperabilidad';
import ModelosBDDoc from './components/ModelosBDDoc';
import PlanesNormas from './components/PlanesNormas';

export default function App() {
  // --- Estados de Datos ---
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [tribunales, setTribunales] = useState<Tribunal[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [actuaciones, setActuaciones] = useState<Actuacion[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [medidas, setMedidas] = useState<MedidaProteccion[]>([]);
  const [auditoriaLogs, setAuditoriaLogs] = useState<AuditoriaLog[]>([]);

  // --- Navegación ---
  const [activeTab, setActiveTab] = useState<string>('consultas');

  // --- Controles de Modal de Autenticación ---
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('abogado');

  // --- Inicializar Datos con LocalStorage ---
  useEffect(() => {
    const localTribunales = localStorage.getItem('sigej_tribunales');
    const localExpedientes = localStorage.getItem('sigej_expedientes');
    const localActuaciones = localStorage.getItem('sigej_actuaciones');
    const localNotificaciones = localStorage.getItem('sigej_notificaciones');
    const localMedidas = localStorage.getItem('sigej_medidas');
    const localLogs = localStorage.getItem('sigej_logs');
    const localUser = localStorage.getItem('sigej_current_user');

    if (localTribunales) setTribunales(JSON.parse(localTribunales));
    else {
      const allCatalogTribunals = getTodosLosTribunales();
      setTribunales(allCatalogTribunals);
      localStorage.setItem('sigej_tribunales', JSON.stringify(allCatalogTribunals));
    }

    if (localExpedientes) setExpedientes(JSON.parse(localExpedientes));
    else {
      setExpedientes(EXPEDIENTES_SEMILLA);
      localStorage.setItem('sigej_expedientes', JSON.stringify(EXPEDIENTES_SEMILLA));
    }

    if (localActuaciones) setActuaciones(JSON.parse(localActuaciones));
    else {
      setActuaciones(ACTUACIONES_SEMILLA);
      localStorage.setItem('sigej_actuaciones', JSON.stringify(ACTUACIONES_SEMILLA));
    }

    if (localNotificaciones) setNotificaciones(JSON.parse(localNotificaciones));
    else {
      setNotificaciones(NOTIFICACIONES_SEMILLA);
      localStorage.setItem('sigej_notificaciones', JSON.stringify(NOTIFICACIONES_SEMILLA));
    }

    if (localLogs) setAuditoriaLogs(JSON.parse(localLogs));
    else {
      setAuditoriaLogs(AUDITORIA_SEMILLA);
      localStorage.setItem('sigej_logs', JSON.stringify(AUDITORIA_SEMILLA));
    }

    if (localUser) {
      setCurrentUser(JSON.parse(localUser));
    } else {
      // Por defecto no logueado, forzar a pasar por módulo de inicio
    }

    // Inicializar medidas basadas en el expediente semilla de violencia de género
    if (localMedidas) setMedidas(JSON.parse(localMedidas));
    else {
      const initialMedidas: MedidaProteccion[] = [
        {
          id: 'MED-9011',
          expedienteId: 'AP41-S-2026-000215',
          victimaNombre: 'Estefanía Moreno',
          victimaCedula: 'V-22.333.444',
          agresorNombre: 'Alberto Rojas',
          agresorCedula: 'V-19.444.555',
          tipoMedida: 'Prohibición de acercamiento y restricción de concurrencia al domicilio y lugar de trabajo.',
          fechaEmision: '2026-05-15T11:45:00Z',
          estado: 'Activa',
          policiaNotificada: true
        }
      ];
      setMedidas(initialMedidas);
      localStorage.setItem('sigej_medidas', JSON.stringify(initialMedidas));
    }
  }, []);

  // --- Helper para auditoría ---
  const handleLogAudit = (
    accion: string,
    tablaAfectada: string,
    registroId: string,
    detalles: string,
    motivo: string
  ) => {
    const newLog: AuditoriaLog = {
      id: `log-${Date.now()}`,
      fecha: new Date().toISOString(),
      usuario: currentUser ? currentUser.nombre : 'Usuario Anónimo',
      cedula: currentUser ? currentUser.cedula : 'ANON',
      rol: currentUser ? currentUser.role : 'publico',
      accion,
      tablaAfectada,
      registroId,
      detalles,
      motivo: motivo || 'N/A',
      ip: '200.10.88.' + Math.floor(10 + Math.random() * 200)
    };

    const updatedLogs = [newLog, ...auditoriaLogs];
    setAuditoriaLogs(updatedLogs);
    localStorage.setItem('sigej_logs', JSON.stringify(updatedLogs));
  };

  // --- Operaciones de Escritura ---
  const handleAddExpediente = (nuevoExp: Expediente) => {
    const updated = [nuevoExp, ...expedientes];
    setExpedientes(updated);
    localStorage.setItem('sigej_expedientes', JSON.stringify(updated));

    // Si es violencia de género, gatillar también la medida vacía inicial
    if (nuevoExp.esViolenciaGenero) {
      const nuevaMed: MedidaProteccion = {
        id: `MED-${Math.floor(1000 + Math.random() * 9000)}`,
        expedienteId: nuevoExp.id,
        victimaNombre: nuevoExp.demandanteNombre,
        victimaCedula: nuevoExp.demandanteCedula,
        agresorNombre: nuevoExp.demandadoNombre,
        agresorCedula: nuevoExp.demandadoCedula,
        tipoMedida: 'Prohibición de acercamiento urgente (Medidas Decretadas en Auto de Admisión).',
        fechaEmision: nuevoExp.fechaIngreso,
        estado: 'Activa',
        policiaNotificada: true
      };
      const updatedMedidas = [nuevaMed, ...medidas];
      setMedidas(updatedMedidas);
      localStorage.setItem('sigej_medidas', JSON.stringify(updatedMedidas));
    }
  };

  const handleUpdateTribunalCarga = (tribunalId: string) => {
    const updated = tribunales.map(t => {
      if (t.id === tribunalId) {
        return { ...t, cargaLaboral: t.cargaLaboral + 1 };
      }
      return t;
    });
    setTribunales(updated);
    localStorage.setItem('sigej_tribunales', JSON.stringify(updated));
  };

  const handleAddActuacion = (nuevaActuacion: Actuacion) => {
    const updated = [nuevaActuacion, ...actuaciones];
    setActuaciones(updated);
    localStorage.setItem('sigej_actuaciones', JSON.stringify(updated));

    // Si la actuación es de tipo notificación, crear automáticamente una boleta en casillero
    if (nuevaActuacion.tipo === 'Notificación') {
      const parentCase = expedientes.find(e => e.id === nuevaActuacion.expedienteId);
      if (parentCase) {
        const nuevaBoleta: Notificacion = {
          id: `not-${Math.floor(100000 + Math.random() * 900000)}`,
          expedienteId: parentCase.id,
          destinatarioCedula: parentCase.demandanteCedula, // Para fines prácticos
          destinatarioNombre: parentCase.demandanteNombre,
          destinatarioEmail: 'apoderado@inpreabogado.org.ve',
          fechaEnvio: new Date().toISOString(),
          asunto: nuevaActuacion.titulo,
          contenido: nuevaActuacion.contenido,
          leido: false
        };
        const updatedNotif = [nuevaBoleta, ...notificaciones];
        setNotificaciones(updatedNotif);
        localStorage.setItem('sigej_notificaciones', JSON.stringify(updatedNotif));
      }
    }
  };

  const handleUpdateExpedienteEstado = (expedienteId: string, nuevoEstado: EstadoCausa) => {
    const updated = expedientes.map(exp => {
      if (exp.id === expedienteId) {
        return { 
          ...exp, 
          estado: nuevoEstado,
          fechaResolucion: nuevoEstado === 'Sentenciado' ? new Date().toISOString() : exp.fechaResolucion,
          ocultadoPorDerechoAlOlvido: nuevoEstado === 'Oculto' ? true : exp.ocultadoPorDerechoAlOlvido
        };
      }
      return exp;
    });
    setExpedientes(updated);
    localStorage.setItem('sigej_expedientes', JSON.stringify(updated));
  };

  const handleReadNotification = (notificationId: string, acuseHash: string) => {
    const updated = notificaciones.map(n => {
      if (n.id === notificationId) {
        return {
          ...n,
          leido: true,
          fechaLectura: new Date().toISOString(),
          acuseRecibo: acuseHash
        };
      }
      return n;
    });
    setNotificaciones(updated);
    localStorage.setItem('sigej_notificaciones', JSON.stringify(updated));
  };

  const handleAddMedida = (nuevaMedida: MedidaProteccion) => {
    const updated = [nuevaMedida, ...medidas];
    setMedidas(updated);
    localStorage.setItem('sigej_medidas', JSON.stringify(updated));
  };

  const handleTogglePoliciaNotif = (medidaId: string) => {
    const updated = medidas.map(m => {
      if (m.id === medidaId) {
        return { ...m, policiaNotificada: !m.policiaNotificada };
      }
      return m;
    });
    setMedidas(updated);
    localStorage.setItem('sigej_medidas', JSON.stringify(updated));
  };

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('sigej_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    if (currentUser) {
      handleLogAudit(
        'Cierre de Sesión',
        'Usuarios',
        currentUser.id,
        `Usuario ${currentUser.nombre} cerró su sesión judicial.`,
        'Salida ordinaria del sistema.'
      );
    }
    setCurrentUser(null);
    localStorage.removeItem('sigej_current_user');
    setActiveTab('consultas');
  };

  // Carga de Certificado Digital Homologado para fines operativos de SIGEJ-VE
  const handleRoleClick = (role: UserRole) => {
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="sigej-ve-root">
      {/* HEADER DE ALTA REPRESENTATIVIDAD SOBERANA */}
      <header className="bg-slate-950 border-b border-amber-500/20 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-5 gap-4">
            
            {/* Escudo / Marca */}
            <div className="flex items-center space-x-5 text-center md:text-left">
              <img
                src="/sigej-ve/tsj_venezuela_logo_1783390755662.jpg"
                alt="Escudo Oficial del Tribunal Supremo de Justicia"
                className="h-24 w-24 md:h-28 md:w-28 object-contain rounded-xl border-2 border-amber-500/40 shadow-xl bg-slate-900 p-1 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-sm font-sans font-extrabold tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1">
                  <span>TRIBUNAL SUPREMO DE JUSTICIA</span>
                </h1>
                <p className="text-xs text-white font-bold font-mono tracking-wide">
                  SIGEJ-VE — SISTEMA INTEGRADO DE GESTIÓN JUDICIAL DE VENEZUELA
                </p>
                <span className="text-[10px] text-slate-400 font-mono block">
                  Plataforma Nacional del Trámite Judicial y Consulta de Causas Oficial
                </span>
              </div>
            </div>

            {/* Selector de Certificados Digitales Homologados */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-amber-500" />
                <span>CERTIFICADO DIGITAL ACTIVO:</span>
              </span>
              <div className="flex gap-1.5">
                {(['juez', 'secretario', 'abogado', 'publico'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleClick(r)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase transition cursor-pointer ${
                      currentUser?.role === r
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md border border-amber-400'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                    }`}
                  >
                    {r === 'juez' ? 'JUEZ' : r === 'secretario' ? 'SECRETARIO' : r === 'abogado' ? 'ABOGADO' : 'CIUDADANO'}
                  </button>
                ))}
              </div>
            </div>

            {/* Usuario Actual */}
            {currentUser && (
              <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-lg border border-slate-850">
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{currentUser.nombre}</p>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    Ced: {currentUser.cedula} | {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-red-400 transition cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MENÚ DE SECCIONES (TABS) */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-1 py-2 min-w-max">
            
            <button
              onClick={() => setActiveTab('consultas')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'consultas'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Consulta Pública (LOPNNA)</span>
            </button>

            <button
              onClick={() => setActiveTab('sorteo')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'sorteo'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Shuffle className="h-4 w-4" />
              <span>Sorteo de Causas</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  handleRoleClick('abogado');
                  return;
                }
                setActiveTab('casillero');
              }}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'casillero'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Casillero Judicial (BuzónVEN)</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser || !['juez', 'secretario'].includes(currentUser.role)) {
                  handleRoleClick('juez');
                  return;
                }
                setActiveTab('sustanciacion');
              }}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'sustanciacion'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <FolderGit className="h-4 w-4" />
              <span>Sustanciación Interna</span>
            </button>

            <button
              onClick={() => setActiveTab('medidas')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'medidas'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Medidas de Protección</span>
            </button>

            <button
              onClick={() => setActiveTab('reportes')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'reportes'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <BarChart4 className="h-4 w-4" />
              <span>Estadísticas y Boletines</span>
            </button>

            <button
              onClick={() => setActiveTab('interop')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'interop'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Network className="h-4 w-4" />
              <span>Interoperabilidad API</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'database'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Database className="h-4 w-4" />
              <span>Esquema Base de Datos</span>
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'plan'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Leyes y Plan de Despliegue</span>
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-4 py-2 rounded-md text-xs font-semibold font-sans flex items-center space-x-1.5 cursor-pointer transition-all duration-150 ${
                activeTab === 'auditoria'
                  ? 'bg-slate-900 text-amber-400 shadow-md font-bold border border-amber-500/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Fingerprint className="h-4 w-4" />
              <span>Trazabilidad / Auditoría</span>
            </button>

          </div>
        </div>
      </nav>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Simular login previo obligatorio para ciertos tabs */}
        {!currentUser && activeTab !== 'consultas' && activeTab !== 'plan' && activeTab !== 'database' && activeTab !== 'reportes' ? (
          <div className="space-y-6 max-w-xl mx-auto py-12 text-center bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto stroke-1 mb-4 animate-pulse" />
            <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Acceso Restringido - Trazabilidad Judicial</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Para operar en los de sorteo de causas, casillero judicial, o sustanciación interna del SIGEJ-VE, es requisito legal obligatorio identificarse mediante un Certificado de Firma Electrónica homologado de conformidad con la Constitución y el COPP.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleRoleClick('abogado')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-md cursor-pointer transition"
              >
                Autenticar como ABOGADO
              </button>
              <button
                onClick={() => handleRoleClick('juez')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 font-semibold text-xs rounded-lg shadow-md cursor-pointer transition"
              >
                Autenticar como JUEZ / SECRETARIO
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* RENDERIZADO CONDICIONAL DE TABS */}
            
            {activeTab === 'consultas' && (
              <ConsultaPublica 
                expedientes={expedientes} 
                actuaciones={actuaciones} 
                currentUser={currentUser || USUARIOS_SEMILLA[3]} // fallback publico
                onLogAudit={handleLogAudit} 
              />
            )}

            {activeTab === 'sorteo' && currentUser && (
              <SorteoCausa
                tribunales={tribunales}
                onAddExpediente={handleAddExpediente}
                onUpdateTribunalCarga={handleUpdateTribunalCarga}
                currentUser={currentUser}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeTab === 'casillero' && currentUser && (
              <NotificacionesBuzon
                notificaciones={notificaciones}
                currentUser={currentUser}
                onReadNotification={handleReadNotification}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeTab === 'sustanciacion' && currentUser && (
              <ExpedienteElectronico
                expedientes={expedientes}
                actuaciones={actuaciones}
                currentUser={currentUser}
                onAddActuacion={handleAddActuacion}
                onUpdateExpedienteEstado={handleUpdateExpedienteEstado}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeTab === 'medidas' && (
              <MedidasProteccion
                medidas={medidas}
                expedientes={expedientes}
                currentUser={currentUser || USUARIOS_SEMILLA[3]}
                onAddMedida={handleAddMedida}
                onTogglePoliciaNotif={handleTogglePoliciaNotif}
                onLogAudit={handleLogAudit}
              />
            )}

            {activeTab === 'reportes' && (
              <ReportesEstadisticos />
            )}

            {activeTab === 'interop' && (
              <Interoperabilidad />
            )}

            {activeTab === 'database' && (
              <ModelosBDDoc />
            )}

            {activeTab === 'plan' && (
              <PlanesNormas />
            )}

            {activeTab === 'auditoria' && (
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="h-5 w-5 text-slate-700" />
                    <div>
                      <h3 className="text-sm font-sans font-bold text-slate-900 uppercase">Libro de Actas y Logs de Auditoría Judicial</h3>
                      <p className="text-[10px] text-slate-500">Trazabilidad absoluta e inalterable del sistema de control administrativo SIGEJ-VE.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAuditoriaLogs(AUDITORIA_SEMILLA);
                      localStorage.setItem('sigej_logs', JSON.stringify(AUDITORIA_SEMILLA));
                      alert('Libro de auditorías depurado a la versión semilla oficial.');
                    }}
                    className="text-[10px] font-mono font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 px-2 py-1 rounded transition cursor-pointer"
                  >
                    Resetear Logs
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-normal">
                  Cada consulta por cédula, sorteo de causa, firma electrónica judicial, o cambio de estado procesal es capturada de forma inmediata, inhabilitando la alteración retrospectiva de la información. Los registros de auditoría se conservan de forma inmutable.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200">
                        <th className="p-2">Fecha / Hora</th>
                        <th className="p-2">Operador Judicial</th>
                        <th className="p-2">Acción Decretada</th>
                        <th className="p-2">Detalles Técnicos</th>
                        <th className="p-2">Motivo Legal / Justificación</th>
                        <th className="p-2 font-mono">Dirección IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-[11px] leading-relaxed">
                      {auditoriaLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 font-sans">
                          <td className="p-2 font-mono text-slate-500 whitespace-nowrap">
                            {new Date(log.fecha).toLocaleString()}
                          </td>
                          <td className="p-2">
                            <strong className="text-slate-900 block">{log.usuario}</strong>
                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                              {log.rol.toUpperCase()} | {log.cedula}
                            </span>
                          </td>
                          <td className="p-2 font-semibold text-slate-800">
                            {log.accion}
                          </td>
                          <td className="p-2 text-slate-600">
                            {log.detalles}
                            <span className="block text-[9px] text-slate-400 font-mono">ID Registro: {log.registroId} (Tabla: {log.tablaAfectada})</span>
                          </td>
                          <td className="p-2 text-slate-700 italic bg-amber-50/20 max-w-xs">
                            {log.motivo}
                          </td>
                          <td className="p-2 font-mono text-slate-500">
                            {log.ip}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-sans font-bold text-slate-300">
            © 2026 TRIBUNAL SUPREMO DE JUSTICIA - REPÚBLICA BOLIVARIANA DE VENEZUELA
          </p>
          <p className="text-[10px] text-slate-500 max-w-2xl mx-auto">
            SIGEJ-VE: Sistema Integrado de Gestión Judicial para Venezuela. Plataforma de soberanía judicial digital incorruptible. Diseñado con total cumplimiento de los más altos estándares de transparencia y seguridad ciudadana.
          </p>
          <p className="text-[10px] text-amber-500 font-mono">
            "El SIGEJ-VE debe posicionarse como un sistema formal, prestigioso, de nivel tecnológico soberano e incorruptible que inspire absoluta confianza en la ciudadanía."
          </p>
        </div>
      </footer>

      {/* MODAL DE AUTENTICACIÓN DIGITAL SEGURA */}
      <ModalAutenticacion
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        targetRole={authModalRole}
        onLoginSuccess={handleLoginSuccess}
        onLogAudit={handleLogAudit}
      />
    </div>
  );
}
