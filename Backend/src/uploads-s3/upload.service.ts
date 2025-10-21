import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    // Configuração do S3 Client para se conectar ao R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: this.configService.getOrThrow<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'R2_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Faz upload de um arquivo para o bucket R2, dentro da pasta 'uploads'.
   * @param file O arquivo enviado via Multer (Express.Multer.File)
   * @returns O 'Key' (caminho completo) do arquivo no bucket (ex: "uploads/arquivo-uuid.png")
   */
  async uploadArquivo(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');

    // 1. Gera o nome de arquivo único
    const uniqueFileName = `${uuidv4()}.${file.originalname.split('.').pop()}`;

    // 2. [CORREÇÃO] Define o caminho completo (Key) no bucket, incluindo a pasta 'uploads'
    const filePath = `uploads/${uniqueFileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filePath, // Usa o caminho completo (ex: "uploads/imagem.png")
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // 3. [CORREÇÃO] Retorna o caminho completo para ser salvo no banco
      return filePath;
    } catch (error) {
      console.error('Erro ao fazer upload para o R2:', error);
      throw new InternalServerErrorException('Falha ao enviar o arquivo.');
    }
  }

  /**
   * Deleta um arquivo do bucket do Cloudflare R2.
   * @param fileName O 'Key' (caminho completo) do objeto no bucket (ex: "uploads/arquivo-uuid.png")
   */
  async deletarArquivo(fileName: string): Promise<void> {
    // O 'fileName' recebido do banco JÁ DEVE SER o 'Key' completo (ex: "uploads/arquivo.png")
    // Se não for, ou for um placeholder, pula a deleção.
    if (!fileName || fileName.includes('default-') || !fileName.includes('/')) {
      console.log(`Pulando deleção do arquivo: ${fileName}`);
      return;
    }

    const bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName, // Usa o 'fileName' (path completo) como Key para deletar
      });

      await this.s3Client.send(command);
      console.log(`Arquivo ${fileName} deletado do R2 com sucesso.`);
    } catch (error) {
      console.error(`Erro ao deletar o arquivo ${fileName} do R2:`, error);
      // É uma decisão de negócio não relançar o erro.
      // Isso permite que o registro no banco de dados seja deletado
      // mesmo que a exclusão do arquivo no R2 falhe.
    }
  }
}