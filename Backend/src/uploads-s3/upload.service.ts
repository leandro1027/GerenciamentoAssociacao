import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    // Inicializa o cliente S3 com as credenciais do .env
    // Ele aponta para o endpoint do Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto', // Região padrão para o R2
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
   * Envia um arquivo para o bucket do Cloudflare R2.
   * @param file O arquivo recebido via Multer (Express.Multer.File)
   * @returns A URL pública do arquivo enviado.
   */
  async uploadArquivo(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.getOrThrow<string>('R2_BUCKET_NAME');
    
    // Gera um nome de arquivo único para evitar sobreposições
    // Ex: "avatars/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6.jpg"
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;

    try {
      // Cria o comando para enviar o objeto (arquivo)
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName, // O nome do arquivo no bucket
        Body: file.buffer, // O conteúdo do arquivo
        ContentType: file.mimetype, // O tipo do arquivo (ex: 'image/jpeg')
      });

      // Envia o comando para o S3 (R2)
      await this.s3Client.send(command);

      // Constrói a URL pública do arquivo
      // ATENÇÃO: Você precisa configurar seu bucket para ser acessível publicamente.
      // A URL pública padrão do R2 não existe, você precisa conectar um domínio.
      // Vamos retornar o nome do arquivo por enquanto.
      // A melhor prática é servir os arquivos através de um domínio seu conectado ao R2.
      // Ex: `https://seus-arquivos.seudominio.com/${fileName}`
      // Por enquanto, vamos retornar o nome do arquivo para ser salvo no banco.
      return fileName; 

    } catch (error) {
      console.error('Erro ao fazer upload para o R2:', error);
      throw new InternalServerErrorException('Falha ao enviar o arquivo.');
    }
  }
}