/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module 'ApplicationRoles' {
  const ApplicationRoles: any;
  export = ApplicationRoles;
}
