export class Router {
  routes: Record<string, string>;

  constructor(routes: Record<string, string>) {
    this.routes = routes;

    // handle the 'Back' button
    window.addEventListener('popstate', () => this.loadRoute());

    document.body.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-link]')) {
        e.preventDefault();
        this.navigateTo((target as HTMLAnchorElement).href);
      }
      if (target.matches('button[data-url]')) {
        e.preventDefault();
        this.navigateTo(target.dataset.url!);
      }
    });
    this.loadRoute();
  }

  navigateTo(url: string) {
    history.pushState(null, '', url);
    this.loadRoute();
  }

  loadRoute() {
    const path = window.location.pathname;
    const tagName = this.routes[path] || this.routes['/'];
    const app = document.getElementById('app');
    if (app) app.innerHTML = `<${tagName}></${tagName}>`;
  }
}
