import { useStore } from "vuex";

export function useToast() {
  const store = useStore();

  return {
    error: (message: string) =>
      store.commit("app/setReport", { message: message, value: true, type: "error" }),
    success: (message: string) =>
      store.commit("app/setReport", { message: message, value: true, type: "success" }),
  };
}
