import { Injectable, Type } from '@nestjs/common';
import { Resolver, Args, Int, Mutation, Query } from '@nestjs/graphql';
import { DeepPartial } from 'typeorm';
import GenericService from './generic.service';
import GenericEntity from './generic.entity';
import { capitalize } from '../helpers/capitalize';

export function BaseResolver<
  T extends Type<GenericEntity> & GenericEntity,
  C extends DeepPartial<T>,
  U extends DeepPartial<T>,
>(entity: T, createInputType: C, updateInputType: U): any {
  @Resolver({ isAbstract: true })
  @Injectable()
  class BaseResolverHost {
    constructor(private readonly baseService: GenericService<T, C, U>) {
      this.baseService = baseService;
    }

    @Query(() => [entity], {
      name: `get${capitalize(entity.name)}s`,
      nullable: true,
    })
    findAll() {
      return this.baseService.findAll();
    }

    @Query(() => entity, {
      name: `get${capitalize(entity.name)}`,
      nullable: true,
    })
    findOne(@Args('id', { type: () => Int }) id: number) {
      return this.baseService.findOne(id);
    }
    @Mutation(() => entity, { name: `create${capitalize(entity.name)}` })
    create(
      @Args({
        type: () => createInputType,
        name: `create${capitalize(entity.name)}Input`,
      })
      createInput: C,
    ): Promise<T | boolean> {
      return this.baseService.create(createInput);
    }

    @Mutation(() => entity, { name: `update${capitalize(entity.name)}` })
    update(
      @Args({
        type: () => updateInputType,
        name: `update${capitalize(entity.name)}Input`,
      })
      updateInput: U,
      @Args('id', { type: () => Int })
      id: number,
    ) {
      return this.baseService.update(id, updateInput);
    }

    @Mutation(() => Boolean, { name: `remove${capitalize(entity.name)}` })
    remove(@Args('id', { type: () => Int }) id: number) {
      return this.baseService.delete(id);
    }
  }
  return BaseResolverHost;
}
