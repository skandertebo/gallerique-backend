import { Injectable } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
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
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
    });
  }
}
