# dashboard

The dashboard component should be written with the current angular version and should feature pages that consist of
a 3 rows x 5 columns grid. Each component has an id and supported grid sizes in rows and columns. In the first part,
focus on matching the design with the written component. In the second part, the data fetching will be implemented.

# Local development

1. Run `npm i`
2. Run `npm run start`

# Add new module

Use either angular cli to add module/component or copy folder from another module. Either way the new module should be located unter `src/app/modules/new-module-name`.

The component class neets to implement an interface & extend the abstract base class

```ts
import { AbstractModuleComponent } from 'src/app/modules/abstract-module.component';

...

export class NewModuleName
  extends AbstractModuleComponent
  implements OnInit
```

Adapt module to export component. Then Module can be used in `src/app/modules/modules.components.ts`. In its corresponding markup (`src/app/modules/modules.components.html`) it needs to be added to the other components.
