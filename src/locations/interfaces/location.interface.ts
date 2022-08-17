import { ApiProperty } from '@nestjs/swagger';

export class Location {
  @ApiProperty()
  _id?: string;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  name: string;
  @ApiProperty()
  total: number;
  @ApiProperty()
  available: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
