import { SortParameter } from 'airtable/lib/query_params';
import { upsert, update, select } from './airtable';
import * as airtable from './airtable';
import { FieldSet } from 'airtable';

describe('upsert', () => {
  it('should update an existing record if it matches the filter', async () => {
    const tableName = 'videos';
    const filterByFormula = '{title} = "Example Video"';
    const record = { title: 'Example Video', views: 100 };

    // Mock the select function to return an existing record
    jest.spyOn(airtable, 'select').mockResolvedValueOnce([{ id: '123', fields: { title: 'Example Video', views: 50 } }]);

    // Mock the update function
    jest.spyOn(airtable, 'update').mockResolvedValueOnce({ id: '123', fields: { title: 'Example Video', views: 100 } });

    const result = await upsert({ tableName, filterByFormula, record });

    expect(result).toEqual({ id: '123', fields: { title: 'Example Video', views: 100 } });
    expect(airtable.select).toHaveBeenCalledWith({ tableName, filterByFormula, maxRecords: 1 });
    expect(airtable.update).toHaveBeenCalledWith({ tableName, recordId: '123', record });
  });

  it('should create a new record if no existing record matches the filter', async () => {
    const tableName = 'videos';
    const filterByFormula = '{title} = "Example Video"';
    const record = { title: 'Example Video', views: 100 };

    // Mock the select function to return an empty array
    jest.spyOn(airtable, 'select').mockResolvedValueOnce([]);

    // Mock the insert function
    jest.spyOn(airtable, 'insert').mockResolvedValueOnce({ id: '456', fields: { title: 'Example Video', views: 100 } });

    const result = await upsert({ tableName, filterByFormula, record });

    expect(result).toEqual({ id: '456', fields: { title: 'Example Video', views: 100 } });
    expect(airtable.select).toHaveBeenCalledWith({ tableName, filterByFormula, maxRecords: 1 });
    expect(airtable.insert).toHaveBeenCalledWith({ tableName, record });
  });
});

describe('update', () => {
  it('should update a record in the specified table', async () => {
    const tableName = 'videos';
    const recordId = '123';
    const record = { title: 'Updated Video', views: 200 };

    // Mock the update function
    jest.spyOn(airtable, 'update').mockResolvedValueOnce({ id: recordId, fields: record });

    const result = await update({ tableName, recordId, record });

    expect(result).toEqual({ id: recordId, fields: record });
    expect(airtable.update).toHaveBeenCalledWith({ tableName, recordId, record });
  });

  it('should throw an error if the update fails', async () => {
    const tableName = 'videos';
    const recordId = '123';
    const record = { title: 'Updated Video', views: 200 };

    // Mock the update function to throw an error
    jest.spyOn(airtable, 'update').mockRejectedValueOnce(new Error('Update failed'));

    await expect(update({ tableName, recordId, record })).rejects.toThrowError('Update failed');
    expect(airtable.update).toHaveBeenCalledWith({ tableName, recordId, record });
  });
});

describe('select', () => {
  it('should retrieve records from the specified table', async () => {
    const tableName = 'videos';
    const filterByFormula = '{title} = "Example Video"';
    const maxRecords = 10;
    const sort = [{ field: 'views', direction: 'desc' }] as SortParameter<FieldSet>[];

    // Mock the select function to return an array of records
    jest.spyOn(airtable, 'select').mockResolvedValueOnce([
      { id: '123', fields: { title: 'Example Video', views: 100 } },
      { id: '456', fields: { title: 'Another Video', views: 200 } },
    ]);

    const result = await select({ tableName, filterByFormula, sort, maxRecords });

    expect(result).toEqual([
      { id: '123', fields: { title: 'Example Video', views: 100 } },
      { id: '456', fields: { title: 'Another Video', views: 200 } },
    ]);
    expect(airtable.select).toHaveBeenCalledWith({ tableName, filterByFormula, sort, maxRecords });
  });

  it('should handle empty result when no records match the filter', async () => {
    const tableName = 'videos';
    const filterByFormula = '{title} = "Nonexistent Video"';

    // Mock the select function to return an empty array
    jest.spyOn(airtable, 'select').mockResolvedValueOnce([]);

    const result = await select({ tableName, filterByFormula });

    expect(result).toEqual([]);
    expect(airtable.select).toHaveBeenCalledWith({ tableName, filterByFormula });
  });

  it('should handle errors when retrieving records', async () => {
    const tableName = 'videos';
    const filterByFormula = '{title} = "Example Video"';

    // Mock the select function to throw an error
    jest.spyOn(airtable, 'select').mockRejectedValueOnce(new Error('Select failed'));

    await expect(select({ tableName, filterByFormula })).rejects.toThrowError('Select failed');
    expect(airtable.select).toHaveBeenCalledWith({ tableName, filterByFormula });
  });
});