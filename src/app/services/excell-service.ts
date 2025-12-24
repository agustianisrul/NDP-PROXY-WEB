import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { TableHeader } from '../../model/others/TableHeader';
import { DateService } from './date-service';

@Injectable({
    providedIn: 'root'
})
export class ExcelService<T> {

    constructor(private readonly dateService: DateService) {}
    
    async exportToExcel(tableHeader: TableHeader[], dataList: T[], filename: string, nestedProperty: string | null = null): Promise<void> {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add headers
            this.addHeaders(worksheet, tableHeader);

            // Add data rows
            if (!nestedProperty) {
                this.addFlatDataRows(worksheet, dataList, tableHeader);
            } else {
                this.addNestedDataRows(worksheet, dataList, tableHeader, nestedProperty);
            }

            // Generate blob and download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const formattedDate = 'yyyyMMdd-HHmmss';
            const currentDate = this.dateService.now(formattedDate);
            const exportFilename = `${filename} ${currentDate}.xlsx`;
            saveAs(blob, exportFilename);
        } catch (error) {
            throw error;
        }
    }

    private addHeaders(worksheet: ExcelJS.Worksheet, headers: TableHeader[]): void {
        const headerRow = worksheet.addRow(headers.map((item: TableHeader) => item.label));

        // Apply header styles
        headerRow.eachCell((cell, colNumber) => {
            cell.style = {
                font: { bold: true, color: { argb: 'FFFFFFFF' } },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' } // FF0070C0
                },
                alignment: { horizontal: 'center' },
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
    }

    private addFlatDataRows(worksheet: ExcelJS.Worksheet, data: any[], headers: TableHeader[]): void {
        data.forEach((item, index) => {
            const rowData = headers.map((header: TableHeader) => {
                if (header.dateFormat) {
                    return this.dateService.format(item[header.key], header.dateFormat);
                }
                return item[header.key];
            });
            const row = worksheet.addRow(rowData);

            // Alternate row colors for better readability
            if (index % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF0F0F0' }
                    };
                });
            }

            // Add borders to data cells
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
    }

    private addNestedDataRows(worksheet: ExcelJS.Worksheet, data: any[], headers: TableHeader[], nestedProperty: string | null = null): void {
        data.forEach((item, index) => {
            item[nestedProperty || '']?.forEach((nestedItem: any, nestedIndex: any) => {
                const rowData = headers.map((header: TableHeader) => {
                    const keyParts = header.key.split('.');
                    if (keyParts[0] === nestedProperty) {
                        const nestedKey = keyParts.slice(1).join('.');
                        if (header.dateFormat) {
                            return this.dateService.format(nestedItem[nestedKey], header.dateFormat);
                        }
                        return nestedItem[nestedKey];
                    } else {
                        if (nestedIndex > 0) return null;
                        if (header.dateFormat) {
                            return this.dateService.format(item[header.key], header.dateFormat);
                        }
                        return item[header.key];
                    }
                });
                const row = worksheet.addRow(rowData);
                // Alternate row colors for better readability
                if (nestedIndex === 0) {
                    row.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF0F0F0' }
                        };
                    });
                }

                // Add borders to data cells
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });
        });
    }
}