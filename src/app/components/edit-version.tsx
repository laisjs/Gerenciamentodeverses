import { useState, Fragment } from "react";
import { ArrowLeft, Info, Lock, Monitor, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Badge } from "@/app/components/ui/badge";
import { FarmSelection } from "@/app/components/farm-selection";
import { useFarmGroups } from "@/app/contexts/farm-group-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

interface Version {
  id: string;
  version: string;
  type: "mandatory" | "optional";
  preRelease: boolean;
  rolloutStatus: "inProgress" | "blocked" | "notStarted" | "completed" | "scheduled";
  installerUrl: string;
  releaseNotes: string;
  totalFarms: number;
  createdAt: string;
  launchDate: string | null;
  scheduledDate: string | null;
}

interface EditVersionProps {
  version: Version;
  onBack: () => void;
}

// Mock data para acompanhamento de rollout
const mockRolloutFarms = [
  {
    id: "f1",
    name: "Fazenda Santa Maria",
    expectedVersion: "1.2.3678",
    totalDevices: 12,
    updatedDevices: 12,
    pendingDevices: 0,
    failedDevices: 0,
    status: "success",
    devices: [
      { id: "d1", machineName: "DESKTOP-01", installedVersion: "1.2.3678", lastUpdate: "2026-02-19 09:30", status: "updated" },
      { id: "d2", machineName: "DESKTOP-02", installedVersion: "1.2.3678", lastUpdate: "2026-02-19 09:45", status: "updated" },
      { id: "d3", machineName: "NOTEBOOK-RH", installedVersion: "1.2.3678", lastUpdate: "2026-02-18 16:20", status: "updated" },
    ],
  },
  {
    id: "f2",
    name: "Agropecuária Vale Verde",
    expectedVersion: "1.2.3678",
    totalDevices: 8,
    updatedDevices: 5,
    pendingDevices: 2,
    failedDevices: 1,
    status: "partial",
    devices: [
      { id: "d4", machineName: "SERVER-01", installedVersion: "1.2.3678", lastUpdate: "2026-02-19 10:00", status: "updated" },
      { id: "d5", machineName: "VET-STATION", installedVersion: "1.2.5", lastUpdate: "2026-01-15 11:20", status: "pending" },
      { id: "d6", machineName: "BALANCA-01", installedVersion: "1.1.0", lastUpdate: "2026-02-19 08:15", status: "failed" },
    ],
  },
  {
    id: "f3",
    name: "Estância Boa Vista",
    expectedVersion: "1.2.3678",
    totalDevices: 4,
    updatedDevices: 0,
    pendingDevices: 4,
    failedDevices: 0,
    status: "none",
    devices: [
      { id: "d7", machineName: "ESC-PRINCIPAL", installedVersion: "1.2.5", lastUpdate: "2026-01-10 14:00", status: "pending" },
      { id: "d8", machineName: "ESC-ANEXO", installedVersion: "1.2.5", lastUpdate: "2026-01-10 14:05", status: "pending" },
    ],
  },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `f-mock-${i}`,
    name: `Fazenda Exemplo ${i + 4}`,
    expectedVersion: "1.2.3678",
    totalDevices: 5,
    updatedDevices: i % 3 === 0 ? 5 : 2,
    pendingDevices: i % 3 === 0 ? 0 : 3,
    failedDevices: 0,
    status: i % 3 === 0 ? "success" : "partial",
    devices: [
      { id: `d-mock-${i}-1`, machineName: "PC-01", installedVersion: "1.2.3678", lastUpdate: "2026-02-19 11:00", status: i % 3 === 0 ? "updated" : "pending" },
    ],
  })),
];

