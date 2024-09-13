# Vue and vuetify upgrade notes

- menu closing issues

  - the menu does not auto close if it opens an dialog / overlay
  - [menu closes](https://github.com/vuetifyjs/vuetify/issues/17004), when nested menu closes - which causes cascading close of dialogs (Energy schema)

- use mounted/unmounted instead of created/destroyed (the latter doesn't trigger sometimes probably due to the vue-facing-decorator)
- don't use component key changing technique to rerender the component from parent - it creates cascading mess for rendering and responsivity

  - refactor component to redraw itself based on changed props and use getters instead of watchers where possible
  - responsivity based on element width example: /ui/components/components/Gauge.vue

## Unrelated errors found in both upgrade and production branch

- mlModels - chart error
- download csv on charts returns empty file
- history/stream anomaly chart draws just the data, no anomaly/prediction
- in settings search by email doesn't work - the api can search just by exact email, which should be changed too
- These permissions requires also the permissions: readDevice, although readDevice is selected

# TODO:
