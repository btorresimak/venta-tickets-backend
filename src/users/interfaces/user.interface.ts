import { ApiProperty } from '@nestjs/swagger';
import { Profile } from '../../profiles/interfaces';

export class User {
  @ApiProperty()
  _id?: string;
  @ApiProperty()
  isActive: boolean;
  @ApiProperty()
  name: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  profile: string | Profile;
}
