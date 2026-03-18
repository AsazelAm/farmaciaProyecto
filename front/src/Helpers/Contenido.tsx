// front/src/Helpers/Contenido.ts
import { createCursoContenidoApi } from "../Api/CursoContenido";

export type ContenidoNode = {
  titulo: string;
  descripcion?: string;
  hijos?: ContenidoNode[];
};

export async function saveContenidoTree(
  cursoId: number,
  nodes: ContenidoNode[],
  parentId: number | null = null,
  nivel = 0
) {
  let orden = 1;
  for (const n of nodes) {
    const resp = await createCursoContenidoApi(cursoId, {
      titulo: n.titulo,
      descripcion: n.descripcion,
      padre_id: parentId,
      orden,
      nivel,
    });

    const nuevoId = resp.id; 

    if (n.hijos && n.hijos.length > 0) {
      await saveContenidoTree(cursoId, n.hijos, nuevoId, nivel + 1);
    }

    orden++;
  }
}
