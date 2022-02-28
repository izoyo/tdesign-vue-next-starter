import { defineStore } from 'pinia';
import router, { asyncRouterList, page404 } from '@/router';
import { store } from '@/store';

function filterPermissionsRouters(routes, roles) {
  const res = [];
  routes.forEach((route) => {
    const children = [];
    route.children?.forEach((childRouter) => {
      const roleCode = childRouter.meta?.roleCode || childRouter.name;
      if (roles.indexOf(roleCode) !== -1) {
        children.push(childRouter);
      }
    });
    if (children.length > 0) {
      route.children = children;
      res.push(route);
    }
  });
  return res;
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: [],
  }),
  actions: {
    async initRoutes(roles) {
      let accessedRouters;

      // special token
      if (roles.includes('ALL_ROUTERS')) {
        accessedRouters = asyncRouterList;
      } else {
        accessedRouters = filterPermissionsRouters(asyncRouterList, roles);
      }

      this.routers = accessedRouters;

      // register routers
      accessedRouters.concat(page404).forEach((item) => {
        router.addRoute(item);
      });
    },
    async restore() {
      this.routers.concat(page404).forEach((item) => {
        if (router.hasRoute(item.name)) router.removeRoute(item.name);
      });
      this.routers = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
