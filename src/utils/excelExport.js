import ExcelJS from "exceljs";

export const exportToExcel = async ({
  sheetName,
  columns,
  data,
}) => {
  const workbook = new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  worksheet.addRows(data);

  worksheet.getRow(1).font = {
    bold: true,
  };

  worksheet.columns.forEach((column) => {
    column.width = 25;
  });

  return workbook;
};