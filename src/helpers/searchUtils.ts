import { Space, Strategy } from "types/explore";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import categories from "../../snapshot-spaces/spaces/categories.json";

export function getFilteredSpaces(
  orderedSpaces: Space[],
  q: string,
  category: string
) {
  return orderedSpaces.filter((space) => {
    const matchesString = isEmpty(q)
      ? true
      : JSON.stringify(space).toLowerCase().includes(q.toLowerCase());
    if (category === "") {
      return matchesString;
    }

    const extraCategories = get(categories, space.id, []);

    const matchesCategory =
      space.categories?.includes(category.toLowerCase()) ||
      extraCategories.includes(category.toLowerCase());
    return matchesString && matchesCategory;
  });
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

export function getFilteredNetworks(minifiedNetworksArray: any, q: string) {
  return minifiedNetworksArray
    .filter((n: any) =>
      JSON.stringify(n).toLowerCase().includes(q.toLowerCase())
    )
    .sort((a: any, b: any) => b.spaces - a.spaces);
}
export function geFilteredPlugins(minifiedPluginsArray: any, q: string) {
  return minifiedPluginsArray
    .filter((plugin: any) =>
      JSON.stringify(plugin).toLowerCase().includes(q.toLowerCase())
    )
    .sort((a: any, b: any) => b.spaces - a.spaces);
}
