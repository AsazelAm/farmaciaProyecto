import React, { useState } from "react";
import type { ContenidoNode } from "../../../Helpers/Contenido"; 

type Props = {
  value: ContenidoNode[];
  onChange: (nodes: ContenidoNode[]) => void;
};

type ParentOption = {
  path: string;   // ej: "0-1-2"
  label: string;  // ej: "1.2.3. Subtema avanzado"
};

/** Aplana el árbol en una lista de opciones (path + label numerado) */
function flattenNodes(
  nodes: ContenidoNode[],
  numberPrefix: number[] = [],
  pathPrefix: number[] = []
): ParentOption[] {
  const result: ParentOption[] = [];

  nodes.forEach((n, idx) => {
    const numParts = [...numberPrefix, idx + 1];     // [1,2,3] → "1.2.3"
    const pathParts = [...pathPrefix, idx];          // [0,1,2] → "0-1-2"
    const path = pathParts.join("-");
    const label = `${numParts.join(".")}. ${n.titulo}`;

    result.push({ path, label });

    if (n.hijos && n.hijos.length > 0) {
      result.push(...flattenNodes(n.hijos, numParts, pathParts));
    }
  });

  return result;
}

/** Inserta un hijo en el árbol en la ruta indicada por path (ej: "0-1-2") */
function addChildAtPath(
  nodes: ContenidoNode[],
  path: string,
  child: ContenidoNode
): ContenidoNode[] {
  const indices = path.split("-").map(Number);
  const copia = [...nodes];

  let current: any = copia;

  indices.forEach((idx, i) => {
    const isLast = i === indices.length - 1;
    const node = current[idx];
    if (!node) return;

    if (isLast) {
      node.hijos = node.hijos || [];
      node.hijos.push(child);
    } else {
      node.hijos = node.hijos || [];
      current = node.hijos;
    }
  });

  return copia;
}

/** Elimina un nodo en la ruta indicada por path */
function removeAtPath(nodes: ContenidoNode[], path: string): ContenidoNode[] {
  const indices = path.split("-").map(Number);
  const copia = [...nodes];

  function helper(levelNodes: ContenidoNode[], level: number): ContenidoNode[] {
    const idx = indices[level];
    if (idx < 0 || idx >= levelNodes.length) return levelNodes;

    if (level === indices.length - 1) {
      // eliminar aquí
      const newLevel = [...levelNodes];
      newLevel.splice(idx, 1);
      return newLevel;
    }

    const node = levelNodes[idx];
    if (!node.hijos || node.hijos.length === 0) return levelNodes;

    const newChildren = helper(node.hijos, level + 1);
    const newLevel = [...levelNodes];
    newLevel[idx] = { ...node, hijos: newChildren };
    return newLevel;
  }

  return helper(copia, 0);
}

/** Render del árbol con numeración 1, 1.1, 1.1.1, ... */
function RenderTree({
  nodes,
  numberPrefix = [],
  pathPrefix = [],
  onRemove,
}: {
  nodes: ContenidoNode[];
  numberPrefix?: number[];
  pathPrefix?: number[];
  onRemove: (path: string) => void;
}) {
  return (
    <ul className="space-y-1 text-sm text-gray-800">
      {nodes.map((n, idx) => {
        const numParts = [...numberPrefix, idx + 1];
        const pathParts = [...pathPrefix, idx];
        const path = pathParts.join("-");
        const numero = numParts.join(".");

        return (
          <li key={path} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {numero}. {n.titulo}
              </span>
              <button
                type="button"
                onClick={() => onRemove(path)}
                className="text-[11px] text-red-500 hover:text-red-600"
              >
                Eliminar
              </button>
            </div>

            {n.hijos && n.hijos.length > 0 && (
              <div className="ml-5 border-l border-dashed border-gray-300 pl-3 mt-1">
                <RenderTree
                  nodes={n.hijos}
                  numberPrefix={numParts}
                  pathPrefix={pathParts}
                  onRemove={onRemove}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const CursoContenidoBuilder: React.FC<Props> = ({ value, onChange }) => {
  const [temaTitulo, setTemaTitulo] = useState("");
  const [subTemaTitulo, setSubTemaTitulo] = useState("");
  const [parentPath, setParentPath] = useState<string>("");

  const opcionesPadre = flattenNodes(value);

  const addTema = () => {
    if (!temaTitulo.trim()) return;
    const nuevo: ContenidoNode = { titulo: temaTitulo.trim(), hijos: [] };
    onChange([...value, nuevo]);
    setTemaTitulo("");
  };

  const addSubtema = () => {
    if (!parentPath || !subTemaTitulo.trim()) return;

    const nuevo: ContenidoNode = { titulo: subTemaTitulo.trim(), hijos: [] };
    const actualizado = addChildAtPath(value, parentPath, nuevo);
    onChange(actualizado);
    setSubTemaTitulo("");
  };

  const handleRemove = (path: string) => {
    const actualizado = removeAtPath(value, path);
    onChange(actualizado);
  };

  return (
    <div className="mt-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 to-blue-50/80">
        <h4 className="text-sm font-semibold text-gray-900">
          Contenido del Curso
        </h4>
        <p className="text-xs text-gray-600">
          Agrega temas y subtemas en varios niveles: 1, 1.1, 1.1.1, 2, 2.1, ...
        </p>
      </div>

      {/* Alta de temas y subtemas */}
      <div className="px-4 sm:px-6 py-4 space-y-4 bg-slate-50/60">
        {/* Tema principal */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tema principal
            </label>
            <input
              value={temaTitulo}
              onChange={(e) => setTemaTitulo(e.target.value)}
              placeholder="Ej. Instalación de placas base y conectores"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={addTema}
            className="md:self-end px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 shadow-sm"
          >
            Agregar tema
          </button>
        </div>

        {/* Subtema / hijo de cualquier nivel */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="md:w-64">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subtema de
            </label>
            <select
              value={parentPath}
              onChange={(e) => setParentPath(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecciona el nodo padre</option>
              {opcionesPadre.map((opt) => (
                <option key={opt.path} value={opt.path}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Subtema
            </label>
            <input
              value={subTemaTitulo}
              onChange={(e) => setSubTemaTitulo(e.target.value)}
              placeholder="Ej. Explicar los tipos de cables y conectores"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={addSubtema}
            className="md:self-end px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 shadow-sm"
          >
            Agregar subtema
          </button>
        </div>
      </div>

      {/* Vista previa numerada */}
      <div className="px-4 sm:px-6 py-4 max-h-72 overflow-y-auto">
        {value.length === 0 ? (
          <p className="text-xs text-gray-500">
            Aún no has agregado contenido. Empieza con un tema principal y luego
            agrega subtemas en los niveles que necesites.
          </p>
        ) : (
          <RenderTree nodes={value} onRemove={handleRemove} />
        )}
      </div>
    </div>
  );
};

export default CursoContenidoBuilder;
