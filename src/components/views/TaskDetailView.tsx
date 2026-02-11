import { useState } from "react";
import {
  Building2,
  FolderKanban,
  CheckSquare,
  ChevronRight,
  Clock,
  BarChart3,
  Timer,
  Calendar,
  Play,
  Flame,
  Trophy,
  Zap,
  Target,
  TrendingUp,
  Download,
  ArrowRightLeft,
  Trash2,
  Edit,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
  onStartTimer?: () => void;
}

export function TaskDetailView({ taskId, onBack, onStartTimer }: TaskDetailViewProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState("Implementar Sistema de Login");
  const [description, setDescription] = useState(
    "Crear el sistema de autenticación completo con JWT, validación de usuarios y recuperación de contraseña."
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [filterSessions, setFilterSessions] = useState("all");
  const [sortSessions, setSortSessions] = useState("date-desc");

  // Mock data
  const breadcrumb = {
    client: { name: "TechCorp Inc.", icon: Building2, color: "text-blue-500" },
    project: { name: "App Web Corporativa", icon: FolderKanban, color: "text-purple-500" },
    task: { name: title, icon: CheckSquare, color: "text-green-500" },
  };

  const metrics = [
    {
      icon: Clock,
      value: "15h 30m",
      label: "Tiempo Total",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: BarChart3,
      value: "23",
      label: "Total Sesiones",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Timer,
      value: "40m",
      label: "Promedio/Sesión",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: Calendar,
      value: "Hace 2 horas",
      label: "Última Sesión",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const performanceStats = [
    { icon: Flame, label: "Mejor racha", value: "5 días consecutivos", color: "text-orange-500" },
    { icon: Trophy, label: "Sesión más larga", value: "2h 15m (15/01/2026)", color: "text-yellow-500" },
    { icon: Zap, label: "Sesión más corta", value: "15m (10/01/2026)", color: "text-purple-500" },
    { icon: Target, label: "Días trabajados", value: "12 días", color: "text-blue-500" },
    { icon: TrendingUp, label: "Racha actual", value: "2 días", color: "text-green-500" },
  ];

  const sessions = [
    {
      id: 1,
      date: "Hoy",
      items: [
        { start: "10:30", end: "12:15", duration: "1h 45m" },
        { start: "14:00", end: "15:20", duration: "1h 20m" },
      ],
    },
    {
      id: 2,
      date: "Ayer",
      items: [
        { start: "09:00", end: "11:30", duration: "2h 30m" },
        { start: "16:00", end: "17:45", duration: "1h 45m" },
      ],
    },
    {
      id: 3,
      date: "Lunes 8 Ene",
      items: [{ start: "13:00", end: "14:30", duration: "1h 30m" }],
    },
  ];

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    // Save logic here
  };

  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    // Save logic here
  };

  const handleStartTimer = () => {
    if (onStartTimer) {
      onStartTimer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
          >
            <breadcrumb.client.icon className={`h-4 w-4 ${breadcrumb.client.color}`} />
            <span className="truncate max-w-[120px] md:max-w-none">{breadcrumb.client.name}</span>
          </button>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
          >
            <breadcrumb.project.icon className={`h-4 w-4 ${breadcrumb.project.color}`} />
            <span className="truncate max-w-[120px] md:max-w-none">{breadcrumb.project.name}</span>
          </button>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            <breadcrumb.task.icon className={`h-4 w-4 ${breadcrumb.task.color}`} />
            <span className="truncate max-w-[120px] md:max-w-none">{breadcrumb.task.name}</span>
          </div>
        </nav>

        {/* Task Header */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") handleSaveTitle();
                  if (e.key === "Escape") {
                    setTitle("Implementar Sistema de Login");
                    setIsEditingTitle(false);
                  }
                }}
                className="text-3xl font-semibold border-blue-500 dark:border-blue-400"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-3xl font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completada</span>
              <Switch checked={isCompleted} onCheckedChange={setIsCompleted} />
            </div>
          </div>

          {isEditingDescription ? (
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Escape") {
                  setDescription(
                    "Crear el sistema de autenticación completo con JWT, validación de usuarios y recuperación de contraseña."
                  );
                  setIsEditingDescription(false);
                }
              }}
              className="mb-6 min-h-[80px] border-blue-500 dark:border-blue-400"
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className={`mb-6 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors ${
                !description && "italic"
              }`}
            >
              {description || "Agregar descripción..."}
            </p>
          )}

          <Button
            onClick={handleStartTimer}
            className="bg-green-500 hover:bg-green-600 text-white h-10 px-6 gap-2 shadow-md"
          >
            <Play className="h-5 w-5" />
            Iniciar Timer
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm text-center"
            >
              <div className={`${metric.bgColor} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Performance Statistics */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Estadísticas de Rendimiento
          </h2>
          <div className="space-y-3">
            {performanceStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}:</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Historial de Sesiones</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={filterSessions} onValueChange={setFilterSessions}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortSessions} onValueChange={setSortSessions}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Fecha ↓</SelectItem>
                  <SelectItem value="date-asc">Fecha ↑</SelectItem>
                  <SelectItem value="duration-desc">Duración ↓</SelectItem>
                  <SelectItem value="duration-asc">Duración ↑</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-500 dark:text-gray-400">Mostrando 23 de 23</span>
            </div>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {sessions.map((dayGroup) => (
                <div key={dayGroup.id}>
                  {/* Day Separator */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {dayGroup.date}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>

                  {/* Session Items */}
                  <div className="space-y-2">
                    {dayGroup.items.map((session, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {session.start} - {session.end}
                            </span>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4">
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              {session.duration}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowMoveDialog(true)}>
            <ArrowRightLeft className="h-4 w-4" />
            Mover a Proyecto
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar Tarea
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              ¿Eliminar tarea?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Se eliminará "{title}". Las 23 sesiones asociadas se mantendrán en el historial general pero ya no estarán
              vinculadas a esta tarea.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                setShowDeleteDialog(false);
                onBack();
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-lg max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Mover tarea a otro proyecto</DialogTitle>
            <DialogDescription>Selecciona el proyecto de destino para esta tarea</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar proyecto..." className="pl-10 h-10" />
            </div>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {/* Mock project list */}
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      TechCorp Inc.
                    </div>
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="project" className="h-4 w-4" disabled />
                        <span className="text-sm text-gray-500">App Web Corporativa (actual)</span>
                      </label>
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="project" className="h-4 w-4" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Sistema de Facturación</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      BanReservas
                    </div>
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="project" className="h-4 w-4" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">Sistema de Pagos</span>
                      </label>
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input type="radio" name="project" className="h-4 w-4" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">App Móvil</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowMoveDialog(false)}>Mover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
