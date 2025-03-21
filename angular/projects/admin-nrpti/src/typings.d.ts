/* SystemJS module definition */
declare let module: NodeModule;
interface NodeModule {
  id: string;
}

declare module 'ApplicationRoles' {
  const ApplicationRoles: any;
  export = ApplicationRoles;
}
