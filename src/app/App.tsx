import { useState } from "react";
import { Package, Users } from "lucide-react";
import { Toaster } from "sonner";
import { VersionList, type Version } from "@/app/components/version-list";
import { CreateVersion } from "@/app/components/create-version";
import { EditVersion } from "@/app/components/edit-version";
import { FarmGroupManagement } from "@/app/components/farm-group-management";
import { FarmGroupProvider } from "@/app/contexts/farm-group-context";

export default function App() {
  const [activeMenu, setActiveMenu] = useState("versions");
  const [currentView, setCurrentView] = useState<"list" | "create" | "edit">("list");
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  const handleEditVersion = (version: Version) => {
    setSelectedVersion(version);
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedVersion(null);
  };

  const menuItems = [
    { id: "versions", label: "Versões", icon: Package },
    { id: "farm-groups", label: "Grupos de Fazendas", icon: Users },
  ];

  return (
    <FarmGroupProvider>
      <div className="size-full flex bg-slate-50">
        {/* Toaster para notificações */}
        <Toaster position="top-right" richColors closeButton />
        
        {/* Sidebar */}
        <aside className="w-64 bg-white flex flex-col">
          <div className="p-6">
            <h2 className="text-sm text-muted-foreground mb-1">Admin de Atualizações</h2>
          </div>

          <nav className="flex-1 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveMenu(item.id);
                        setCurrentView("list");
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-slate-100 text-foreground"
                          : "text-muted-foreground hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`size-4 ${isActive ? "text-slate-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeMenu === "versions" ? (
            currentView === "list" ? (
              <VersionList onCreateVersion={() => setCurrentView("create")} onEditVersion={handleEditVersion} />
            ) : currentView === "create" ? (
              <CreateVersion onBack={() => setCurrentView("list")} />
            ) : (
              <EditVersion version={selectedVersion!} onBack={handleBackToList} />
            )
          ) : (
            <FarmGroupManagement />
          )}
        </main>
      </div>
    </FarmGroupProvider>
  );
}