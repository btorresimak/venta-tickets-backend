import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty()
  assistantIdentityCard: string;
  @ApiProperty()
  assistantName: string;
  @ApiProperty()
  assistantPhone: string;
  @ApiProperty()
  assistantEmail: string;
  @ApiProperty()
  hasAssistant: boolean;
  @ApiProperty()
  location: string;
  @ApiProperty()
  isVerified: boolean;
  @ApiProperty()
  verifiedBy: string;
}
