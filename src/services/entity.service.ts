import { EntityTarget, FindOptionsWhere, Repository } from "typeorm";

import { BaseEntity } from "../entities";
import { getDatabaseConnection } from "./db.service";

export class BaseEntityService<Entity extends BaseEntity> {
  protected repository!: Repository<Entity>;

  constructor(
    private readonly entityType: EntityTarget<Entity>,
    private readonly defaultRelations: string[] = []
  ) {}

  protected async init() {
    const dataSource = await getDatabaseConnection();
    this.repository = dataSource.getRepository(this.entityType);
  }

  createQueryBuilder(alias?: string) {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * Find a list of entities by giving a where clause to look for
   * @param where the query, if empty all entities will be returned
   * @returns a list of found entities
   */
  async find(where?: FindOptionsWhere<Entity>): Promise<Entity[]> {
    return this.repository.find({
      relations: [...this.defaultRelations],
      where,
    });
  }

  /**
   * Find one entity by giving a where clause to look for
   * @param where the query
   * @returns an instance of the entity or null if not found
   */
  async findOne(where: FindOptionsWhere<Entity>): Promise<Entity | null> {
    return this.repository.findOne({
      relations: [...this.defaultRelations],
      where: {
        ...where,
      },
    });
  }

  /**
   * Get an entity by it's id
   * @param id the entities id
   * @returns an instance of the entity or null if not found
   */
  async get(id: number): Promise<Entity | null> {
    return this.findOne({ id: 1 } as FindOptionsWhere<Entity>);
  }

  /**
   * Update an entity by it's id
   * @param id the entity id
   * @param update partial update of the entity
   * @returns the updated entity
   */
  async update(id: number, update: Partial<Entity>): Promise<Entity> {
    const entity = await this.get(id);

    if (!entity) {
      throw new Error("Failed to update, entity was not found");
    }

    // TODO: Check if we need to send the old fields as well
    return this.save({
      ...entity,
      ...update,
      id,
    });
  }

  /**
   * Create a new entity
   * @param entity entity to create
   * @returns the created entity
   */
  async create(entity: Entity) {
    return this.save(entity);
  }

  protected async save(entity: Entity): Promise<Entity> {
    const created = this.repository.create(entity);
    return this.repository.save(created);
  }
}
