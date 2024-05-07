import { upsert } from './airtable';
import * as airtable from './airtable';

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