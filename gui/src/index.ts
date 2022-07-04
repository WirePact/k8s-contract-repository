import { Route, Router } from '@vaadin/router';
import './app';

function requireAll(r: any) {
  r.keys().forEach(r);
}
requireAll((require as any).context('./components/', true, /\.ts$/));
requireAll((require as any).context('./pages/', true, /\.ts$/));

import './styles.css';

const routes: Route[] = [
  {
    path: '/',
    component: 'root-app',
    children: [
      {
        name: 'home',
        path: '/',
        component: 'page-index',
      },
      {
        name: 'new',
        path: '/new',
        component: 'page-new',
      },
      {
        name: 'detail',
        path: '/detail/:id',
        component: 'page-detail',
      },
    ],
  },
];

export const root = document.getElementById('outlet') as HTMLElement;
export const router = new Router(root);
router.setRoutes(routes);
