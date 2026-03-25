import asistenciaRepo from '../repositories/asistencia.repository';
import claseRepo from '../repositories/clase.repository';
import { RegistrarAsistenciaDTO } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class AsistenciaService {
  async registrar(clase_id: number, dto: RegistrarAsistenciaDTO): Promise<void> {
    const clase = await claseRepo.findById(clase_id);
    if (!clase) throw new NotFoundError('Clase');

    if (dto.asistencias.length === 0) {
      throw new BadRequestError('Debés incluir al menos un registro de asistencia.');
    }

    await asistenciaRepo.upsertMany(clase_id, dto);
  }

  async getByClase(clase_id: number): Promise<unknown[]> {
    const clase = await claseRepo.findById(clase_id);
    if (!clase) throw new NotFoundError('Clase');
    return asistenciaRepo.findByClase(clase_id);
  }
}

export const asistenciaService = new AsistenciaService();
