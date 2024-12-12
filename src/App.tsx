import { useState } from "react";
import { Tree, NodeRenderer } from "react-arborist";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Node from "./node";
import useTreeBackend from "./tree-backend";
import useServerBackend from "./server-backend";
import AutoSize from "react-virtualized-auto-sizer";
import { ExtraActionsContext } from "./utils";
import { ITreeObjDir, ITreeObj } from "./types";

import "./styles.css";

type IGTreeProps<T extends ITreeObj = ITreeObjDir> = Parameters<
  typeof Tree
>[0] & {
  data: T;
  onChange?: (tree: T) => void;
  children: NodeRenderer<T>; // Pick<Parameters<typeof Tree>[0], 'children'>
};

function GTree(props: IGTreeProps) {
  const {
    width,
    height,
    data: serverData,
    onChange,
    indent = 15,
    children: ChildrenComponent = Node,
  } = props;
  const { data, onMove, onToggle, onEdit, extraActions } = useTreeBackend(
    serverData!,
    onChange
  );

  console.log("DATA ", data);
  return (
    <ExtraActionsContext.Provider value={extraActions}>
      <Tree
        className="react-aborist"
        data={data}
        onMove={onMove}
        onToggle={onToggle}
        onEdit={onEdit}
        height={height}
        width={width}
        indent={indent}
        // hideRoot
      >
        {ChildrenComponent}
      </Tree>
    </ExtraActionsContext.Provider>
  );
}

function AppContainer() {
  const { data } = useServerBackend();
  return (
    <div style={{ height: "90%", width: "90%" }}>
      <AutoSize>
        {({ width, height }) => (
          <GTree data={data!} width={width} height={height} />
        )}
      </AutoSize>
    </div>
  );
}

export default function FullApp() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AppContainer />
    </QueryClientProvider>
  );
}
