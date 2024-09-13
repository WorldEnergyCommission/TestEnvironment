import { envProjectOpenSubpage } from "@/utils/env";

export function getProjectPath(id: string) {
  return `/projects/${id}${envProjectOpenSubpage}`;
}
