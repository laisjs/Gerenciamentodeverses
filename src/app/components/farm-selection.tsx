import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useFarmGroups } from "@/app/contexts/farm-group-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Edit } from "lucide-react";

export interface Farm {
  id: string;
  name: string;
  client: string;
  region: string;
  currentVersion: string;
}

export interface FarmGroup {
  id: string;
  name: string;
  farms: Farm[];
}

// Gerar 9.000+ fazendas de exemplo
const farmNames = [
  'Boa Vista', 'Santa Clara', 'Esperança', 'São João', 'Primavera',
  'Sol Nascente', 'Vale Verde', 'Recanto', 'União', 'Progresso',
  'Horizonte', 'Aurora', 'Vitória', 'Liberdade', 'Nova Era',
  'Pioneira', 'Felicidade', 'Paraíso', 'Conquista', 'Sertaneja',
  'Santa Rita', 'São José', 'Bela Vista', 'Monte Alegre', 'Campo Belo',
  'Boa Sorte', 'Estrela', 'Santo Antônio', 'São Pedro', 'Santa Maria'
];

const clients = [
  'Cooperativa Agrícola Sul',
  'Grupo Leiteiro Brasil',
  'Fazendas Unidas Ltda',
  'Laticínios do Vale',
  'Pecuária Moderna S.A.',
  'Agropecuária Central',
  'Leite Forte Cooperativa',
  'Produtores Associados'
];

const regions = [
  'Sul - RS', 'Sul - SC', 'Sul - PR',
  'Sudeste - SP', 'Sudeste - MG', 'Sudeste - RJ',
  'Centro-Oeste - GO', 'Centro-Oeste - MT', 'Centro-Oeste - MS',
  'Norte - PA', 'Nordeste - BA'
];

const generateFarms = (count: number): Farm[] => {
  const farms: Farm[] = [];
  for (let i = 0; i < count; i++) {
    farms.push({
      id: `farm-${i + 1}`,
      name: `${farmNames[i % farmNames.length]} ${Math.floor(i / farmNames.length) + 1}`,
      client: clients[i % clients.length],
      region: regions[i % regions.length],
      currentVersion: i % 5 === 0 ? '' : `1.${(i % 10)}.${(i % 20)}`,
    });
  }
  return farms;
};

const mockFarms: Farm[] = generateFarms(500);

interface FarmSelectionProps {
  onGroupsChange?: (groups: FarmGroup[]) => void;
  onSelectedGroupsChange?: (selectedGroupIds: string[]) => void;
  isViewOnly?: boolean;
}

