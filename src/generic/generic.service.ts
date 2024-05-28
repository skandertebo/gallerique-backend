import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOneOptions,
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
  protected readonly repository: Repository<Entity>;
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
    const res = await this.repository.save(item);
    return res;
  }

  async update(id: number, data: UDTO): Promise<Entity> {
    let entity = await this.findOne(id);
    entity = this.repository.merge(entity, data);
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    await this.repository.softDelete(id);
    return true;
  }

  async findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<Entity[]> {
    const queryBuilder = this.repository.createQueryBuilder();
    return this.paginate(queryBuilder.select(), page, limit);
  }

  async findOne(id: number, options?: FindOneOptions<Entity>): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
      ...options,
    });
    if (!entity) throw new Error(`Entity with id:${id} was not found`);
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

  async save(entity: Entity): Promise<Entity> {
    return this.repository.save(entity);
  }
}
