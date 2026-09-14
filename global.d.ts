declare module "*.css";

type RouteContext<T extends string> = {
  params: Promise<Record<string, string>>;
};
