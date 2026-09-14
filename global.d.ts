declare module "*.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};
