import { IsNotEmpty, IsString } from "class-validator";

export class CreateVoluntarioDto {
    
    @IsString()
    @IsNotEmpty()
    motivo: string;
    
    @IsString()
    @IsNotEmpty()
    status: string;

}
