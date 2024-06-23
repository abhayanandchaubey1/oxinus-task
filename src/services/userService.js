import { Container } from 'typedi';
import { UserDao } from '../dao';
import {
  HttpException, STATUS, formatErrorResponse,
  formatSuccessResponse, messageResponse
} from '../utils';
const MessageService = require('./messageService');
import { Password } from '../models';

class UserService {
  constructor() {
    this.txs = Container.get('DbTransactions');
    this.dao = Container.get(UserDao);
  }

  async deleteUserProfile(req, updatedBy) {
    return this.txs.withTransaction(async (client) => {

      const messageKey = 'deleteUser';

      try {
        const success = await this.dao.deleteUserById(client, req.params.id);
        if (!success) {
          throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToDelete'));
        }
      } catch {
        throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToDelete'));
      }
      return messageResponse(formatSuccessResponse("deleteUser", "success"));
    });
  }

  async updateUser(client, dto, updatedBy) {
    const messageKey = 'updateUser';
    const updateUserDto = UserService.updateUserDto(updatedBy, dto);
    if (await this.dao.findDuplicate(client, updateUserDto, dto.id)) {
      throw new HttpException.Conflict(formatErrorResponse(messageKey, 'duplicateUser'));
    }
    try {
      const success = await this.dao.updateUser(client, updateUserDto);
      if (!success) {
        throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
      }
    } catch {
      throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    }
    return this.findUserById(client, dto.id);
  }

  async createUser(client, dto, createdBy) {
    const messageKey = 'createUser';
    if (await this.dao.findDuplicate(client, dto)) {
      throw new HttpException.Conflict(formatErrorResponse(messageKey, 'duplicateUser'));
    }

    try {
      const createUserDto = await UserService.createUserDto(dto, createdBy);
      const id = await this.dao.createUser(client, createUserDto);
      await this.dao.attachRole(client, id, dto.role);
      await MessageService.sendEmail(dto);
      const user = this.findUserById(client, id);
      return user;
    } catch (err) {
      console.log(err);
      throw new HttpException.BadRequest(formatErrorResponse(messageKey, 'unableToCreate'));
    }
  }

  async updateUser(client, dto, updatedBy) {
    const messageKey = 'updateUser';
    try {
      const updateUserDto = UserService.updateUserDto(dto, updatedBy);
      const success = await this.dao.updateUser(client, updateUserDto);
      if (!success) throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    } catch (err) {
      console.log(err);
      throw new HttpException.NotFound(formatErrorResponse(messageKey, 'unableToUpdate'));
    }
    return await this.findUserById(client, dto.id);
  }

  async markUserLogin(client, userId) {
    const messageKey = 'markUserLogin';
    try {
      await this.dao.markUserLogin(client, userId);
    } catch (error) {
      console.log(error);
      throw new HttpException.ServerError(formatErrorResponse(messageKey, 'unableToMark'));
    }
  }

  async updateUserWrongLoginCount(wrongLoginCount, userId) {
    return this.txs.withTransaction(async (client) => {
      await this.dao.markWrongLoginAttempt(client, wrongLoginCount, userId);
    });
  }

  async findUserById(client, id) {
    return UserService.fromUser(await this.dao.findUserById(client, id));
  }

  async findUserByEmail(client, email) {
    return UserService.fromUser(await this.dao.findUserByEmail(client, email));
  }

  async findPersistedUserById(id) {
    return this.txs.withTransaction(async (client) => {
      const user = await this.findUserById(client, id);
      if (!user) {
        throw new HttpException.NotFound(
          formatErrorResponse('fetchUser', 'notFound'),
        );
      }
      return user;
    });
  }


  async fetchUserProfile(actionUser) {
    return UserService.fromUserProfile(actionUser);
  }

  async modifyUserProfile(updateDto, actionUser) {
    return this.txs.withTransaction(async (client) => {
      const user = await this.updateUser(client, {
        ...updateDto,
        id: actionUser.id,
      }, actionUser.id);
      return UserService.fromUserProfile(user);
    });
  }

  static async createUserDto(dto = {}, createdBy) {
    let hash = null;
    if (dto.password) {
      hash = await new Password(dto.password).hashPassword();
    }
    return {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hash,
      status: STATUS.ACTIVE,
      createdBy,
    };
  }

  static updateUserDto(updatedBy, dto = {}) {
    return {
      id: dto.id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      dialCode: dto.dialCode,
      phone: dto.phone,
      dateOfBirth: getUpdatableDate(dto.dateOfBirth),
      currencyId: dto.currencyId,
      updatedBy,
    };
  }

  static fromUser(user) {
    if (!user) {
      return null;
    }

    return {
      ...user,
    };
  }

  static fromUserProfile(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    };
  }
}


export default UserService;
