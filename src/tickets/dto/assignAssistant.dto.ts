import { ApiProperty } from '@nestjs/swagger';

export class assignAssistantDTO {
  @ApiProperty()
  assistantIdentityCard: string;
  @ApiProperty()
  assistantName: string;
  @ApiProperty()
  assistantPhone: string;
  @ApiProperty()
  assistantEmail: string;
}
