import { createStore, StoreOptions } from "vuex";

import modules from "./modules";

const mockedStoreOptions: StoreOptions<any> = { modules };

export const mockedStore = createStore(mockedStoreOptions);
