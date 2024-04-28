import { Injectable, Type } from '@nestjs/common';
import { Resolver, Args, Int, Mutation, Query } from '@nestjs/graphql';
import { DeepPartial } from 'typeorm';
import GenericService from './generic.service';
import GenericEntity from './generic.entity';

export function BaseResolver<
  T extends Type<GenericEntity> & GenericEntity,
  C extends DeepPartial<T>,
  U extends DeepPartial<T>,
>(entity: T, createInputType: C, updateInputType: U): any {
  @Resolver({ isAbstract: true })
  @Injectable()
  class BaseResolverHost {
    constructor(private readonly BaseService: GenericService<T, C, U>) {
      this.BaseService = BaseService;
    }

    @Query(() => [entity], {
      name: `get${capitalize(entity.name)}s`,
      nullable: true,
    })
    findAll() {
      return this.BaseService.findAll();
    }

    @Query(() => entity, {
      name: `get${capitalize(entity.name)}`,
      nullable: true,
    })
    findOne(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.findOne(id);
    }
    @Mutation(() => entity, { name: `create${capitalize(entity.name)}` })
    create(
      @Args({
        type: () => createInputType,
        name: `create${capitalize(entity.name)}Input`,
      })
      createInput: C,
    ): Promise<T | boolean> {
      return this.BaseService.create(createInput);
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
      return this.BaseService.update(id, updateInput);
    }

    @Mutation(() => Boolean, { name: `remove${capitalize(entity.name)}` })
    remove(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.delete(id);
    }
  }
  return BaseResolverHost;
}
function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
