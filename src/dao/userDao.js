import moment from 'moment';
import {
  PasswordHash, userUpdateMap, userDetailsUpdateMap,
} from '../models';
import { Role } from '../auth';
import {  QueryBuilder, Mapper, Queries,
  parserId, parserDate, parserInteger, } from './helper';

class UserDao {
  accountJoins = `LEFT JOIN account_roles ur ON ur.account_id = u.id
                  LEFT JOIN roles r ON r.id = ur.role_id
                  LEFT JOIN account_details ud ON ud.account_id = u.id
                  LEFT JOIN account_login_details uld ON uld.account_id = u.id\n`;

  accountQuery = `SELECT u.id,u.email,u.password,u.status,u.created_on,r.name as role, ud.first_name,
                ud.last_name,uld.wrong_login_count, uld.last_wrong_login_attempt, uld.last_login
                FROM accounts u\n${this.accountJoins}`;


  async createUser(client, createUserDto, createdBy) {
    const res = await client.query(`INSERT INTO accounts 
      (email, password, status, created_by, updated_by) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [createUserDto.email, createUserDto.password,
      createUserDto.status, createdBy, createdBy]);
    const userId = Mapper.getId(res);

    const detailsCreatedBy = createdBy || userId;

    await client.query(`INSERT INTO account_details
      (account_id, first_name, last_name, created_by, updated_by)
      VALUES ($1, $2, $3, $4, $5)`,
    [userId, createUserDto.firstName, createUserDto.lastName, 
      detailsCreatedBy, detailsCreatedBy]);

    return userId;
  }

  async updateUser(client, updateUserDto) {
    const { sql: sql1, args: args1 } = Queries.updaterFor('accounts', userUpdateMap, updateUserDto);
    const res1 = await client.query(sql1, args1);

    const { sql: sql2, args: args2 } = Queries.updaterFor('account_details', userDetailsUpdateMap,
      updateUserDto, 'account_id');
    const res2 = await client.query(sql2, args2);

    return ((res1.rowCount === 1) && (res2.rowCount === 1));
  }

  async findUserByEmail(client, email) {
    const qb = new QueryBuilder(`${this.accountQuery} WHERE u.email = ?`, [email]);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getUnique(res, UserDao.mapUserWithRoles);
  }

  async findUserById(client, id) {
    const qb = new QueryBuilder(`${this.accountQuery} WHERE u.id = ?`, [id]);
    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getUnique(res, UserDao.mapUserWithRoles);
  }

  async markUserLogin(client, userId) {
    const hasLoginDetails = await this.hasLoginDetails(client, userId);
    let res;
    const values = [moment(), 0, null, userId];
    if (hasLoginDetails) {
      res = await client.query(`UPDATE account_login_details 
        SET last_login = $1, wrong_login_count = $2,
        last_wrong_login_attempt = $3 WHERE account_id = $4`, values);
    } else {
      res = await client.query(`INSERT INTO account_login_details 
        (last_login, wrong_login_count, last_wrong_login_attempt,account_id) 
        VALUES ($1,$2,$3,$4)`, values);
    }
    return res.rowCount === 1;
  }

  async markWrongLoginAttempt(client, wrongLoginCount, userId) {
    const hasLoginDetails = await this.hasLoginDetails(client, userId);
    let res;
    const values = [wrongLoginCount, moment(), userId];
    if (hasLoginDetails) {
      res = await client.query(`UPDATE account_login_details 
        SET wrong_login_count = $1, last_wrong_login_attempt = $2 
        WHERE account_id = $3`, values);
    } else {
      res = await client.query(`INSERT INTO account_login_details 
        (wrong_login_count, last_wrong_login_attempt, account_id) 
        VALUES ($1, $2, $3)`, values);
    }
    return res.rowCount === 1;
  }

  async hasLoginDetails(client, userId) {
    const res = await client.query(`SELECT account_id as id FROM account_login_details 
      WHERE account_id = $1`, [userId]);
    return Mapper.getId(res) !== 0;
  }

  async deleteUserById(client, id) {
    const res = await client.query('DELETE FROM accounts WHERE id = $1', [id]);
    return res.rowCount === 1;
  }

  async attachRole(client, userId, role) {
    const res = await client.query(`INSERT INTO account_roles (account_id, role_id)
      VALUES ($1,(SELECT id FROM roles WHERE name = $2))`, [userId, role]);
    return res.rowCount === 1;
  }

  async findDuplicate(client, user, ignoreId) {
    const qb = new QueryBuilder(`SELECT id FROM accounts 
      WHERE email = ?\n`, [user.email]);

    if (ignoreId) {
      qb.append('AND id != ?', [ignoreId]);
    }

    const { sql, args } = qb.build();
    const res = await client.query(sql, args);
    return Mapper.getId(res) !== 0;
  }

  async addThirdPartyLogin(client, userId, socialId, registeredFrom) {
    const values = [userId, socialId, registeredFrom];

    await client.query(`DELETE FROM account_third_party_logins 
    WHERE account_id = $1 AND social_id = $2 AND registered_from = $3`, values);

    const res = await client.query(`INSERT INTO account_third_party_logins 
    (account_id, social_id, registered_from) 
    VALUES ($1, $2, $3)`, values);
    return res.rowCount === 1;
  }

  static mapUserWithRoles = (rows) => {
    const firstRow = rows[0];
    const rolesSet = new Set();

    rows.forEach((row) => {

      if (row.role) {
        rolesSet.add(row.role);
      }
    });

    const roles = Array.from(rolesSet).map((role) => (new Role(role)));


    return {
      id: parserId(firstRow.id),
      email: firstRow.email,
      passwordHash: firstRow.password ? new PasswordHash(firstRow.password) : null,
      status: firstRow.status,
      firstName: firstRow.first_name,
      lastName: firstRow.last_name,
      wrongLoginCount: parserInteger(firstRow.wrong_login_count),
      lastWrongLoginAttempt: parserDate(firstRow.last_wrong_login_attempt),
      lastLogin: parserDate(firstRow.last_login),
      createdOn: parserDate(firstRow.created_on),
      roles,
    };
  }
}


export default UserDao;
