import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import GenericEntity from './generic.entity';

@Injectable()
export default class GenericService<
  Entity extends GenericEntity,
  CDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
  UDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> {
  private readonly repository: Repository<Entity>;
  constructor(repository: Repository<Entity>) {
    this.repository = repository;
  }

  async findByIds(ids: number[]): Promise<Entity[]> {
    const entities = await this.repository.findBy({
      id: In(ids),
    } as FindOptionsWhere<Entity>);

    if (entities.length != ids.length) {
      const foundIds = entities.map((entity) => entity.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Entities with IDs ${missingIds.join(', ')} not found`,
      );
    }
    return entities;
  }
  async create(data: CDTO): Promise<Entity> {
    const item = this.repository.create(data);
    return this.repository.save(item);
  }

  async update(id: number, data: UDTO): Promise<Entity> {
    return this.repository.save({ ...data, id });
  }

  async delete(id: number) {
    return this.repository.delete(id);
  }

  async findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Entity> {
    const entity = this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
    });
    if (!entity)
      throw new NotFoundException(`Entity with id:${id} was not found`);
    return entity;
  }

  async paginate(
    queryBuilder: SelectQueryBuilder<Entity>,
    page: number = 1,
    limit: number = 10,
  ): Promise<Entity[]> {
    const results = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    return results;
  }
}
