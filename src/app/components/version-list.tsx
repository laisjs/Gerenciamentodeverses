import { RefreshCw, Plus, Edit, Eye } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

export interface Version {
  id: string;
  version: string;
  type: "mandatory" | "optional";
  preRelease: boolean;
  rolloutStatus: "inProgress" | "blocked" | "notStarted" | "completed" | "scheduled";
  progress: number;
  totalFarms: number;
  createdAt: string;
  launchDate: string | null;
  scheduledDate: string | null;
  installerUrl?: string;
  releaseNotes?: string;
}

const mockVersions: Version[] = [
  {
    id: "1",
    version: "1.2.3678",
    type: "optional",
    preRelease: false,
    rolloutStatus: "inProgress",
    progress: 0,
    totalFarms: 1,
    createdAt: "2026-01-22",
    launchDate: null,
    scheduledDate: null,
    installerUrl: "https://cdn.imilk.com/installers/v1.2.3678.exe",
    releaseNotes: "Correção de bugs e melhorias de performance.",
  },
  {
    id: "2",
    version: "1.2.36",
    type: "mandatory",
    preRelease: true,
    rolloutStatus: "blocked",
    progress: 0,
    totalFarms: 2,
    createdAt: "2026-01-22",
    launchDate: null,
    scheduledDate: null,
    installerUrl: "https://cdn.imilk.com/installers/v1.2.36-beta.exe",
    releaseNotes: "Versão beta para testes internos.",
  },
  {
    id: "3",
    version: "1.2.5",
    type: "mandatory",
    preRelease: false,
    rolloutStatus: "inProgress",
    progress: 0,
    totalFarms: 7,
    createdAt: "2026-01-22",
    launchDate: null,
    scheduledDate: null,
    installerUrl: "https://cdn.imilk.com/installers/v1.2.5.exe",
    releaseNotes: "Nova funcionalidade de relatórios automáticos.",
  },
  {
    id: "4",
    version: "1.3.0",
    type: "optional",
    preRelease: false,
    rolloutStatus: "blocked",
    progress: 0,
    totalFarms: 2,
    createdAt: "2026-01-21",
    launchDate: "2026-01-20T09:43:00",
    scheduledDate: "2026-01-20T09:43:00",
    installerUrl: "https://cdn.imilk.com/installers/v1.3.0.exe",
    releaseNotes: "Integração com sistema de pagamentos.",
  },
  {
    id: "5",
    version: "1.0.0",
    type: "mandatory",
    preRelease: false,
    rolloutStatus: "notStarted",
    progress: 0,
    totalFarms: 0,
    createdAt: "2026-01-21",
    launchDate: null,
    scheduledDate: null,
    installerUrl: "https://cdn.imilk.com/installers/v1.0.0.exe",
    releaseNotes: "Primeira versão estável do sistema.",
  },
  {
    id: "6",
    version: "2.0.0",
    type: "mandatory",
    preRelease: false,
    rolloutStatus: "completed",
    progress: 100,
    totalFarms: 4,
    createdAt: "2026-01-21",
    launchDate: "2025-12-22T09:43:00",
    scheduledDate: "2025-12-22T09:43:00",
    installerUrl: "https://cdn.imilk.com/installers/v2.0.0.exe",
    releaseNotes: "Nova interface e arquitetura completamente reformulada.",
  },
  {
    id: "7",
    version: "1.1.0",
    type: "optional",
    preRelease: false,
    rolloutStatus: "scheduled",
    progress: 0,
    totalFarms: 0,
    createdAt: "2026-01-21",
    launchDate: null,
    scheduledDate: "2026-03-15T09:00:00",
    installerUrl: "https://cdn.imilk.com/installers/v1.1.0.exe",
    releaseNotes: "Melhorias de usabilidade e novos filtros de pesquisa.",
  },
];

const rolloutStatusConfig = {
  inProgress: {
    label: "Em Rollout",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  blocked: {
    label: "Bloqueado",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  notStarted: {
    label: "Não Iniciado",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  completed: {
    label: "Concluído",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  scheduled: {
    label: "Agendado",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

interface VersionListProps {
  onCreateVersion: () => void;
  onEditVersion?: (version: Version) => void;
}

export function VersionList({ onCreateVersion, onEditVersion }: VersionListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-8 py-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="mb-1">versões</h1>
            <p className="text-sm text-muted-foreground">
              gerencie versões do aplicativo desktop e seus rollouts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="size-4 text-slate-400" />
              Atualizar
            </Button>
            <Button className="gap-2" onClick={onCreateVersion}>
              <Plus className="size-4" />
              Criar Versão
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-slate-50">
                <TableHead className="font-medium text-slate-700 lowercase">versão</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">versão ativa</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">status do rollout</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">progresso</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">criação</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">data programada</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase">data de lançamento</TableHead>
                <TableHead className="font-medium text-slate-700 lowercase text-right pr-6">ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockVersions.map((version) => {
                return (
                  <TableRow key={version.id} className="border-b last:border-0">
                    <TableCell className="font-medium py-5">{version.version}</TableCell>
                    <TableCell className="text-muted-foreground py-5">
                      {version.preRelease ? "Sim" : "Não"}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge
                        variant="outline"
                        className={rolloutStatusConfig[version.rolloutStatus].className}
                      >
                        {rolloutStatusConfig[version.rolloutStatus].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="text-sm text-muted-foreground">
                        {version.progress}% ({version.totalFarms} fazendas)
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-5">
                      {new Date(version.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-5">
                      {version.scheduledDate 
                        ? new Date(version.scheduledDate).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-5">
                      {version.launchDate 
                        ? new Date(version.launchDate).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="py-5">
                      {onEditVersion && (() => {
                        const isViewOnly = version.rolloutStatus === "inProgress" || version.rolloutStatus === "completed";
                        return (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditVersion(version)}
                              title="Visualizar versão"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="size-4 text-slate-400" />
                            </Button>
                            {!isViewOnly && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditVersion(version)}
                                title="Editar versão"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="size-4 text-slate-400" />
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}