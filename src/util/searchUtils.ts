import { Space, Strategy } from "../types/explore";

export function getFilteredSpaces(orderedSpaces: Space[], q: string) {
  return orderedSpaces.filter((space) =>
    JSON.stringify(space).toLowerCase().includes(q.toLowerCase())
  );
}

export function getFilteredSkins(minifiedSkinsArray: any, q: string) {
  return minifiedSkinsArray
    .filter((s: any) => s.key.toLowerCase().includes(q.toLowerCase()))
    .sort((a: any, b: any) => b.spaces - a.spaces);
}

export function getFilteredStrategies(
  minifiedStrategiesArray: Strategy[],
  q: string
) {
  return minifiedStrategiesArray
    .filter((s) => s.key.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.spaces - a.spaces);
}
//
// const minifiedNetworksArray = computed(() =>
//   Object.keys(networks).map((n) => ({
//     spaces: explore.value.networks[n] ?? 0,
//     ...networks[n],
//   }))
// );
// const filteredNetworks = (q = "") =>
//   minifiedNetworksArray.value
//     .filter((n) => JSON.stringify(n).toLowerCase().includes(q.toLowerCase()))
//     .sort((a, b) => b.spaces - a.spaces);
//
// const minifiedPluginsArray = computed(() =>
//   Object.entries(plugins).map(([key, pluginClass]: any) => {
//     const plugin = new pluginClass();
//     plugin.key = key;
//     plugin.spaces = explore.value.plugins[key] ?? 0;
//     return plugin;
//   })
// );
// const filteredPlugins = (q = "") =>
//   minifiedPluginsArray.value
//     .filter((plugin) =>
//       JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
//     )
//     .sort((a, b) => b.spaces - a.spaces);
//
// const minifiedValidationsArray = computed(() =>
//   Object.keys(validations).map((key: any) => ({
//     name: key,
//     spaces: explore.value.validations[key],
//   }))
// );
// const filteredValidations = (q = "") =>
//   minifiedValidationsArray.value
//     .filter((v) => JSON.stringify(v).toLowerCase().includes(q.toLowerCase()))
//     .sort((a, b) => b.spaces - a.spaces);
