import { Route, Router } from '@vaadin/router';
import './app';
import './components/back';
import './components/header';
import './components/loading-spinner';
import './components/participant-card';
import './pages/detail';
import './pages/index';
import './pages/new';
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
