import { Injectable } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

// Define a estrutura que todo relatório deve ter
interface ReportColumn {
  key: string;      // A chave do objeto de dados (ex: 'usuario.nome')
  header: string;   // O título da coluna no relatório (ex: 'Nome do Doador')
  width?: number;   // Largura da coluna no PDF
}

@Injectable()
export class ReportsService {

  /**
   * Gera e envia um ficheiro CSV.
   * @param res - O objeto de resposta do Express.
   * @param fileName - O nome do ficheiro para download.
   * @param data - O array de dados a ser convertido.
   */
  generateCsv(res: Response, fileName: string, data: any[]) {
    const csv = Papa.unparse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    res.send(csv);
  }

  /**
   * Gera e envia um ficheiro PDF com uma tabela.
   * @param res - O objeto de resposta do Express.
   * @param fileName - O nome do ficheiro para download.
   * @param title - O título principal do documento.
   * @param columns - A definição das colunas da tabela.
   * @param data - O array de dados a ser inserido na tabela.
   */
  generatePdf(res: Response, fileName: string, title: string, columns: ReportColumn[], data: any[]) {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    doc.pipe(res);

    // Cabeçalho do Documento
    doc.fontSize(18).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(2);

    // Desenha a Tabela
    this.drawTable(doc, columns, data);

    doc.end();
  }

  private drawTable(doc: PDFKit.PDFDocument, columns: ReportColumn[], data: any[]) {
    const tableTop = doc.y;
    const rowHeight = 25;
    const tableRight = 555; // Margem direita da página A4

    // Desenha o cabeçalho da tabela
    doc.font('Helvetica-Bold').fontSize(10);
    columns.forEach((column, i) => {
      const x = 40 + (i * 120); // Posição X simplificada
      doc.text(column.header, x, tableTop, { width: column.width || 110, align: 'left' });
    });
    doc.moveTo(40, doc.y).lineTo(tableRight, doc.y).stroke();
    doc.moveDown();

    // Desenha as linhas de dados
    doc.font('Helvetica').fontSize(9);
    data.forEach(item => {
      const y = doc.y;
      // Adiciona nova página se o conteúdo exceder o limite
      if (y > 740) {
        doc.addPage();
        // Recomeça a desenhar a tabela na nova página (cabeçalho, etc.) - Opcional
      }

      columns.forEach((column, i) => {
        const x = 40 + (i * 120);
        // Acessa dados aninhados (ex: 'usuario.nome')
        const value = column.key.split('.').reduce((o, k) => (o || {})[k], item);
        doc.text(String(value !== undefined && value !== null ? value : ''), x, y, { width: column.width || 110, align: 'left' });
      });
      doc.moveTo(40, doc.y + rowHeight - 5).lineTo(tableRight, doc.y + rowHeight - 5).strokeColor('#dddddd').stroke();
      doc.moveDown(2);
    });
  }
}
