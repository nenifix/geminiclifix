declare module "express" {
  import * as http from "http";

  interface Request {
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
  }

  interface Response {
    json(data: any): void;
    status(code: number): Response;
  }

  interface Application {
    use(...args: any[]): Application;
    get(path: string, handler: (req: Request, res: Response) => void): Application;
    post(path: string, handler: (req: Request, res: Response) => void): Application;
    listen(port: number, callback?: () => void): http.Server;
  }

  function express(): Application;
  namespace express {
    function json(options?: any): any;
  }
  export default express;
}
