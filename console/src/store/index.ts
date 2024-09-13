import { createStore, StoreOptions } from "vuex";

import modules from "./modules";
import { RootState } from "./types";

const storeOptions: StoreOptions<RootState> = { modules };

export const store = createStore(storeOptions);
