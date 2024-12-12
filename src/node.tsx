import "./styles.css";
import { memo } from "react";
import { Tree, NodeRendererProps, NodeHandlers } from "react-arborist";
import {
  FaFolderOpen,
  FaFolder,
  FaFolderPlus as FolderPlus,
  FaTrashAlt as Trash
} from "react-icons/fa";
import {
  FiChevronDown as ChevronDown,
  FiChevronRight as ChevronRight,
  FiFileText as FileText,
  FiEdit2 as Edit,
  FiFilePlus as FilePlus
} from "react-icons/fi";
import classNames from "classnames";
import { IExtraActions, ITreeObjDir, ITreeObj } from "./types";
import { useExtraActions } from "./utils";

const size = 16;
const smallSize = 12;
const color = "#999";
const gray = "#2C2C2C";

interface IconProps {
  isFolder: boolean;
  toggle: React.MouseEventHandler<Element>;
  isSelected: boolean;
  isOpen: boolean;
}

function Icon({ isFolder, isSelected, toggle, isOpen }: IconProps) {
  if (isFolder) {
    const Folder = isOpen ? FaFolderOpen : FaFolder;
    return (
      <Folder
        onClick={toggle}
        className="icon folder"
        // fillOpacity="0.7"
        color="#81CFFA"
        size={size}
      />
    );
  } else {
    return (
      <FileText
        className="icon file"
        stroke={isSelected ? gray : "#333"}
        strokeOpacity={isSelected ? "0.8" : "0.4"}
        size={size}
      />
    );
  }
}

type FormProps = { defaultValue: string } & NodeHandlers;

function RenameForm({ defaultValue, submit, reset }: FormProps) {
  const inputProps = {
    defaultValue,
    autoFocus: true,
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      submit(e.currentTarget.value);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          submit(e.currentTarget.value);
          break;
        case "Escape":
          reset();
          break;
      }
    }
  };
  return <input type="text" {...inputProps} />;
}

type TitleActionsProps<T extends ITreeObj> = Pick<
  NodeRendererProps<T>,
  "data" | "state" | "handlers"
> & {
  isFolder: boolean;
  extraActions: IExtraActions;
};

function TitleActions<T extends ITreeObj>(props: TitleActionsProps<T>) {
  const { data, handlers, state, isFolder, extraActions } = props;
  if (state.isEditing) {
    return <RenameForm defaultValue={data.name} {...handlers} />;
  }
  const folderActions = isFolder ? (
    <>
      <button onClick={() => extraActions.addFile(data.id)} title="Add File">
        <FilePlus size={smallSize} color={gray} />
      </button>
      <button
        onClick={() => extraActions.addFolder(data.id)}
        title="Add Directory"
      >
        <FolderPlus size={smallSize} color={gray} />
      </button>
    </>
  ) : null;
  return (
    <span className="row-title">
      <span>{data.name}</span>
      <span className="actions">
        <button onClick={handlers.edit} title="Rename">
          <Edit size={smallSize} color={gray} />
        </button>
        {folderActions}
        <button onClick={() => extraActions.delete(data.id)} title="Delete">
          <Trash size={smallSize} color={gray} />
        </button>
      </span>
    </span>
  );
}

// const selectOnClick1 = { selectOnClick: true };

export default function Node<T extends ITreeObj>(props: NodeRendererProps<T>) {
  const { innerRef, styles, data, handlers, state } = props;
  const isFolder = data.type === "directory";
  const isOpen = !!state.isOpen;
  const extraActions = useExtraActions();
  return (
    <div
      ref={innerRef}
      className={classNames("row", state)}
      style={styles.row}
      // onClick={(e) => handlers.select(e, selectOnClick1)}
      // @ts-ignore
      onClick={handlers.select}
    >
      <div className="row-contents" style={styles.indent}>
        <Icon
          toggle={handlers.toggle}
          isFolder={isFolder}
          isOpen={isOpen}
          isSelected={state.isSelected}
        />
        <TitleActions
          isFolder={isFolder}
          data={data}
          handlers={handlers}
          state={state}
          extraActions={extraActions}
        />
      </div>
    </div>
  );
}
