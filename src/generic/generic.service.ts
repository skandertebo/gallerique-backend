import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
  DeepPartial,
  FindOptionsWhere,
  In,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import GenericEntity from './generic.entity';

interface ObservableMessage<Entity extends GenericEntity> {
  scope: string;
  payload: Entity;
}

@Injectable()
export default class GenericService<
  Entity extends GenericEntity,
  CDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
  UDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> {
  public scope: string = 'general';
  private readonly repository: Repository<Entity>;
  public readonly observable: Subject<ObservableMessage<Entity>>;
  constructor(repository: Repository<Entity>) {
    this.repository = repository;
    this.observable = new Subject<ObservableMessage<Entity>>();
  }

  public emit(message: ObservableMessage<Entity>) {
    this.observable.next(message);
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
    this.emit({ scope: `${this.scope}.create`, payload: res });
    return res;
  }

  async update(id: number, data: UDTO): Promise<Entity> {
    let entity = await this.findOne(id);
    entity = this.repository.merge(entity, data);
    this.emit({ scope: `${this.scope}.update`, payload: entity });
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<boolean> {
    await this.repository.delete(id);
    return true;
  }

  async findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
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