export function FarmSelection({ onGroupsChange, onSelectedGroupsChange, isViewOnly = false }: FarmSelectionProps) {
  // Usar grupos do contexto global
  const { groups, setGroups } = useFarmGroups();
  
  // Estados para modal de criar/editar grupo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FarmGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedFarms, setSelectedFarms] = useState<Farm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para dropdown de fazendas (combobox)
  const [dropdownClientFilter, setDropdownClientFilter] = useState("all");
  const [dropdownRegionFilter, setDropdownRegionFilter] = useState("all");

  // Estados para seleção de grupos para distribuição
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
  
  // Estado para seleção em lote
  const [tempSelectedFarmIds, setTempSelectedFarmIds] = useState<Set<string>>(new Set());

  // Filtrar fazendas disponíveis (removendo as já selecionadas) - MEMOIZADO
  const availableFarms = useMemo(() => {
    const selectedFarmIds = new Set(selectedFarms.map(f => f.id));
    
    return mockFarms.filter(farm => {
      const notAlreadySelected = !selectedFarmIds.has(farm.id);
      
      // Filtros de cliente e região
      const matchesClientFilter = dropdownClientFilter === "all" || farm.client === dropdownClientFilter;
      const matchesRegionFilter = dropdownRegionFilter === "all" || farm.region === dropdownRegionFilter;
      
      // Filtro de busca textual
      const matchesSearch = searchTerm.trim() === "" || 
        farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farm.region.toLowerCase().includes(searchTerm.toLowerCase());
      
      return notAlreadySelected && matchesClientFilter && matchesRegionFilter && matchesSearch;
    });
  }, [selectedFarms, dropdownClientFilter, dropdownRegionFilter, searchTerm]);

  // Obter listas únicas - MEMOIZADO
  const uniqueClients = useMemo(() => Array.from(new Set(mockFarms.map(f => f.client))), []);
  const uniqueRegions = useMemo(() => Array.from(new Set(mockFarms.map(f => f.region))), []);

  // Abrir modal para criar grupo
  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupName("");
    setSelectedFarms([]);
    setSearchTerm("");
    setDropdownClientFilter("all");
    setDropdownRegionFilter("all");
    setTempSelectedFarmIds(new Set());
    setIsModalOpen(true);
  };

  // Abrir modal para editar grupo
  const openEditGroupModal = (group: FarmGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedFarms([...group.farms]);
    setSearchTerm("");
    setDropdownClientFilter("all");
    setDropdownRegionFilter("all");
    setTempSelectedFarmIds(new Set());
    setIsModalOpen(true);
  };

  // Salvar grupo (criar ou editar)
  const handleSaveGroup = () => {
    if (!groupName.trim() || selectedFarms.length === 0) {
      return;
    }

    let updatedGroups: FarmGroup[];

    if (editingGroup) {
      updatedGroups = groups.map(g =>
        g.id === editingGroup.id
          ? { ...g, name: groupName, farms: selectedFarms }
          : g
      );
    } else {
      const newGroup: FarmGroup = {
        id: `group-${Date.now()}`,
        name: groupName,
        farms: selectedFarms,
      };
      updatedGroups = [...groups, newGroup];
    }

    setGroups(updatedGroups);
    onGroupsChange?.(updatedGroups);
    setIsModalOpen(false);
  };

  // Excluir grupo
  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    
    const updatedSelection = new Set(selectedGroupIds);
    updatedSelection.delete(groupId);
    setSelectedGroupIds(updatedSelection);
    
    onGroupsChange?.(updatedGroups);
    onSelectedGroupsChange?.(Array.from(updatedSelection));
  };

  // Toggle seleção de grupo para distribuição
  const toggleGroupSelection = (groupId: string) => {
    const updated = new Set(selectedGroupIds);
    if (updated.has(groupId)) {
      updated.delete(groupId);
    } else {
      updated.add(groupId);
    }
    setSelectedGroupIds(updated);
    onSelectedGroupsChange?.(Array.from(updated));
  };

  // Remover fazenda
  const removeFarmFromSelection = (farmId: string) => {
    setSelectedFarms(selectedFarms.filter(f => f.id !== farmId));
  };

  // Toggle seleção temporária de fazenda (para adicionar em lote)
  const toggleTempFarmSelection = (farmId: string) => {
    const updated = new Set(tempSelectedFarmIds);
    if (updated.has(farmId)) {
      updated.delete(farmId);
    } else {
      updated.add(farmId);
    }
    setTempSelectedFarmIds(updated);
  };
  
  // Selecionar todas disponíveis
  const selectAllAvailable = () => {
    const updated = new Set(tempSelectedFarmIds);
    availableFarms.forEach(farm => updated.add(farm.id));
    setTempSelectedFarmIds(updated);
  };
  
  // Desselecionar todas
  const deselectAll = () => {
    setTempSelectedFarmIds(new Set());
  };
  
  // Adicionar fazendas selecionadas em lote
  const addSelectedFarmsInBatch = () => {
    const farmsToAdd = mockFarms.filter(farm => tempSelectedFarmIds.has(farm.id));
    setSelectedFarms([...selectedFarms, ...farmsToAdd]);
    setTempSelectedFarmIds(new Set());
  };

  // Calcular totais
  const selectedGroups = groups.filter(g => selectedGroupIds.has(g.id));
  const totalFarms = selectedGroups.reduce((acc, g) => acc + g.farms.length, 0);

  return (
    <div className="space-y-4">
      {/* BLOCO 1 — GERENCIAMENTO DE GRUPOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-0.5">grupos de fazendas</h3>
            <p className="text-xs text-muted-foreground">
              {isViewOnly ? "visualização dos grupos que receberam esta versão" : "selecione os grupos que receberão a versão"}
            </p>
          </div>
          {!isViewOnly && (
            <Button type="button" onClick={openCreateGroupModal} size="sm" className="gap-2 h-8" style={{ backgroundColor: '#500d5b' }}>
              <Plus className="size-4" />
              <span className="text-xs">Novo grupo</span>
            </Button>
          )}
        </div>

        {/* Lista de grupos */}
        {groups.length === 0 ? (
          <div className="border rounded-lg p-6 text-center bg-slate-50">
            <Users className="size-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="mb-1">nenhum grupo criado</h3>
            <p className="text-xs text-muted-foreground mb-3">
              crie grupos para organizar fazendas e facilitar a distribuição de versões.
            </p>
            <Button type="button" onClick={openCreateGroupModal} variant="outline" size="sm" className="gap-2 h-8">
              <Plus className="size-4" />
              <span className="text-xs">Criar primeiro grupo</span>
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {groups.map((group) => {
              // Calcular região predominante
              const regionCounts = group.farms.reduce((acc, farm) => {
                acc[farm.region] = (acc[farm.region] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const predominantRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
              const regionShort = predominantRegion.split(' - ')[0] || predominantRegion;
              
              return (
                <label
                  key={group.id}
                  htmlFor={`select-${group.id}`}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors ${!isViewOnly && 'hover:bg-slate-50 cursor-pointer'}`}
                >
                  <Checkbox
                    id={`select-${group.id}`}
                    checked={selectedGroupIds.has(group.id)}
                    onCheckedChange={() => !isViewOnly && toggleGroupSelection(group.id)}
                    disabled={isViewOnly}
                    className="flex-shrink-0"
                  />
                  <Users className="size-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate leading-tight mb-0.5">{group.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground leading-tight">
                      <span>{group.farms.length} fazendas</span>
                      {regionShort && (
                        <>
                          <span>•</span>
                          <span>{regionShort}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!isViewOnly && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          openEditGroupModal(group);
                        }}
                        className="h-7 w-7 p-0"
                        title="Editar grupo"
                      >
                        <Edit className="size-3 text-slate-400" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteGroup(group.id);
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Excluir grupo"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* BLOCO 2 — RESUMO DA DISTRIBUIÇÃO */}
      {selectedGroupIds.size > 0 && (
        <div className="rounded-lg px-4 py-3 border" style={{ backgroundColor: 'rgba(80, 13, 91, 0.08)', borderColor: 'rgba(80, 13, 91, 0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#500d5b' }}>
              <Users className="size-4 text-white" />
            </div>
            
            <div className="flex items-center gap-4 flex-1 text-sm" style={{ color: 'rgba(80, 13, 91, 0.9)' }}>
              <div className="flex items-center gap-1.5">
                <span>Grupos:</span>
                <span className="font-semibold">{selectedGroupIds.size}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Total de fazendas:</span>
                <span className="font-semibold">{totalFarms}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR/EDITAR GRUPO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
            </DialogTitle>
            <DialogDescription>
              {editingGroup 
                ? 'Altere o nome do grupo e adicione ou remova fazendas.'
                : 'Defina um nome para o grupo e adicione as fazendas.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Nome do grupo */}
            <div className="space-y-2">
              <Label htmlFor="group-name">
                Nome do Grupo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="Ex: Fazendas Região Sul"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Fazendas selecionadas - Exibir apenas quando houver fazendas */}
            {selectedFarms.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fazendas Adicionadas</Label>
                  <Badge variant="secondary">
                    {selectedFarms.length} {selectedFarms.length === 1 ? 'fazenda' : 'fazendas'}
                  </Badge>
                </div>
                
                <div className="border rounded-lg bg-white max-h-[200px] overflow-y-auto">
                  <div className="divide-y">
                    {selectedFarms.map((farm) => (
                      <div
                        key={farm.id}
                        className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
                      >
                        <p className="text-sm truncate flex-1">{farm.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFarmFromSelection(farm.id)}
                        >
                          <X className="size-4 text-slate-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMBOBOX: Busca + Lista de Fazendas */}
            <div className="space-y-3">
              <Label>Adicionar Fazendas</Label>
              
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Digite para buscar fazendas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <Select value={dropdownClientFilter} onValueChange={setDropdownClientFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={dropdownRegionFilter} onValueChange={setDropdownRegionFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as regiões</SelectItem>
                    {uniqueRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Contador de resultados */}
              <div className="flex items-center justify-start text-sm px-1">
                <span className="text-muted-foreground">
                  {availableFarms.length} {availableFarms.length === 1 ? 'fazenda encontrada' : 'fazendas encontradas'}
                </span>
              </div>

              {/* Container da lista com barra sticky */}
              <div className="border rounded-lg overflow-hidden">
                {/* Barra de ações STICKY */}
                {tempSelectedFarmIds.size > 0 ? (
                  /* Quando há fazendas selecionadas - mostrar botões de ação */
                  <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#500d5b] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {tempSelectedFarmIds.size}
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllAvailable}
                          className="h-9 bg-white"
                        >
                          Todas
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={deselectAll}
                          className="h-9 bg-white"
                        >
                          Limpar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={addSelectedFarmsInBatch}
                          className="gap-2 h-9 shadow-sm"
                          style={{ backgroundColor: '#500d5b' }}
                        >
                          <Plus className="size-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : availableFarms.length > 0 ? (
                  /* Quando não há fazendas selecionadas mas há fazendas disponíveis - mostrar opção de selecionar todas */
                  <div className="sticky top-0 z-10 px-4 py-3 bg-slate-50 border-b">
                    <button
                      type="button"
                      onClick={selectAllAvailable}
                      className="flex items-center gap-2 h-9 hover:bg-slate-100 w-full rounded-md px-3 transition-colors text-sm font-normal"
                    >
                      <Checkbox
                        checked={false}
                        className="pointer-events-none"
                      />
                      <span>Selecionar todas disponíveis</span>
                    </button>
                  </div>
                ) : null}
                
                {/* Lista de fazendas */}
                <div className="max-h-[320px] overflow-y-auto divide-y">
                  {availableFarms.length === 0 ? (
                    <div className="py-12 text-center">
                      <Search className="size-10 mx-auto mb-3 text-slate-400 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma fazenda disponível com os filtros aplicados
                      </p>
                    </div>
                  ) : (
                    availableFarms.map((farm) => (
                      <label
                        key={farm.id}
                        htmlFor={`temp-${farm.id}`}
                        className="flex items-start gap-3 p-3.5 hover:bg-purple-50/50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          id={`temp-${farm.id}`}
                          checked={tempSelectedFarmIds.has(farm.id)}
                          onCheckedChange={() => toggleTempFarmSelection(farm.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate mb-1">{farm.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {farm.client} • {farm.region}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveGroup}
              disabled={!groupName.trim() || selectedFarms.length === 0}
            >
              {editingGroup ? 'Salvar Alterações' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}