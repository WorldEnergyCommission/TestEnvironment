export interface INavigationState {
  appNavigation: IAppNavigation[];
  documentationNavigation: IDocumentationNavigation[];
}

export interface IAppNavigation {
  name: string;
  locale: string;
  path: string;
  icon: string;
}

export interface IDocumentationNavigation {
  title: string;
  locale: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface IProjectNavigation {
  name: string;
  locale: string;
  path?: string;
  pathName?: string;
  icon: string;
  requiresOnePermissionOf: string[];
}
