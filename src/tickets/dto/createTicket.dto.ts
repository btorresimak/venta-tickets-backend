import { ApiProperty } from '@nestjs/swagger';

export class AssistantDTO {
  @ApiProperty()
  identityCard: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
}

export class createTicketDTO {
  @ApiProperty()
  clientIdentityCard: string;
  @ApiProperty()
  clientName: string;
  @ApiProperty()
  clientPhone: string;
  @ApiProperty()
  clientEmail: string;
  @ApiProperty()
  paymentMethod: string;
  @ApiProperty()
  paymentDetails: any;
  @ApiProperty()
  invoiceDetails: any;
  @ApiProperty()
  collectionType: string;
  @ApiProperty({ type: [AssistantDTO] })
  assistants: AssistantDTO[];
  @ApiProperty()
  location: string;
  @ApiProperty()
  isVerified: boolean;
  @ApiProperty()
  verifiedBy: string;
}
