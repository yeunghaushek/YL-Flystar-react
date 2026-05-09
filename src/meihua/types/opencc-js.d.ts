declare module "opencc-js" {
  export function Converter(opts: {
    from: "cn" | "tw" | "hk" | "jp";
    to: "cn" | "tw" | "hk" | "jp";
  }): (text: string) => string;
}
