import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
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

  async uploadArquivo(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    const fileName = `${uuidv4()}.${file.originalname.split('.').pop()}`;

    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });
      await this.s3Client.send(command);
      return fileName;
    } catch (error) {
      console.error('Erro ao fazer upload para o R2:', error);
      throw new InternalServerErrorException('Falha ao enviar o arquivo.');
    }
  }

  /**
   * Deleta um arquivo do bucket do Cloudflare R2.
   * @param fileName O nome do arquivo a ser deletado (a Key do objeto no bucket)
   */
  async deletarArquivo(fileName: string): Promise<void> {
    // Não tente deletar se o nome do arquivo for nulo, indefinido ou um placeholder
    if (!fileName || fileName.includes('default-')) {
      return;
    }

    const bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });
      await this.s3Client.send(command);
    } catch (error) {
      console.error(`Erro ao deletar o arquivo ${fileName} do R2:`, error);
      // Opcional: Decida se quer lançar um erro ou apenas logar.
      // Não lançar o erro permite que o registro no DB seja deletado mesmo que a exclusão do arquivo falhe.
    }
  }
}