import { useQuery } from "@tanstack/react-query";
import { ITreeObjDir, TreeObj } from "./types";

const fakeServerData: ITreeObjDir = {
  id: "A",
  name: "Root",
  type: "directory",
  children: [
    {
      id: "B",
      name: "Node 1",
      type: "directory",
      children: [
        {
          id: "D",
          name: "Node 3",
          type: "file"
        }
      ]
    },
    { id: "C", name: "Node 2", type: "file" }
  ]
};

const placeholderData: ITreeObjDir = {
  id: "A",
  name: "Loading...",
  type: "directory",
  children: []
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function fakeFetch() {
  return sleep(2250).then(() => fakeServerData);
}

export default function useServerBackend() {
  const query = useQuery<ITreeObjDir, Error>(["filestore"], fakeFetch, {
    placeholderData
  });
  return query;
}
