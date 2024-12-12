import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useState } from "react";
import TreeModel from "tree-model-improved";
import { ITreeObjDir, TreeObj, ITreeObjFile, IExtraActions } from "./types";

interface IBackend {
  data: ITreeObjDir;
  onMove: (
    srcIds: string[],
    dstParentId: string | null,
    dstIndex: number
  ) => void;
  onToggle: (id: string, isOpen: boolean) => void;
  onEdit: (id: string, name: string) => void;
  extraActions: IExtraActions;
}

function findById(
  node: TreeModel.Node<TreeObj>,
  id: string
): TreeModel.Node<TreeObj> | undefined {
  return node.first((n: any) => n.model.id === id);
}

function getNodeId(node: TreeModel.Node<TreeObj>) {
  return node.model.id;
}

function getNodePathStr(node: TreeModel.Node<TreeObj>) {
  return node.getPath().map(getNodeId).join("/");
}

/**
 * function that sorts the tree recursively first by the folder name then by file name
 * @param node
 */
function sortNodeTree(node: TreeObj): TreeObj {
  if (node.type === "file") {
    return node;
  }
  // directory
  const children = node.children
    .slice()
    .sort(
      (a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
    )
    .map(sortNodeTree);
  return {
    ...node,
    children
  };
}

const confirmAsync = (q: string) =>
  new Promise<void>((resolve, reject) => {
    const result = window.confirm(q);
    if (result) {
      return resolve();
    }
    return reject(new Error("Not confirmed"));
  });

function useTreeBackend<T extends ITreeObjDir = ITreeObjDir>(
  initialData: T,
  onChange?: (v: T) => void
): IBackend {
  const [data, setData] = useState<T>(initialData!);
  useEffect(() => {
    setData(initialData!);
  }, [initialData]);

  const root = useMemo(() => new TreeModel().parse(data), [data]);
  const find = useCallback((id) => findById(root, id), [root]);
  const update = () => {
    const newTree = { ...(sortNodeTree(root.model) as T) };
    setData(newTree);
    onChange?.(newTree);
  };

  const onMove = (
    srcIds: string[],
    dstParentId: string | null,
    dstIndex: number
  ) => {
    const dstParent = dstParentId ? find(dstParentId) : root;
    if (!dstParent) return;
    const dstParentPathId = getNodePathStr(dstParent);
    for (const srcId of srcIds) {
      const src = find(srcId);
      if (!src) continue;
      const srcNodePathId = getNodePathStr(src);
      // Prevent folder to be set on a child folder of its.
      // Destination can not be child of the source.
      if (dstParentPathId.startsWith(srcNodePathId)) continue;
      const newItem = new TreeModel().parse(src.model);
      dstParent.addChildAtIndex(newItem, dstIndex);
      src.drop();
    }
    update();
  };

  const onToggle = (id: string, isOpen: boolean) => {
    const node = find(id);
    if (node) {
      node.model.isOpen = isOpen;
      update();
    }
  };

  const onEdit = (id: string, name: string) => {
    const node = find(id);
    if (node) {
      node.model.name = name;
      update();
    }
  };

  const onDelete = (id: string) => {
    const node = find(id);
    if (node) {
      // confirmAsync(`Are you sure you want to delete ${node.model.name}?`)
      //   .then(() => {
      //     node.drop();
      //     update();
      //   })
      //   .catch(console.info);
      const confirmed = window.confirm(
        `Are you sure you want to delete ${node.model.name}?`
      );
      if (confirmed) {
        node.drop();
        update();
      }
    }
  };

  const onAddFile = (parentId: string) => {
    const parentNode = find(parentId);
    if (parentNode) {
      const filename = window.prompt(`Type your new file name:`);
      if (filename) {
        const newFile = {
          id: nanoid(10),
          name: filename,
          type: "file"
        } as ITreeObjFile;
        const newItem = new TreeModel().parse(newFile);
        parentNode.addChild(newItem);
      }
    }
    update();
  };

  const onAddFolder = (parentId: string) => {
    const parentNode = find(parentId);
    if (parentNode) {
      const foldername = window.prompt(`Type your new folder name:`);
      if (foldername) {
        const newFile = {
          id: nanoid(10),
          name: foldername,
          type: "directory",
          children: []
        } as ITreeObjDir;
        const newItem = new TreeModel().parse(newFile);
        parentNode.addChildAtIndex(newItem, 0);
      }
    }
    update();
  };

  const extraActions = {
    delete: onDelete,
    addFile: onAddFile,
    addFolder: onAddFolder
  };

  return {
    data: root.model,
    onMove,
    onToggle,
    onEdit,
    extraActions
  };
}

export default useTreeBackend;
