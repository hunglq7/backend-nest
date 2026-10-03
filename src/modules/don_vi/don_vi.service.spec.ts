import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { DonViService } from './don_vi.service';
import { DonVi } from './entities/don_vi.entity';

describe('DonViService', () => {
  let service: DonViService;
  let repository: {
    findAndCount: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findAndCount: jest.fn(),
      find: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonViService,
        {
          provide: getRepositoryToken(DonVi),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<DonViService>(DonViService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters and paginates units on the database', async () => {
    const units = [{ id: 2, name: 'Đơn vị 2' }] as DonVi[];
    repository.findAndCount.mockResolvedValue([units, 21]);

    const result = await service.findAll({
      page: 2,
      limit: 10,
      search: 'đơn vị',
    });

    expect(repository.findAndCount).toHaveBeenCalledWith({
      where: { name: Like('%đơn vị%') },
      order: { id: 'ASC' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual({
      data: units,
      total: 21,
      page: 2,
      limit: 10,
      totalPages: 3,
    });
  });

  it('returns the last available page when the requested page is out of range', async () => {
    const lastPageUnits = [{ id: 11, name: 'Đơn vị 11' }] as DonVi[];
    repository.findAndCount.mockResolvedValue([[], 11]);
    repository.find.mockResolvedValue(lastPageUnits);

    const result = await service.findAll({
      page: 3,
      limit: 10,
    });

    expect(repository.find).toHaveBeenCalledWith({
      where: undefined,
      order: { id: 'ASC' },
      skip: 10,
      take: 10,
    });
    expect(result).toEqual({
      data: lastPageUnits,
      total: 11,
      page: 2,
      limit: 10,
      totalPages: 2,
    });
  });
});
