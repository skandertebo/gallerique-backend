import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { DeepPartial, Repository } from 'typeorm';
import GenericEntity from './generic.entity';
import GenericService from './generic.service';

interface ObservableMessage<Entity extends GenericEntity> {
  scope: string;
  payload: Entity;
  requestId?: string;
}

@Injectable()
export default class GenericServiceWithObservable<
  Entity extends GenericEntity,
  CDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
  UDTO extends DeepPartial<Entity> = DeepPartial<Entity>,
> extends GenericService<Entity, CDTO, UDTO> {
  public scope: string = 'general';
  public readonly observable: Subject<ObservableMessage<Entity>>;
  constructor(repository: Repository<Entity>) {
    super(repository);
    this.observable = new Subject<ObservableMessage<Entity>>();
  }
  public emit(message: ObservableMessage<Entity>) {
    this.observable.next(message);
  }
}
