import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

export interface ReportColumn {
  key: string;
  header: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

@Injectable()
export class ReportsService {
  generateCsv(res: Response, fileName: string, data: any[]) {
    const csv = Papa.unparse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    res.send(csv);
  }

  generatePdf(
    res: Response,
    fileName: string,
    title: string,
    columns: ReportColumn[],
    data: any[],
  ) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    doc.pipe(res);

    // 🔹 Cabeçalho
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(2);

    // 🔹 Desenhar tabela
    this.drawTable(doc, columns, data);

    doc.end();
  }

  private drawTable(doc: PDFKit.PDFDocument, columns: ReportColumn[], data: any[]) {
    const startX = 50;
    let y = doc.y;
    const rowHeight = 25;

    const tableWidth = columns.reduce((sum, col) => sum + (col.width || 100), 0);
    const endX = startX + tableWidth;

    // 🔹 Cabeçalho da tabela
    doc.font('Helvetica-Bold').fontSize(11);
    columns.forEach((col, i) => {
      const colX = startX + columns.slice(0, i).reduce((sum, c) => sum + (c.width || 100), 0);
      doc.text(col.header, colX + 4, y, {
        width: col.width || 100,
        align: col.align || 'left',
      });
    });

    y += rowHeight / 2;
    doc.moveTo(startX, y).lineTo(endX, y).strokeColor('#000').stroke();
    y += 5;

    // 🔹 Linhas de dados
    doc.font('Helvetica').fontSize(10);
    data.forEach((item) => {
      if (y > 740) {
        doc.addPage();
        y = 50;
      }

      columns.forEach((col, i) => {
        const colX = startX + columns.slice(0, i).reduce((sum, c) => sum + (c.width || 100), 0);
        const value = col.key.split('.').reduce((o, k) => (o ? o[k] : ''), item);
        doc.text(String(value ?? ''), colX + 4, y, {
          width: col.width || 100,
          align: col.align || 'left',
        });
      });

      y += rowHeight - 10;
      doc.moveTo(startX, y).lineTo(endX, y).strokeColor('#e0e0e0').stroke();
      y += 5;
    });
  }
}
