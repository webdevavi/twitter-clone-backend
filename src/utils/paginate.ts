import { SelectQueryBuilder } from "typeorm";

export async function paginate<T>({
  queryBuilder,
  limit = 20,
  index,
  lastIndex,
  max = 50,
}: {
  queryBuilder: SelectQueryBuilder<T>;
  index: string;
  limit?: number;
  lastIndex?: number;
  max?: number;
}) {
  const realLimit = Math.min(max, limit);
  const realLimitPlusOne = realLimit + 1;

  queryBuilder.take(realLimitPlusOne).orderBy({ [index]: "DESC" });

  if (lastIndex) {
    queryBuilder.andWhere(`${index} < ${lastIndex}`);
  }

  const data = (await queryBuilder.execute()) as T[];

  return {
    data: data?.slice(0, realLimit),
    hasMore: data?.length === realLimitPlusOne,
  };
}
