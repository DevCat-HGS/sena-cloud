declare module 'luckyexcel' {
  interface LuckyExcelOptions {
    name?: string;
    data?: ArrayBuffer;
  }

  interface LuckySheetData {
    sheets: any[];
    info: {
      name: string;
      creator: string;
      lastmodifiedby: string;
      createdTime: string;
      modifiedTime: string;
    };
  }

  export function transformExcelToLucky(options: LuckyExcelOptions): Promise<LuckySheetData>;
  export function transformLuckyToExcel(luckysheetData: any): Promise<ArrayBuffer>;
}