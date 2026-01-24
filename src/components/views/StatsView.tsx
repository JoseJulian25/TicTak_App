"use client";

import { BarChart3, TrendingUp, Clock, Calendar, Users, Folder, FileText } from "lucide-react";

export function StatsView() {
  // Datos de ejemplo
  const stats = {
    todayHours: 2.5,
    weekHours: 18.3,
    monthHours: 76.2,
    avgPerDay: 3.8,
    totalClients: 4,
    totalProjects: 6,
    totalTasks: 14,
    activeClients: 3,
  };

  const topClients = [
    { name: "BanReservas", hours: 32.5, percentage: 43, projects: 2 },
    { name: "Tech Corp", hours: 24.2, percentage: 32, projects: 1 },
    { name: "Freelance", hours: 12.8, percentage: 17, projects: 1 },
    { name: "Personal", hours: 6.7, percentage: 8, projects: 2 },
  ];

  const topProjects = [
    { name: "Sistema de Pagos", client: "BanReservas", hours: 18.5, percentage: 24 },
    { name: "Website Redesign", client: "Tech Corp", hours: 24.2, percentage: 32 },
    { name: "App Móvil", client: "BanReservas", hours: 14.0, percentage: 18 },
    { name: "Portfolio", client: "Personal", hours: 6.7, percentage: 9 },
  ];

  const topTasks = [
    { name: "Desarrollo frontend", project: "Website Redesign", hours: 15.2 },
    { name: "Implementar API de transacciones", project: "Sistema de Pagos", hours: 12.3 },
    { name: "Dashboard principal", project: "App Móvil", hours: 8.5 },
    { name: "Wireframes y mockups", project: "Website Redesign", hours: 9.0 },
  ];

  // Generar datos para el calendario tipo GitHub (últimos 12 meses)
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const hours = Math.random() > 0.3 ? Math.floor(Math.random() * 9) : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        hours,
        level: hours === 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 6 ? 3 : 4,
      });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();

  const organizeByWeeks = (data: typeof heatmapData) => {
    const weeks: typeof heatmapData[] = [];
    let currentWeek: typeof heatmapData = [];
    
    const firstDate = new Date(data[0].date);
    const dayOfWeek = firstDate.getDay();
    
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', hours: 0, level: 0 });
    }
    
    data.forEach((day) => {
      currentWeek.push(day);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', hours: 0, level: 0 });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = organizeByWeeks(heatmapData);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getColorForLevel = (level: number) => {
    if (level === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (level === 1) return 'bg-green-200 dark:bg-green-900';
    if (level === 2) return 'bg-green-400 dark:bg-green-700';
    if (level === 3) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Estadísticas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen completo de tu actividad y tiempo trabajado
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Hoy</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.todayHours}h
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Esta Semana</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.weekHours}h
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Este Mes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.monthHours}h
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Promedio/Día</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {stats.avgPerDay}h
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalClients}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Clientes</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.activeClients} activos este mes
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
              <Folder className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Proyectos</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            En {stats.totalClients} clientes diferentes
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalTasks}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Tareas</div>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Distribuidas en {stats.totalProjects} proyectos
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Actividad del Año
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Menos</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getColorForLevel(level)}`}
                />
              ))}
            </div>
            <span>Más</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            <div className="flex flex-col gap-1 pr-2">
              <div className="h-3"></div>
              {days.map((day, i) => (
                i % 2 === 1 ? (
                  <div key={day} className="h-3 text-xs text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ) : (
                  <div key={day} className="h-3"></div>
                )
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {weekIndex % 4 === 0 && week[0].date && (
                    <div className="h-3 text-xs text-gray-500 dark:text-gray-400">
                      {months[new Date(week[0].date).getMonth()]}
                    </div>
                  )}
                  {weekIndex % 4 !== 0 && <div className="h-3"></div>}
                  
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm ${
                        day.date ? getColorForLevel(day.level) : 'bg-transparent'
                      }`}
                      title={day.date ? `${day.date}: ${day.hours}h` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Clients */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Clientes
            </h2>
          </div>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {client.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {client.projects} {client.projects === 1 ? 'proyecto' : 'proyectos'}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {client.hours}h
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${client.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Proyectos
            </h2>
          </div>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {project.client}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {project.hours}h
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                    style={{ width: `${project.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Top Tareas
            </h2>
          </div>
          <div className="space-y-4">
            {topTasks.map((task, index) => (
              <div key={index} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {task.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {task.project}
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                  {task.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
