import { Type } from '@nestjs/common';
import { Resolver, Args, Int, Mutation, Query } from '@nestjs/graphql';
import { DeepPartial } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import GenericService from './generic.service';
import GenericEntity from './generic.entity';

export function BaseResolver<
  T extends Type<GenericEntity>,
  C extends DeepPartial<T>,
  U extends QueryDeepPartialEntity<T>,
>(entity: T, createInputType: C, updateInputType: U): any {
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    protected constructor(
      private readonly BaseService: GenericService<
        T extends GenericEntity ? T : never
      >,
    ) {}

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
    @Mutation(() => entity, { name: `create${capitalize(entity.name)}` })
    create(
      @Args({
        type: () => createInputType,
        name: `create${capitalize(entity.name)}Input`,
      })
      createInput: DeepPartial<T extends GenericEntity ? T : never>,
    ): Promise<T | boolean> {
      return this.BaseService.create(createInput);
    }

    @Mutation(() => entity, { name: `update${capitalize(entity.name)}` })
    update(
      @Args({
        type: () => updateInputType,
        name: `update${capitalize(entity.name)}Input`,
      })
      updateInput: DeepPartial<T extends GenericEntity ? T : never>,
      id: number,
    ) {
      return this.BaseService.update(id, updateInput);
    }

    @Mutation(() => entity, { name: `remove${capitalize(entity.name)}` })
    remove(@Args('id', { type: () => Int }) id: number) {
      return this.BaseService.delete(id);
    }
  }
  return BaseResolverHost;
}
function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
