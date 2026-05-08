import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { FarmGroup } from "@/app/components/farm-group-management";

// Dados de exemplo para fazendas
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

const generateFarms = (count: number, startIndex: number = 0) => {
  const farms = [];
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    farms.push({
      id: `farm-${index + 1}`,
      name: `${farmNames[index % farmNames.length]} ${Math.floor(index / farmNames.length) + 1}`,
      client: clients[index % clients.length],
      region: regions[index % regions.length],
      currentVersion: index % 5 === 0 ? '' : `1.${(index % 10)}.${(index % 20)}`,
    });
  }
  return farms;
};

// Criar grupos de exemplo
const createSampleGroups = (): FarmGroup[] => {
  return [
    {
      id: 'group-1',
      name: 'Região Sul - Volume Alto',
      farms: generateFarms(45, 0).filter(f => f.region.startsWith('Sul'))
    },
    {
      id: 'group-2',
      name: 'Parceiros Associados',
      farms: generateFarms(60, 45).filter(f => 
        f.client.includes('Cooperativa') || f.client.includes('Associados')
      )
    },
    {
      id: 'group-3',
      name: 'Sudeste - Teste Beta',
      farms: generateFarms(30, 105).filter(f => f.region.startsWith('Sudeste'))
    },
    {
      id: 'group-4',
      name: 'Versões Desatualizadas',
      farms: generateFarms(80, 135).filter(f => !f.currentVersion || f.currentVersion.startsWith('1.0'))
    },
    {
      id: 'group-5',
      name: 'Centro-Oeste - Novos Clientes',
      farms: generateFarms(35, 215).filter(f => f.region.startsWith('Centro-Oeste'))
    },
    {
      id: 'group-6',
      name: 'Grupo Leiteiro Brasil',
      farms: generateFarms(50, 250).filter(f => f.client === 'Grupo Leiteiro Brasil')
    }
  ];
};

interface FarmGroupContextType {
  groups: FarmGroup[];
  setGroups: (groups: FarmGroup[]) => void;
  addGroup: (group: FarmGroup) => void;
  updateGroup: (id: string, group: FarmGroup) => void;
  deleteGroup: (id: string) => void;
  expandedGroups: Set<string>;
  setExpandedGroups: (expanded: Set<string>) => void;
}

const FarmGroupContext = createContext<FarmGroupContextType | undefined>(undefined);

export function FarmGroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<FarmGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Inicializar com grupos de exemplo
  useEffect(() => {
    const sampleGroups = createSampleGroups();
    setGroups(sampleGroups);
  }, []);

  const addGroup = (group: FarmGroup) => {
    setGroups((prev) => [...prev, group]);
  };

  const updateGroup = (id: string, updatedGroup: FarmGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === id ? updatedGroup : g)));
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <FarmGroupContext.Provider
      value={{
        groups,
        setGroups,
        addGroup,
        updateGroup,
        deleteGroup,
        expandedGroups,
        setExpandedGroups,
      }}
    >
      {children}
    </FarmGroupContext.Provider>
  );
}

export function useFarmGroups() {
  const context = useContext(FarmGroupContext);
  if (context === undefined) {
    throw new Error("useFarmGroups must be used within a FarmGroupProvider");
  }
  return context;
}