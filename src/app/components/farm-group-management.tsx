import { useState, useMemo } from "react";
import { Search, Plus, Trash2, Users, ChevronDown, ChevronUp, X, Edit, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { toast } from "sonner";
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

export function FarmGroupManagement() {
  const { groups, setGroups, expandedGroups, setExpandedGroups } = useFarmGroups();
  
  // Estados para modal de criar/editar grupo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FarmGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedFarms, setSelectedFarms] = useState<Farm[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros de fazendas (combobox)
  const [dropdownClientFilter, setDropdownClientFilter] = useState("all");
  const [dropdownRegionFilter, setDropdownRegionFilter] = useState("all");
  
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
    setIsModalOpen(false);
    toast.success(editingGroup ? 'Grupo atualizado com sucesso!' : 'Novo grupo criado com sucesso!');
  };

  // Excluir grupo
  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    
    const updatedExpanded = new Set(expandedGroups);
    updatedExpanded.delete(groupId);
    setExpandedGroups(updatedExpanded);
  };

  // Toggle expansão do grupo
  const toggleGroupExpansion = (groupId: string) => {
    const updated = new Set(expandedGroups);
    if (updated.has(groupId)) {
      updated.delete(groupId);
    } else {
      // Apenas um grupo aberto por vez
      updated.clear();
      updated.add(groupId);
    }
    setExpandedGroups(updated);
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
  
  // Selecionar todas da página atual
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
    const count = farmsToAdd.length;
    setSelectedFarms([...selectedFarms, ...farmsToAdd]);
    setTempSelectedFarmIds(new Set());
    
    // Feedback visual de sucesso
    toast.success(`${count} ${count === 1 ? 'fazenda adicionada' : 'fazendas adicionadas'} ao grupo com sucesso!`, {
      duration: 3000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white px-8 py-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-1">gerenciamento de grupos de fazendas</h1>
            <p className="text-sm text-muted-foreground">
              crie e organize grupos de fazendas para facilitar a distribuição de versões do ideagri.
            </p>
          </div>
          <Button type="button" onClick={openCreateGroupModal} className="gap-2" style={{ backgroundColor: '#500d5b' }}>
            <Plus className="size-4" />
            criar novo grupo
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {groups.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center">
            <Users className="size-12 mx-auto mb-4 text-slate-400" />
            <h3 className="mb-2">nenhum grupo criado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              crie grupos para organizar fazendas e facilitar a distribuição de versões.<br />
              os grupos criados aqui estarão disponíveis globalmente no sistema.
            </p>
            <Button type="button" onClick={openCreateGroupModal} className="gap-2" style={{ backgroundColor: '#500d5b' }}>
              <Plus className="size-4" />
              criar primeiro grupo
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border divide-y">
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              
              // Calcular região predominante
              const regionCounts = group.farms.reduce((acc, farm) => {
                acc[farm.region] = (acc[farm.region] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              const predominantRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
              const regionShort = predominantRegion.split(' - ')[0] || predominantRegion;
              
              // Limitar preview a 5 fazendas
              const previewFarms = group.farms.slice(0, 5);
              const hasMoreFarms = group.farms.length > 5;
              
              return (
                <div key={group.id}>
                  {/* Cabeçalho do grupo - COMPACTO */}
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleGroupExpansion(group.id)}
                      className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="size-4 text-slate-400" />
                      )}
                    </button>
                    
                    <Users className="size-4 text-slate-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-normal text-sm truncate">{group.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{group.farms.length} fazendas</span>
                        {regionShort && (
                          <>
                            <span>•</span>
                            <span>{regionShort}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditGroupModal(group)}
                        className="h-8 w-8 p-0"
                        title="Editar grupo"
                      >
                        <Edit className="size-4 text-slate-400" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGroup(group.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Excluir grupo"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Lista de fazendas expandida - PREVIEW LIMITADO */}
                  {isExpanded && (
                    <div className="px-4 py-2 pl-11 bg-slate-50">
                      <div className="border rounded-md bg-white overflow-hidden">
                        <div className="divide-y">
                          {previewFarms.map((farm) => (
                            <div key={farm.id} className="px-3 py-2 hover:bg-slate-50">
                              <p className="text-sm leading-tight mb-0.5">{farm.name}</p>
                              <p className="text-xs text-muted-foreground leading-tight">
                                {farm.client} • {farm.region} • v{farm.currentVersion || "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                        {hasMoreFarms && (
                          <button
                            type="button"
                            onClick={() => openEditGroupModal(group)}
                            className="w-full px-3 py-2 text-xs text-center text-muted-foreground hover:bg-slate-50 border-t transition-colors"
                          >
                            Ver todas as {group.farms.length} fazendas →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: CRIAR/EDITAR GRUPO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="lowercase">
              {editingGroup ? 'editar grupo' : 'criar novo grupo'}
            </DialogTitle>
            <DialogDescription className="lowercase">
              {editingGroup 
                ? 'altere o nome do grupo e adicione ou remova fazendas.'
                : 'defina um nome para o grupo e adicione as fazendas.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* SEÇÃO 1: NOME DO GRUPO */}
            <div className="space-y-2 pb-4 border-b">
              <Label htmlFor="group-name" className="text-base font-medium lowercase">
                1. nome do grupo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="group-name"
                placeholder="ex: fazendas região sul"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
                className="h-10"
              />
            </div>

            {/* SEÇÃO 2: FAZENDAS ADICIONADAS AO GRUPO - Só exibe quando houver fazendas */}
            {selectedFarms.length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium lowercase">
                    2. fazendas adicionadas ao grupo
                  </Label>
                  <Badge 
                    variant="default"
                    className="bg-[#500d5b]"
                  >
                    {selectedFarms.length} {selectedFarms.length === 1 ? 'fazenda' : 'fazendas'}
                  </Badge>
                </div>
                
                <div className="border rounded-lg bg-white">
                  <div className="max-h-[180px] overflow-y-auto divide-y">
                    {selectedFarms.map((farm) => (
                      <div
                        key={farm.id}
                        className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Check className="size-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm truncate">{farm.name}</p>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            • {farm.client}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFarmFromSelection(farm.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 3: BUSCAR E SELECIONAR FAZENDAS */}
            <div className="space-y-4">
              <Label className="text-base font-medium lowercase">
                {selectedFarms.length > 0 ? '3' : '2'}. buscar e selecionar fazendas
              </Label>
              
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="digite para buscar fazendas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-2 gap-2">
                <Select value={dropdownClientFilter} onValueChange={setDropdownClientFilter}>
                  <SelectTrigger className="h-10">
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
                  <SelectTrigger className="h-10">
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
                      <Search className="size-10 mx-auto mb-3 text-muted-foreground opacity-50" />
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
              className="lowercase"
            >
              cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveGroup}
              disabled={!groupName.trim() || selectedFarms.length === 0}
              style={{ backgroundColor: '#500d5b' }}
              className="lowercase"
            >
              {editingGroup ? 'salvar alterações' : 'criar grupo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}