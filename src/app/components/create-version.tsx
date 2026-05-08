import { useState } from "react";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { FarmSelection } from "@/app/components/farm-selection";
import { useFarmGroups } from "@/app/contexts/farm-group-context";
import { format } from "date-fns";

interface CreateVersionProps {
  onBack: () => void;
}

export function CreateVersion({ onBack }: CreateVersionProps) {
  const { groups } = useFarmGroups();
  const [versionNumber, setVersionNumber] = useState("");
  const [installerUrl, setInstallerUrl] = useState("");
  const [updateType, setUpdateType] = useState("optional");
  const [rolloutType, setRolloutType] = useState("immediate");
  const [isPreRelease, setIsPreRelease] = useState(false);
  const [requiresServerUpdate, setRequiresServerUpdate] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("09:00");
  
  // Estados para seleção de fazendas
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Calcular total de fazendas que receberão a versão
  const selectedGroups = groups.filter(g => selectedGroupIds.includes(g.id));
  const totalSelectedFarms = selectedGroups.reduce((acc, g) => acc + g.farms.length, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      versionNumber,
      installerUrl,
      updateType,
      rolloutType,
      isPreRelease,
      requiresServerUpdate,
      releaseNotes,
      groups,
      selectedGroupIds,
      totalSelectedFarms,
      scheduledDate,
      scheduledTime,
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="size-4 text-slate-400" />
            Voltar
          </Button>
        </div>
        <h1 className="mb-1">criar nova versão</h1>
        <p className="text-sm text-muted-foreground">
          preencha as informações da nova versão do aplicativo desktop.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-8 py-8">
          <div className="space-y-8">
            {/* Detalhes da Versão */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="mb-1">detalhes da versão</h2>
                <p className="text-sm text-muted-foreground">
                  informações básicas sobre a versão sendo lançada.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="version">Número da Versão</Label>
                    <Input
                      id="version"
                      placeholder="1.2.3"
                      value={versionNumber}
                      onChange={(e) => setVersionNumber(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Formato de versão semântica (ex: 1.0.0 ou 2.1)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Última versão: 1.2.3678
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installer">URL do Instalador</Label>
                    <Input
                      id="installer"
                      type="url"
                      placeholder="https://..."
                      value={installerUrl}
                      onChange={(e) => setInstallerUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL direta para download do pacote de instalação (deve estar acessível)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-start justify-between py-2 px-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="server-update" className="cursor-pointer">
                        Requer Atualização do Servidor
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Servidor deve ser atualizado antes dos clientes
                      </p>
                    </div>
                    <Switch
                      id="server-update"
                      checked={requiresServerUpdate}
                      onCheckedChange={setRequiresServerUpdate}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas de Lançamento</Label>
                  <Textarea
                    id="notes"
                    placeholder="Descreva as novidades desta versão..."
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    rows={5}
                  />
                </div>

                {/* Programação de Data de Lançamento */}
                <div className="space-y-2">
                  <Label>Programar Data de Lançamento (Opcional)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 size-4 text-slate-400" />
                            {scheduledDate ? (
                              format(scheduledDate, "dd 'de' MMMM 'de' yyyy")
                            ) : (
                              <span className="text-muted-foreground">Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        disabled={!scheduledDate}
                        className={!scheduledDate ? "bg-slate-100 cursor-not-allowed" : ""}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se preenchido, a versão será lançada automaticamente na data e hora programadas. Deixe vazio para lançamento imediato.
                  </p>
                </div>
              </div>
            </div>

            {/* Seleção de Fazendas */}
            <div className="bg-white rounded-lg border p-6">
              <div className="mb-6">
                <h2 className="mb-1">seleção de fazendas</h2>
                <p className="text-sm text-muted-foreground">
                  selecione os grupos de fazendas que receberão a versão.
                </p>
              </div>

              <FarmSelection
                onSelectedGroupsChange={setSelectedGroupIds}
              />
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 pb-8">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancelar
              </Button>
              <Button type="submit" disabled={totalSelectedFarms === 0}>
                Criar Versão
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}