import { HttpStatus } from '@nestjs/common';
import { ErrorData } from '../interfaces';

export const getError = (error: any): ErrorData => {
  if (error.response) {
    const response = error.response;
    switch (error.status) {
      case 400:
      case 401:
      case 403:
      case 404:
        return response;
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ha ocurrido un error al procesar la solicitud',
          error: 'Error interno',
        };
    }
  }

  if (error.name) {
    switch (error.name) {
      case 'CastError':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `El campo ${error.path} no tiene el formato correcto`,
          error: 'Formato de datos incorrecto',
        };
      case 'ValidationError':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `${error.message}`,
          error: 'Datos inválidos',
        };

      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Ha ocurrido un error en la base de datos`,
          error: 'Error de BD',
        };
    }
  }

  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: `Ha ocurrido un error. Si persiste contacte a soporte técnico`,
    error: 'Internal Server Error',
  };
};