export function EditVersion({ version, onBack }: EditVersionProps) {
  const { groups } = useFarmGroups();
  const [installerUrl, setInstallerUrl] = useState(version.installerUrl || "");
  const [releaseNotes, setReleaseNotes] = useState(version.releaseNotes || "");
  const [expandedFarms, setExpandedFarms] = useState<string[]>([]);
  const [trackingSearch, setTrackingSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const farmsPerPage = 10;
  
  // Estados para seleção de fazendas
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [selectAllFarms, setSelectAllFarms] = useState(false);

  const toggleFarm = (farmId: string) => {
    setExpandedFarms((prev) =>
      prev.includes(farmId) ? prev.filter((id) => id !== farmId) : [...prev, farmId]
    );
  };

  const rolloutStats = {
    totalDevices: 24,
    updated: 17,
    pending: 6,
    failed: 1,
  };

  const getDeviceStatusBadge = (status: string) => {
    switch (status) {
      case "updated":
        return (
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            <span className="text-xs font-medium">Atualizado</span>
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-1.5 text-amber-700">
            <Clock className="size-3.5" />
            <span className="text-xs font-medium">Pendente</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center gap-1.5 text-red-700">
            <AlertCircle className="size-3.5" />
            <span className="text-xs font-medium">Falha</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getFarmStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">100% Atualizada</Badge>;
      case "partial":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Parcialmente</Badge>;
      case "none":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Não Atualizada</Badge>;
      default:
        return null;
    }
  };

  // Calcular total de fazendas que receberão a versão
  const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
  const totalSelectedFarms = selectedGroups.reduce((acc, g) => acc + g.farms.length, 0);

  // Determinar se a versão está em modo de visualização apenas
  const isViewOnly = version.rolloutStatus === "inProgress" || version.rolloutStatus === "completed";

  // Determinar status badge
  const getStatusBadge = () => {
    switch (version.rolloutStatus) {
      case "inProgress":
        return <Badge className="bg-blue-600">Em Andamento</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Concluída</Badge>;
      case "blocked":
        return <Badge className="bg-red-600">Bloqueada</Badge>;
      case "scheduled":
        return <Badge className="bg-purple-600">Agendada</Badge>;
      default:
        return <Badge className="bg-slate-600">Não Iniciada</Badge>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isViewOnly) {
      return;
    }

    console.log({
      versionId: version.id,
      installerUrl,
      releaseNotes,
      groups,
      selectedGroupIds,
      totalSelectedFarms,
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 text-slate-400" />
            Voltar para listagem
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1">versão {version.version}</h1>
            <p className="text-sm text-muted-foreground">
              {isViewOnly 
                ? "acompanhamento e detalhes da versão ativa no sistema."
                : "edite as informações básicas e os grupos de rollout desta versão."}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
          
          {/* Seção de Acompanhamento (Apenas se for visualização de versão em rollout/concluída) */}
          {isViewOnly && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="mb-1">acompanhamento da instalação</h2>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">atualizado em tempo real</span>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <SummaryCard 
                  label="Total de Devices" 
                  value={rolloutStats.totalDevices} 
                  icon={<Monitor className="size-5 text-slate-400" />}
                />
                <SummaryCard 
                  label="Devices Atualizados" 
                  value={rolloutStats.updated} 
                  percentage={Math.round((rolloutStats.updated / rolloutStats.totalDevices) * 100)}
                  color="success"
                />
                <SummaryCard 
                  label="Devices Pendentes" 
                  value={rolloutStats.pending} 
                  percentage={Math.round((rolloutStats.pending / rolloutStats.totalDevices) * 100)}
                  color="warning"
                />
                <SummaryCard 
                  label="Falhas na Instalação" 
                  value={rolloutStats.failed} 
                  percentage={Math.round((rolloutStats.failed / rolloutStats.totalDevices) * 100)}
                  color="danger"
                />
              </div>

              {/* Tabela de Acompanhamento Granular */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input 
                      placeholder="Buscar fazenda..." 
                      className="pl-9 h-8 text-xs bg-white"
                      value={trackingSearch}
                      onChange={(e) => setTrackingSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-[11px] uppercase tracking-wider font-semibold">
                      Filtrar por Status
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-slate-50 hover:bg-slate-50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-medium text-slate-700 h-12 lowercase">fazenda</TableHead>
                      <TableHead className="text-center font-medium text-slate-700 h-12 lowercase">devices</TableHead>
                      <TableHead className="text-center font-medium text-slate-700 h-12 lowercase">ok</TableHead>
                      <TableHead className="text-center font-medium text-slate-700 h-12 lowercase">pendentes</TableHead>
                      <TableHead className="text-center font-medium text-slate-700 h-12 lowercase">falhas</TableHead>
                      <TableHead className="font-medium text-slate-700 h-12 lowercase">status geral</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const filteredFarms = mockRolloutFarms.filter(f => 
                        f.name.toLowerCase().includes(trackingSearch.toLowerCase())
                      );
                      const totalPages = Math.ceil(filteredFarms.length / farmsPerPage);
                      const startIndex = (currentPage - 1) * farmsPerPage;
                      const paginatedFarms = filteredFarms.slice(startIndex, startIndex + farmsPerPage);

                      return (
                        <>
                          {paginatedFarms.map((farm) => {
                            const isExpanded = expandedFarms.includes(farm.id);
                            return (
                              <Fragment key={farm.id}>
                                <TableRow className="border-b last:border-0 hover:bg-slate-50/50 transition-colors group">
                                  <TableCell className="py-5 pl-4">
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        toggleFarm(farm.id);
                                      }}
                                      className="p-1 hover:bg-slate-100 rounded transition-colors"
                                    >
                                      {isExpanded ? (
                                        <ChevronUp className="size-4 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="size-4 text-slate-400" />
                                      )}
                                    </button>
                                  </TableCell>
                                  <TableCell className="text-slate-700 py-5">{farm.name}</TableCell>
                                  <TableCell className="text-center font-medium py-5 text-slate-600">{farm.totalDevices}</TableCell>
                                  <TableCell className="text-center text-emerald-600 font-medium py-5">{farm.updatedDevices}</TableCell>
                                  <TableCell className="text-center text-amber-600 font-medium py-5">{farm.pendingDevices}</TableCell>
                                  <TableCell className="text-center text-red-600 font-medium py-5">{farm.failedDevices}</TableCell>
                                  <TableCell className="py-5">{getFarmStatusBadge(farm.status)}</TableCell>
                                </TableRow>
                                
                                {isExpanded && (
                                  <TableRow className="bg-slate-50/50 border-b">
                                    <TableCell colSpan={7} className="p-0">
                                      <div className="px-12 py-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
                                          <Table>
                                            <TableHeader className="bg-slate-50/80">
                                              <TableRow className="hover:bg-transparent border-b h-10">
                                                <TableHead className="py-0 text-[10px] lowercase tracking-wider font-medium text-slate-400 pl-4">device id</TableHead>
                                                <TableHead className="py-0 text-[10px] lowercase tracking-wider font-medium text-slate-400">nome da máquina</TableHead>
                                                <TableHead className="py-0 text-[10px] lowercase tracking-wider font-medium text-slate-400">versão atual</TableHead>
                                                <TableHead className="py-0 text-[10px] lowercase tracking-wider font-medium text-slate-400">visto em</TableHead>
                                                <TableHead className="py-0 text-[10px] lowercase tracking-wider font-medium text-slate-400 pr-4">status</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {farm.devices.map((device) => (
                                                <TableRow key={device.id} className="border-b last:border-0 hover:bg-slate-50/50 h-11">
                                                  <TableCell className="py-0 text-[11px] font-mono text-slate-500 pl-4">{device.id}</TableCell>
                                                  <TableCell className="py-0 text-[11px] font-medium">{device.machineName}</TableCell>
                                                  <TableCell className="py-0 text-[11px] text-muted-foreground">{device.installedVersion}</TableCell>
                                                  <TableCell className="py-0 text-[11px] text-muted-foreground">{device.lastUpdate}</TableCell>
                                                  <TableCell className="py-0 pr-4">{getDeviceStatusBadge(device.status)}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Fragment>
                            );
                          })}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={7} className="py-4 px-6 border-t">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-muted-foreground">
                                    Mostrando {startIndex + 1} a {Math.min(startIndex + farmsPerPage, filteredFarms.length)} de {filteredFarms.length} fazendas
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={currentPage === 1}
                                      onClick={() => setCurrentPage(p => p - 1)}
                                      className="h-8 px-2"
                                    >
                                      <ChevronLeft className="size-4" />
                                    </Button>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <Button
                                          key={page}
                                          variant={currentPage === page ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => setCurrentPage(page)}
                                          className={`h-8 w-8 p-0 ${currentPage === page ? "bg-[#500d5b]" : ""}`}
                                        >
                                          {page}
                                        </Button>
                                      ))}
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled={currentPage === totalPages}
                                      onClick={() => setCurrentPage(p => p + 1)}
                                      className="h-8 px-2"
                                    >
                                      <ChevronRight className="size-4" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {filteredFarms.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                                Nenhuma fazenda encontrada com os filtros aplicados.
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>
              </div>
              
              <div className="h-4" /> {/* Spacer */}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Alerta Informativo */}
            <Alert style={{ backgroundColor: 'rgba(80, 13, 91, 0.08)', borderColor: 'rgba(80, 13, 91, 0.3)' }}>
              <Info className="size-4" style={{ color: '#500d5b' }} />
              <AlertDescription className="text-sm" style={{ color: 'rgba(80, 13, 91, 0.9)' }}>
                {isViewOnly ? (
                  <>
                    <strong>versão bloqueada para edição:</strong> versões com status "em rollout" ou "concluída" não podem ser editadas por segurança.
                    <br />
                    <span className="text-xs mt-1 block">
                      para editar grupos de fazendas, url do instalador e notas de lançamento, a versão precisa ter status: não iniciada, bloqueada ou agendada.
                    </span>
                  </>
                ) : (
                  <>
                    <strong>atenção:</strong> alterações nesta versão não recriam o rollout, apenas ajustam dados da versão já cadastrada.
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Detalhes da Versão */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="mb-1">detalhes da versão</h2>
                <p className="text-sm text-muted-foreground">
                  informações básicas sobre a versão cadastrada.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Número da Versão - BLOQUEADO */}
                  <div className="space-y-2">
                    <Label htmlFor="version" className="flex items-center gap-2">
                      Número da Versão
                      <Lock className="size-3 text-slate-400" />
                    </Label>
                    <Input
                      id="version"
                      value={version.version}
                      disabled
                      className="bg-slate-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      O número da versão não pode ser alterado após o cadastro.
                    </p>
                  </div>

                  {/* URL do Instalador - EDITÁVEL */}
                  <div className="space-y-2">
                    <Label htmlFor="installer">URL do Instalador</Label>
                    <Input
                      id="installer"
                      type="url"
                      placeholder="https://..."
                      value={installerUrl}
                      onChange={(e) => setInstallerUrl(e.target.value)}
                      disabled={isViewOnly}
                      className={isViewOnly ? "bg-slate-100 cursor-not-allowed" : ""}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL direta para download do pacote de instalação (deve estar acessível)
                    </p>
                  </div>
                </div>

                {/* Notas de Lançamento - EDITÁVEL */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas de Lançamento</Label>
                  <Textarea
                    id="notes"
                    placeholder="Descreva as novidades desta versão..."
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    rows={5}
                    disabled={isViewOnly}
                    className={isViewOnly ? "bg-slate-100 cursor-not-allowed" : ""}
                  />
                  {isViewOnly && (
                    <p className="text-xs text-muted-foreground">
                      As notas de lançamento não podem ser editadas enquanto o rollout estiver ativo ou concluído.
                    </p>
                  )}
                </div>

                {/* Data Programada - BLOQUEADO (apenas visualização) */}
                {version.scheduledDate && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled-date" className="flex items-center gap-2">
                      Data Programada
                      <Lock className="size-3 text-slate-400" />
                    </Label>
                    <Input
                      id="scheduled-date"
                      value={new Date(version.scheduledDate).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      disabled
                      className="bg-slate-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">
                      {version.launchDate 
                        ? "Esta versão foi lançada automaticamente na data programada."
                        : "Esta versão será lançada automaticamente na data e hora especificadas."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Seleção de Fazendas - SEMPRE EXIBIDO */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="mb-1 flex items-center gap-2">
                  seleção de fazendas
                  {isViewOnly && <Lock className="size-4 text-slate-400" />}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isViewOnly 
                    ? "visualização dos grupos e fazendas que receberam esta versão."
                    : "adicione ou remova grupos de fazendas que receberão esta versão."}
                </p>
              </div>

              <FarmSelection
                onSelectedGroupsChange={setSelectedGroupIds}
                onSelectAllFarmsChange={setSelectAllFarms}
                isViewOnly={isViewOnly}
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 pb-8">
              <Button type="button" variant="outline" onClick={onBack}>
                {isViewOnly ? "Fechar" : "Cancelar"}
              </Button>
              {!isViewOnly && (
                <Button 
                  type="submit" 
                  disabled={totalSelectedFarms === 0 && selectedGroupIds.length > 0}
                  style={{ backgroundColor: '#500d5b' }}
                >
                  Salvar Alterações
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  percentage, 
  icon, 
  color = "default" 
}: { 
  label: string; 
  value: number; 
  percentage?: number; 
  icon?: React.ReactNode;
  color?: "success" | "warning" | "danger" | "default";
}) {
  const colorMap = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
    default: "text-slate-900"
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground lowercase">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl ${colorMap[color]}`}>{value}</span>
        {percentage !== undefined && (
          <span className="text-xs text-slate-400">({percentage}%)</span>
        )}
      </div>
    </div>
  );
}