import { Account } from '../models/Account';
import { getDbConnection } from './connection';

export class AccountRepository {
    static async createAccount(accountData: { name: string }): Promise<Account> {
        const connection = await getDbConnection();
        const query = `INSERT INTO Account (Name, CreatedAt, UpdatedAt) OUTPUT INSERTED.* VALUES (@name, GETUTCDATE(), GETUTCDATE())`;
        const result = await connection.request()
            .input('name', accountData.name)
            .query(query);

        return new Account(result.recordset[0].Id, result.recordset[0].Name, result.recordset[0].CreatedAt, result.recordset[0].UpdatedAt);
    }
}
