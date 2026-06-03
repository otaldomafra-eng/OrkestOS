import { useState } from "react";
import { Plus, Trash2, Search, Pencil, Book, FileText, Edit } from "lucide-react";
import { useData } from "../hooks/useData";
import { showToast } from "../utils/toastHelper";

const Bag = () => {
  const {
    notebooks,
    pages,
    createNotebook,
    deleteNotebook,
    loadPages,
    createPage,
    updatePage,
    updateNotebook,
    deletePage
  } = useData();
  const [search, setSearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [tempName, settempName] = useState("");
  const [view, setView] = useState("notebooks");
  const [activeNotebook, setActiveNotebook] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [editorContent, setEditorContent] = useState("");

  
  const updateContent = (value) => {
    if (!activePage) return;
    updatePage(activePage, value);
  };

  const addNotebook = async() => {
    await createNotebook("Novo Caderno");
    showToast({message: 'Novo Caderno Criado', status: "success"})
  };

  const addPage = async () => {
    if (!activeNotebook) return;
    await createPage(activeNotebook);
    await loadPages(activeNotebook);
  };

  const currentNotebook = notebooks.find(nb => nb.id === activeNotebook);
  const currentPage = pages.find(p => p.id === activePage);

  // =========================
  // VIEWS
  // =========================

  const renderNotebooksView = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 px-3">
        <h2 className="text-white text-xl font-semibold">Cadernos</h2>
        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:translate-y-1 active:scale-95 text-white p-3 rounded-lg transition-all cursor-pointer" onClick={addNotebook}>
          <Plus size={24} />
        </button>
      </div>

      <input
        placeholder="Pesquisar cadernos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg outline-none placeholder-white/50 focus:border-white/30"
      />

      <div className="flex-1 overflow-y-auto space-y-2">
        {notebooks
          .filter(nb =>
            nb.name.toLowerCase().includes(search.toLowerCase())
          )
          .map(nb => (
            <div
              key={nb.id}
              onClick={() => {
                setActiveNotebook(nb.id);
                loadPages(nb.id);
                setActivePage(null);
                setView("pages");
              }}
              className={`p-3 rounded-lg cursor-pointer ${activeNotebook === nb.id
                ? "bg-accent-blue/20 border border-accent-blue/40 text-white"
                : "bg-white/5 border border-white/10 text-white/70 hover:border-white/20"
                }`}
            >
              {editingNotebook === nb.id ? (
                <input
                  value={tempName}
                  onChange={(e) => settempName(e.target.value)}
                  onBlur={async() => {
                    if (!tempName.trim()) return;
                    await updateNotebook(nb.id, tempName);
                    showToast({message: "Nome atualizado", status: "success"})
                    setEditingNotebook(null);
                  }}
                  onKeyDown={async(e) => {
                    if (e.key === "Enter") {
                      if (!tempName.trim()) return;
                      await updateNotebook(nb.id, tempName);
                      showToast({message: "Nome atualizado", status: "success"})
                      setEditingNotebook(null);
                    }
                  }}
                  className="bg-transparent text-white outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex justify-between items-center">
                  <span>{nb.name}</span>
                  <div className="flex gap-2">
                    <Pencil
                      size={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNotebook(nb.id);
                        settempName(nb.name);
                      }}
                    />
                    <Trash2
                      size={14}
                      className="text-red-400"
                      onClick={async(e) => {
                        e.stopPropagation();
                        await deleteNotebook(nb.id);
                        showToast({message: `Notebook: ${nb.name} Deleted`, status: "success"})
                        setActiveNotebook(null);
                        setActivePage(null);
                        setView("notebooks");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );

  const renderPagesView = () => {
    if (!currentNotebook) {
      return (
        <div className="flex items-center justify-center h-full text-white/40">
          Selecione um caderno primeiro
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 px-3">
          <h2 className="text-white text-lg font-semibold">
            {currentNotebook.name}
          </h2>
          <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:translate-y-1 active:scale-95 text-white p-3 rounded-xl transition-all cursor-pointer" onClick={addPage}>
            <Plus size={24} />
          </button>
        </div>

        {/* Page Search */}
        <input
          placeholder="Pesquisar páginas..."
          value={pageSearch}
          onChange={(e) => setPageSearch(e.target.value)}
          className="mb-4 px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg outline-none placeholder-white/50 focus:border-white/30"
        />

        <div className="flex-1 overflow-y-auto space-y-2">
          {pages
            .filter(p =>
              p.title
                ?.toLowerCase()
                .includes(pageSearch.toLowerCase())
            )
            .map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePage(p.id);
                  setView("editor");
                }}
                className={`p-3 rounded-lg cursor-pointer ${activePage === p.id
                  ? "bg-accent-green/20 border border-accent-green/40 text-white"
                  : "bg-white/5 border border-white/10 text-white/70 hover:border-white/20"
                  }`}
              >
                <div className="flex justify-between items-center">
                  <span>{p.title}</span>
                  <Trash2
                    size={14}
                    className="text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(p.id, activeNotebook);
                      if (activePage === p.id) setActivePage(null);
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-[80vh] md:h-[85vh] bg-surface-card border border-white/10 rounded-xl p-4 flex flex-col">

      {/* Bottom Navigation */}
      <div className="mb-4 flex justify-around border-b border-white/10 pb-3">
        <button
          onClick={() => setView("notebooks")}
          className={`flex flex-col cursor-pointer items-center ${view === "notebooks" ? "text-indigo-400" : "text-white/40"
            }`}
        >
          <Book size={20} />
          <span className="text-xs">Cadernos</span>
        </button>

        <button
          onClick={() => setView("pages")}
          className={`flex flex-col cursor-pointer items-center ${view === "pages" ? "text-green-400" : "text-white/40"
            }`}
        >
          <FileText size={20} />
          <span className="text-xs">Páginas</span>
        </button>

        <button
          onClick={() => setView("editor")}
          className={`flex flex-col cursor-pointer items-center ${view === "editor" ? "text-purple-400" : "text-white/40"
            }`}
        >
          <Edit size={20} />
          <span className="text-xs">Editor</span>
        </button>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 overflow-hidden">
        {view === "notebooks" && renderNotebooksView()}
        {view === "pages" && renderPagesView()}
        {view === "editor" && currentPage && (<div key={activePage} className="h-full flex flex-col">
          <h2 className="text-white text-lg font-semibold mb-3">
            {currentNotebook?.name} &gt; {currentPage.title}
          </h2>

          <div className="flex gap-2 mb-3">
            <button
              onClick={() =>
                updateContent(editorContent + "**bold**")
              }
              className="text-xs px-2 py-1 bg-white/10 text-white/70 border border-white/10 rounded hover:bg-white/15"
            >
              B
            </button>
            <button
              onClick={() =>
                updateContent(editorContent + "_italic_")
              }
              className="text-xs px-2 py-1 bg-white/10 text-white/70 border border-white/10 rounded hover:bg-white/15"
            >
              I
            </button>
          </div>

          <textarea
            value={editorContent}
            onChange={(e) => {
              setEditorContent(e.target.value);
              updateContent(e.target.value);
            }}
            className="flex-1 w-full bg-white/5 border border-white/10 text-white rounded-lg p-4 focus:outline-none focus:border-white/25 resize-none placeholder-white/50"
          />
          <button
            onClick={async() => {
              try {
                if (!activePage) return;
                await updatePage(activePage, editorContent);
                showToast({ message: "Conteúdo Salvo", status: "success" }); 
              } catch (error) {
                showToast({ message: error.message || "Erro ao Salvar", status: "success" });
              }
            }}
            className="mt-3 px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg self-end"
          >
            Salvar
          </button>
        </div>)}
        {view === "editor" && !currentPage && (
          <div className="flex items-center justify-center flex-1 text-white/40 h-full">
            Selecione uma página para começar a escrever...
          </div>
        )}
      </div>
    </div>
  );
};

export default Bag;
