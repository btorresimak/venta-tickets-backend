import { ApiProperty } from '@nestjs/swagger';

export class Venta {
  @ApiProperty()
  _id?: string;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  number: string;
  @ApiProperty()
  location: string;
  @ApiProperty()
  clientId: string;
  @ApiProperty()
  paymentMethod: string;
  @ApiProperty()
  paymentDetails: any;
  @ApiProperty()
  collectionType: string;
  @ApiProperty()
  issuedDate: Date;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  assistantId: string;
}